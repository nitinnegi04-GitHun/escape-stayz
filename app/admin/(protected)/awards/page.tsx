'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../../lib/supabase';
import { compressImage } from '../../../../lib/imageCompression';

interface Pointer {
    text: string;
}

interface Award {
    id: string;
    title: string;
    image_url: string;
    storage_path: string;
    pointers: Pointer[];
    display_order: number;
    created_at: string;
}

export default function AdminAwardsPage() {
    const [awards, setAwards] = useState<Award[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [editingAward, setEditingAward] = useState<Award | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchAwards(); }, []);

    const fetchAwards = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('awards')
            .select('*')
            .order('display_order', { ascending: true });
        if (!error) setAwards(data || []);
        setLoading(false);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                let uploadFile = file;
                try { uploadFile = await compressImage(file); } catch { /* use original */ }

                const uniqueId = Math.random().toString(36).substring(2, 8);
                const timestamp = Date.now();
                const safeName = uploadFile.name.replace(/\.[^/.]+$/, '').replace(/\W/g, '_').substring(0, 30);
                const filename = `${timestamp}-${uniqueId}-${safeName}.webp`;
                const path = `awards/${filename}`;

                const { error: upErr } = await supabase.storage.from('gallery').upload(path, uploadFile);
                if (upErr) throw upErr;

                const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);

                const res = await fetch('/api/admin/awards', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: file.name.split('.')[0],
                        image_url: publicUrl,
                        storage_path: path,
                        pointers: [],
                        display_order: awards.length + i,
                    }),
                });

                if (!res.ok) {
                    const { error } = await res.json();
                    throw new Error(error || 'Upload failed');
                }

                setUploadProgress(Math.round(((i + 1) / files.length) * 100));
            } catch (err: any) {
                alert(`Upload failed for ${file.name}: ${err.message}`);
            }
        }

        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchAwards();
    };

    const handleSave = async () => {
        if (!editingAward) return;
        setIsSaving(true);
        const res = await fetch(`/api/admin/awards/${editingAward.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: editingAward.title,
                pointers: editingAward.pointers,
            }),
        });
        setIsSaving(false);
        if (!res.ok) {
            const { error } = await res.json();
            alert(`Save failed: ${error}`);
            return;
        }
        setEditingAward(null);
        fetchAwards();
    };

    const handleDelete = async (award: Award) => {
        if (!window.confirm(`Delete "${award.title}"? This cannot be undone.`)) return;
        setDeletingId(award.id);
        const res = await fetch(`/api/admin/awards/${award.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storage_path: award.storage_path }),
        });
        setDeletingId(null);
        if (!res.ok) {
            const { error } = await res.json();
            alert(`Delete failed: ${error}`);
            return;
        }
        fetchAwards();
    };

    const moveAward = async (award: Award, direction: 'up' | 'down') => {
        const idx = awards.findIndex(a => a.id === award.id);
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= awards.length) return;

        const swapAward = awards[swapIdx];
        await Promise.all([
            fetch(`/api/admin/awards/${award.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ display_order: swapAward.display_order }),
            }),
            fetch(`/api/admin/awards/${swapAward.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ display_order: award.display_order }),
            }),
        ]);
        fetchAwards();
    };

    const addPointer = () => {
        if (!editingAward) return;
        setEditingAward({ ...editingAward, pointers: [...editingAward.pointers, { text: '' }] });
    };

    const updatePointer = (idx: number, value: string) => {
        if (!editingAward) return;
        const updated = editingAward.pointers.map((p, i) => i === idx ? { text: value } : p);
        setEditingAward({ ...editingAward, pointers: updated });
    };

    const removePointer = (idx: number) => {
        if (!editingAward) return;
        setEditingAward({ ...editingAward, pointers: editingAward.pointers.filter((_, i) => i !== idx) });
    };

    return (
        <>
            <div className="space-y-8 min-h-[80vh]">
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-charcoal/5">
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/30 mb-1">Admin</p>
                        <h2 className="text-xl font-serif italic text-charcoal">Awards & Recognition</h2>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-forest text-white px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-forest/20 hover:bg-forest/90 transition-all"
                        >
                            <i className="fas fa-upload mr-2"></i> Upload Award
                        </button>
                        <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : awards.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-charcoal/10 rounded-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/20">No Awards Yet</p>
                        <p className="text-xs text-charcoal/30 mt-2">Upload award images to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {awards.map((award, idx) => (
                            <div key={award.id} className="group bg-white rounded-2xl overflow-hidden border border-charcoal/5 shadow-sm hover:shadow-xl transition-all flex flex-col">
                                <div className="aspect-[4/3] relative overflow-hidden bg-charcoal/5">
                                    <img src={award.image_url} alt={award.title} className="w-full h-full object-cover" />
                                    {/* Order badge */}
                                    <div className="absolute top-3 left-3 bg-charcoal/80 text-white text-[9px] font-bold px-2 py-1 rounded-lg">
                                        #{idx + 1}
                                    </div>
                                    {/* Reorder buttons */}
                                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => moveAward(award, 'up')}
                                            disabled={idx === 0}
                                            className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-white transition-all shadow-sm"
                                        >
                                            <i className="fas fa-chevron-up text-[8px] text-charcoal"></i>
                                        </button>
                                        <button
                                            onClick={() => moveAward(award, 'down')}
                                            disabled={idx === awards.length - 1}
                                            className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-white transition-all shadow-sm"
                                        >
                                            <i className="fas fa-chevron-down text-[8px] text-charcoal"></i>
                                        </button>
                                    </div>
                                    {deletingId === award.id && (
                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex items-center justify-between border-t border-charcoal/5">
                                    <div className="truncate pr-2">
                                        <p className="text-[10px] font-bold uppercase text-charcoal truncate">{award.title}</p>
                                        <p className="text-[8px] text-charcoal/30 uppercase tracking-widest">{award.pointers.length} pointer{award.pointers.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => setEditingAward({ ...award })}
                                            className="w-8 h-8 rounded-full bg-charcoal/5 text-charcoal/40 hover:bg-forest hover:text-white flex items-center justify-center transition-all"
                                        >
                                            <i className="fas fa-pen text-[9px]"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(award)}
                                            className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                                        >
                                            <i className="fas fa-trash-alt text-[9px]"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload overlay */}
            {isUploading && (
                <div className="fixed inset-0 z-[200] bg-charcoal/90 backdrop-blur-md flex flex-col items-center justify-center text-white">
                    <h3 className="text-3xl font-serif italic mb-6">Uploading Awards</h3>
                    <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-forest transition-all" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">{uploadProgress}% Complete</p>
                </div>
            )}

            {/* Edit panel */}
            {editingAward && (
                <div className="fixed inset-0 z-[210] flex items-center justify-end">
                    <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={() => setEditingAward(null)}></div>
                    <div className="bg-white w-full max-w-md h-full p-10 relative z-10 shadow-2xl flex flex-col overflow-y-auto" style={{ animation: 'slideInRight 0.4s ease both' }}>
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-serif italic">Award Details</h3>
                            <button onClick={() => setEditingAward(null)} className="text-charcoal/20 hover:text-charcoal">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        {/* Preview */}
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-8 bg-charcoal/5">
                            <img src={editingAward.image_url} alt={editingAward.title} className="w-full h-full object-cover" />
                        </div>

                        {/* Title */}
                        <div className="mb-6">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/30 block mb-2">Title</label>
                            <input
                                type="text"
                                value={editingAward.title}
                                onChange={e => setEditingAward({ ...editingAward, title: e.target.value })}
                                className="w-full bg-charcoal/5 rounded-xl px-4 py-3 outline-none text-sm font-bold"
                            />
                        </div>

                        {/* Pointers */}
                        <div className="mb-6 flex-grow">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/30 block mb-3">Pointers</label>
                            <div className="space-y-2">
                                {editingAward.pointers.map((pointer, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-terracotta flex-shrink-0"></span>
                                        <input
                                            type="text"
                                            value={pointer.text}
                                            onChange={e => updatePointer(idx, e.target.value)}
                                            placeholder={`Pointer ${idx + 1}`}
                                            className="flex-1 bg-charcoal/5 rounded-xl px-4 py-2.5 outline-none text-sm"
                                        />
                                        <button
                                            onClick={() => removePointer(idx)}
                                            className="w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all flex-shrink-0"
                                        >
                                            <i className="fas fa-times text-[9px]"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={addPointer}
                                className="mt-3 w-full py-2.5 border border-dashed border-charcoal/20 rounded-xl text-[9px] font-bold uppercase tracking-widest text-charcoal/40 hover:border-forest hover:text-forest transition-all"
                            >
                                + Add Pointer
                            </button>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-forest text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Apply Changes'}
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
            `}</style>
        </>
    );
}
