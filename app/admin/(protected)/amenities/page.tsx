
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { HOTEL_ICON_MAP } from '../../../../components/Admin/hotelIcons';
import { IconPicker } from '../../../../components/Admin/IconPicker';

interface Amenity {
    id: string;
    name: string;
    icon: string;
    created_at: string;
}

export default function AdminAmenitiesPage() {
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentAmenity, setCurrentAmenity] = useState<Partial<Amenity>>({});
    const [isSaving, setIsSaving] = useState(false);

    const fetchAmenities = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('amenities').select('*').order('name');
            if (error) throw error;
            setAmenities(data || []);
        } catch (err: any) {
            console.error('Fetch Amenities Error:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAmenities(); }, []);

    const handleEdit = (amenity: Amenity) => {
        setCurrentAmenity(amenity);
        setIsEditorOpen(true);
    };

    const handleNew = () => {
        setCurrentAmenity({ name: '', icon: '' });
        setIsEditorOpen(true);
    };

    const saveAmenity = async () => {
        if (!currentAmenity.name || !currentAmenity.icon) return;
        setIsSaving(true);
        try {
            const payload = { name: currentAmenity.name, icon: currentAmenity.icon };
            const { error } = await supabase
                .from('amenities')
                .upsert(currentAmenity.id ? { ...payload, id: currentAmenity.id } : payload)
                .select();
            if (error) throw error;
            setIsEditorOpen(false);
            fetchAmenities();
        } catch (err: any) {
            alert(`Error saving amenity: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const deleteAmenity = async (id: string, name: string) => {
        if (!confirm(`Permanently delete "${name}"?`)) return;
        try {
            const { error } = await supabase.from('amenities').delete().eq('id', id);
            if (error) throw error;
            fetchAmenities();
        } catch (err: any) {
            alert(`Error deleting amenity: ${err.message}`);
        }
    };

    return (
        <>
            <div className="bg-white rounded-3xl shadow-sm border border-charcoal/5 overflow-hidden min-h-[80vh]">
                <div className="p-6 border-b border-charcoal/5 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h3 className="text-lg font-serif italic">Amenities Master List</h3>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/30 mt-1">{amenities.length} Amenities Configured</p>
                    </div>
                    <button onClick={handleNew} className="bg-forest text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-forest/20 hover:scale-105 transition-all">
                        + New Amenity
                    </button>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="text-center py-20 text-charcoal/40 text-sm">Loading amenities...</div>
                    ) : amenities.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-charcoal/10 rounded-2xl">
                            <p className="text-charcoal/30 text-sm font-bold uppercase tracking-widest">No amenities yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {amenities.map(amenity => {
                                const IconComponent = HOTEL_ICON_MAP[amenity.icon];
                                return (
                                    <div key={amenity.id} className="group bg-white p-6 rounded-2xl border border-charcoal/5 hover:border-forest/20 hover:shadow-xl transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-forest/5 text-forest flex items-center justify-center">
                                                {IconComponent ? <IconComponent size={22} /> : <span className="text-xs text-charcoal/30">?</span>}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-charcoal text-sm">{amenity.name}</h4>
                                                <p className="text-[9px] text-charcoal/40 font-mono mt-1">{amenity.icon}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(amenity)} className="w-8 h-8 rounded-full bg-charcoal/5 text-charcoal/40 hover:bg-forest hover:text-white flex items-center justify-center transition-all">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                            </button>
                                            <button onClick={() => deleteAmenity(amenity.id, amenity.name)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {isEditorOpen && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-md" onClick={() => setIsEditorOpen(false)}></div>
                    <div className="bg-white w-full max-w-xl rounded-3xl relative z-10 shadow-2xl scale-in-center flex flex-col max-h-[90vh] overflow-hidden">

                        <div className="px-8 pt-8 pb-5 border-b border-charcoal/5">
                            <h3 className="text-2xl font-serif italic mb-5">{currentAmenity.id ? 'Edit Amenity' : 'New Amenity'}</h3>
                            <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40 block mb-2">Amenity Name</label>
                            <input
                                type="text"
                                value={currentAmenity.name || ''}
                                onChange={e => setCurrentAmenity({ ...currentAmenity, name: e.target.value })}
                                className="w-full bg-charcoal/5 rounded-xl px-5 py-3.5 outline-none text-sm font-bold placeholder-charcoal/20 focus:ring-2 focus:ring-forest/20 transition-all"
                                placeholder="e.g. Swimming Pool"
                                autoFocus
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 py-5 custom-scrollbar">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40 block mb-3">Select Icon</label>
                            <IconPicker
                                value={currentAmenity.icon || ''}
                                onChange={icon => setCurrentAmenity({ ...currentAmenity, icon })}
                            />
                        </div>

                        <div className="px-8 py-5 border-t border-charcoal/5 flex gap-3">
                            <button onClick={() => setIsEditorOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] text-charcoal/40 hover:bg-charcoal/5 transition-colors">
                                Cancel
                            </button>
                            <button onClick={saveAmenity} disabled={isSaving || !currentAmenity.name || !currentAmenity.icon} className="flex-1 bg-forest text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-forest/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSaving ? 'Saving...' : 'Save Amenity'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .scale-in-center { animation: scale-in-center 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
        @keyframes scale-in-center { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
        </>
    );
}
