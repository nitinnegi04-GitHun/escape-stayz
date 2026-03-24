
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../../lib/supabase';
import { compressImage } from '../../../../lib/imageCompression';

interface Folder {
    id: string;
    name: string;
    parent_id?: string | null;
    created_at: string;
}

interface GalleryImage {
    id: string;
    folder_id: string;
    storage_path: string;
    public_url: string;
    title: string;
    alt_text: string;
    description: string;
    tags: string;
    media_type?: 'image' | 'video';
}

export default function AdminGalleryPage() {
    const [folders, setFolders] = useState<Folder[]>([]);         // root folders
    const [subFolders, setSubFolders] = useState<Folder[]>([]);   // children of currentFolder
    const [folderStack, setFolderStack] = useState<Folder[]>([]);  // navigation stack
    const currentFolder = folderStack[folderStack.length - 1] ?? null;

    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [showFolderModal, setShowFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
    const [renamingFolder, setRenamingFolder] = useState<Folder | null>(null);
    const [renameFolderName, setRenameFolderName] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchFolders(); }, []);

    useEffect(() => {
        if (currentFolder) {
            fetchImages(currentFolder.id);
            fetchSubFolders(currentFolder.id);
        } else {
            setImages([]);
            setSubFolders([]);
        }
    }, [currentFolder]);

    const fetchFolders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('gallery_folders')
                .select('*')
                .is('parent_id', null)
                .order('name');
            if (error) throw error;
            setFolders(data || []);
        } catch (err: any) {
            console.error('Folder Sync Error:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubFolders = async (parentId: string) => {
        const { data } = await supabase
            .from('gallery_folders')
            .select('*')
            .eq('parent_id', parentId)
            .order('name');
        setSubFolders(data || []);
    };

    const fetchImages = async (folderId: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('gallery_images')
                .select('*')
                .eq('folder_id', folderId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setImages(data || []);
        } catch (err: any) {
            console.error('Asset Sync Error:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const enterFolder = (folder: Folder) => {
        setFolderStack(prev => [...prev, folder]);
    };

    const navigateTo = (idx: number) => {
        if (idx === -1) setFolderStack([]);
        else setFolderStack(prev => prev.slice(0, idx + 1));
    };

    const createFolder = async () => {
        if (!newFolderName.trim()) return;
        const { error } = await supabase
            .from('gallery_folders')
            .insert([{ name: newFolderName.trim(), parent_id: currentFolder?.id || null }]);
        if (error) { alert(error.message); return; }
        setShowFolderModal(false);
        setNewFolderName('');
        if (currentFolder) fetchSubFolders(currentFolder.id);
        else fetchFolders();
    };

    const performDeleteAsset = async (image: GalleryImage, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm(`Permanently purge "${image.title}"? This cannot be undone.`)) return;

        setDeletingId(image.id);
        try {
            if (image.storage_path) {
                const { error: storageError } = await supabase.storage.from('gallery').remove([image.storage_path]);
                if (storageError) console.warn("Storage binary might be missing:", storageError.message);
            }
            const { error } = await supabase.from('gallery_images').delete().eq('id', image.id);
            if (error) throw new Error(`[DB ERROR ${error.code}] ${error.message}`);
            setImages(prev => prev.filter(img => img.id !== image.id));
            alert("Asset successfully purged.");
        } catch (err: any) {
            alert(`Deletion Failed:\n\n${err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    const performDeleteFolder = async (folder: Folder, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm(`WARNING: This will delete "${folder.name}" and ALL its contents. Continue?`)) return;

        try {
            const { data: folderImages } = await supabase.from('gallery_images').select('storage_path').eq('folder_id', folder.id);
            if (folderImages && folderImages.length > 0) {
                const paths = folderImages.map(img => img.storage_path).filter(Boolean);
                if (paths.length > 0) await supabase.storage.from('gallery').remove(paths);
                await supabase.from('gallery_images').delete().eq('folder_id', folder.id);
            }
            const { error } = await supabase.from('gallery_folders').delete().eq('id', folder.id);
            if (error) throw new Error(error.message);

            // Refresh the correct list
            if (folder.parent_id) fetchSubFolders(folder.parent_id);
            else fetchFolders();
            alert("Collection purged successfully.");
        } catch (err: any) {
            alert(`Database Error: ${err.message}`);
        }
    };

    const performRenameFolder = async () => {
        if (!renamingFolder || !renameFolderName.trim()) return;
        const { error } = await supabase
            .from('gallery_folders')
            .update({ name: renameFolderName.trim() })
            .eq('id', renamingFolder.id);
        if (error) { alert(`Rename failed: ${error.message}`); return; }

        // Update folder stack if the renamed folder is in the path
        setFolderStack(prev => prev.map(f => f.id === renamingFolder.id ? { ...f, name: renameFolderName.trim() } : f));
        // Refresh correct list
        if (renamingFolder.parent_id) fetchSubFolders(renamingFolder.parent_id);
        else { fetchFolders(); if (!renamingFolder.parent_id && currentFolder?.id !== renamingFolder.id) {} }
        if (currentFolder?.id === renamingFolder.id) fetchSubFolders(renamingFolder.id);
        setRenamingFolder(null);
        setRenameFolderName('');
    };

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !currentFolder) return;

        setIsUploading(true);
        setUploadProgress(0);
        let count = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const isVideo = file.type.startsWith('video/') || !!file.name.match(/\.(mp4|webm|ogg|mov|mkv|avi)$/i);
                let uploadFile = file;
                if (!isVideo) {
                    try { uploadFile = await compressImage(file); } catch { /* use original */ }
                }
                const uniqueId = Math.random().toString(36).substring(2, 8);
                const timestamp = Date.now();
                const safeName = uploadFile.name.replace(/\.[^/.]+$/, "").replace(/\W/g, '_').substring(0, 30);
                const fileExt = uploadFile.name.split('.').pop() || (isVideo ? 'mp4' : 'webp');
                const filename = `${timestamp}-${uniqueId}-${safeName}.${fileExt}`;
                const path = `${currentFolder.name}/${filename}`;

                const { error: upErr } = await supabase.storage.from('gallery').upload(path, uploadFile);
                if (upErr) throw upErr;

                const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);

                const res = await fetch('/api/admin/gallery', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        folder_id: currentFolder.id,
                        storage_path: path,
                        public_url: publicUrl,
                        title: file.name.split('.')[0],
                        alt_text: `Escape Stayz ${currentFolder.name}`,
                        description: '',
                        tags: currentFolder.name,
                        media_type: isVideo ? 'video' : 'image',
                    }),
                });
                if (!res.ok) {
                    let errorMessage = `Server responded with status ${res.status}`;
                    try {
                        const { error } = await res.json();
                        if (error) errorMessage = error;
                    } catch (e) {
                         const text = await res.text();
                         errorMessage = text.substring(0, 100);
                    }
                    throw new Error(errorMessage);
                }

                count++;
                setUploadProgress(Math.round((count / files.length) * 100));
            } catch (err: any) {
                if (err.message?.includes('maximum allowed size')) {
                    alert(`Upload Failed: ${file.name} is too large.`);
                } else {
                    alert(`Upload Failed for ${file.name}: ${err.message || 'Unknown error'}`);
                }
            }
        }

        setIsUploading(false);
        fetchImages(currentFolder.id);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getFileFormat = (url: string) => {
        try { return url.split('.').pop()?.toUpperCase() || 'IMG'; } catch { return 'IMG'; }
    };

    const FolderCard = ({ folder, onClick }: { folder: Folder; onClick: () => void }) => (
        <div
            onClick={onClick}
            className="group relative bg-white p-6 rounded-3xl border border-charcoal/5 flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all"
        >
            <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all z-[100]">
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setRenamingFolder(folder); setRenameFolderName(folder.name); }}
                    className="w-6 h-6 bg-charcoal/5 text-charcoal/40 rounded-full flex items-center justify-center hover:bg-forest hover:text-white pointer-events-auto shadow-sm transition-all"
                    title="Rename"
                >
                    <i className="fas fa-pen text-[8px]"></i>
                </button>
                <button
                    type="button"
                    onClick={(e) => performDeleteFolder(folder, e)}
                    className="w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white pointer-events-auto shadow-sm transition-all"
                    title="Delete"
                >
                    <i className="fas fa-times text-[8px]"></i>
                </button>
            </div>
            <div className="w-14 h-14 bg-forest/5 rounded-[20px] flex items-center justify-center text-forest/40 text-xl mb-3 group-hover:bg-forest group-hover:text-white transition-all">
                <i className="fas fa-folder"></i>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/60 text-center">{folder.name}</p>
        </div>
    );

    return (
        <>
            <div className="space-y-8 min-h-[80vh]">

                {/* Header bar */}
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-charcoal/5">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => navigateTo(-1)}
                            className={`text-[10px] font-bold uppercase tracking-widest transition-all ${!currentFolder ? 'text-forest' : 'text-charcoal/30 hover:text-charcoal'}`}
                        >
                            Master Gallery
                        </button>
                        {folderStack.map((f, idx) => (
                            <span key={f.id} className="flex items-center gap-2">
                                <i className="fas fa-chevron-right text-[7px] text-charcoal/20"></i>
                                <button
                                    onClick={() => navigateTo(idx)}
                                    className={`text-[10px] font-bold uppercase tracking-widest transition-all ${idx === folderStack.length - 1 ? 'text-forest italic' : 'text-charcoal/30 hover:text-charcoal'}`}
                                >
                                    {f.name}
                                </button>
                            </span>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setNewFolderName(''); setShowFolderModal(true); }}
                            className="bg-charcoal text-white px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-forest transition-all"
                        >
                            + New Collection
                        </button>
                        {currentFolder && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-forest text-white px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-forest/20"
                            >
                                <i className="fas fa-upload mr-2"></i> Bulk Upload
                            </button>
                        )}
                        <input type="file" multiple accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleBulkUpload} />
                    </div>
                </div>

                {/* Root folder list */}
                {!currentFolder ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {folders.map(folder => (
                            <FolderCard key={folder.id} folder={folder} onClick={() => enterFolder(folder)} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Subfolders — shown first */}
                        {subFolders.length > 0 && (
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/30 mb-4">Collections inside {currentFolder.name}</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {subFolders.map(folder => (
                                        <FolderCard key={folder.id} folder={folder} onClick={() => enterFolder(folder)} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Images */}
                        {images.length > 0 && (
                            <div>
                                {subFolders.length > 0 && (
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/30 mb-4">Images in {currentFolder.name}</p>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {images.map(image => (
                                        <div
                                            key={image.id}
                                            className="group bg-white rounded-2xl overflow-hidden border border-charcoal/5 shadow-sm hover:shadow-xl transition-all flex flex-col"
                                        >
                                            <div className="aspect-square relative overflow-hidden bg-charcoal/5">
                                                {image.media_type === 'video' ? (
                                                    <video
                                                        src={image.public_url}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1s]"
                                                        muted loop
                                                        onMouseOver={e => e.currentTarget.play()}
                                                        onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                                    />
                                                ) : (
                                                    <img
                                                        src={image.public_url}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1s]"
                                                        alt={image.alt_text}
                                                    />
                                                )}
                                                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[8px] font-bold text-white uppercase tracking-wider">
                                                    {getFileFormat(image.public_url)}
                                                </div>
                                                {deletingId === image.id && (
                                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                                                        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 flex items-center justify-between border-t border-charcoal/5">
                                                <div className="truncate pr-4">
                                                    <p className="text-[10px] font-bold uppercase text-charcoal truncate">{image.title}</p>
                                                    <p className="text-[8px] text-charcoal/30 uppercase tracking-widest truncate">{image.alt_text || 'No Alt Text'}</p>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setEditingImage(image); }}
                                                        className="w-8 h-8 rounded-full bg-charcoal/5 text-charcoal/40 hover:bg-forest hover:text-white flex items-center justify-center transition-all"
                                                    >
                                                        <i className="fas fa-pen text-[9px]"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => performDeleteAsset(image, e)}
                                                        className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                                                    >
                                                        <i className="fas fa-trash-alt text-[9px]"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {subFolders.length === 0 && images.length === 0 && !loading && (
                            <div className="text-center py-20 border-2 border-dashed border-charcoal/10 rounded-3xl">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/20">Empty Collection</p>
                                <p className="text-xs text-charcoal/30 mt-2">Upload images or create a sub-collection</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Upload overlay */}
                {isUploading && (
                    <div className="fixed inset-0 z-[200] bg-charcoal/90 backdrop-blur-md flex flex-col items-center justify-center text-white">
                        <h3 className="text-3xl font-serif italic mb-6">Vault Synchronization</h3>
                        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-forest transition-all" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">{uploadProgress}% Complete</p>
                    </div>
                )}

                {/* New Collection modal */}
                {showFolderModal && (
                    <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={() => setShowFolderModal(false)}></div>
                        <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative z-10 shadow-2xl scale-in-center">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40 mb-1">
                                {currentFolder ? `Inside: ${currentFolder.name}` : 'Root Level'}
                            </p>
                            <h3 className="text-xl font-serif italic mb-4">New Collection</h3>
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') createFolder(); }}
                                className="w-full bg-charcoal/5 rounded-xl px-4 py-3 outline-none mb-4 font-bold text-sm"
                                placeholder="Collection name"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowFolderModal(false)}
                                    className="flex-1 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest text-charcoal/40 hover:bg-charcoal/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createFolder}
                                    className="flex-1 bg-forest text-white py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px]"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rename modal */}
                {renamingFolder && (
                    <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={() => setRenamingFolder(null)}></div>
                        <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative z-10 shadow-2xl scale-in-center">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40 mb-3">Rename Collection</p>
                            <input
                                type="text"
                                value={renameFolderName}
                                onChange={(e) => setRenameFolderName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') performRenameFolder(); }}
                                className="w-full bg-charcoal/5 rounded-xl px-4 py-3 outline-none mb-4 font-bold text-sm"
                                placeholder="Collection name"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setRenamingFolder(null)}
                                    className="flex-1 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest text-charcoal/40 hover:bg-charcoal/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={performRenameFolder}
                                    className="flex-1 bg-forest text-white py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px]"
                                >
                                    Rename
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit image panel */}
                {editingImage && (
                    <div className="fixed inset-0 z-[210] flex items-center justify-end">
                        <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={() => setEditingImage(null)}></div>
                        <div className="bg-white w-full max-lg h-full p-12 relative z-10 shadow-2xl flex flex-col slide-in-right">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-3xl font-serif italic">Asset Details</h3>
                                <button onClick={() => setEditingImage(null)} className="text-charcoal/20 hover:text-charcoal">
                                    <i className="fas fa-times text-xl"></i>
                                </button>
                            </div>
                            <div className="aspect-video rounded-3xl overflow-hidden mb-10 shadow-inner bg-charcoal/5 flex items-center justify-center">
                                {editingImage.media_type === 'video' ? (
                                    <video src={editingImage.public_url} className="w-full h-full object-contain" controls />
                                ) : (
                                    <img src={editingImage.public_url} className="w-full h-full object-contain" alt="" />
                                )}
                            </div>
                            <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/30 block mb-2">Title</label>
                                    <input type="text" value={editingImage.title} onChange={e => setEditingImage({ ...editingImage, title: e.target.value })} className="w-full bg-charcoal/5 rounded-xl px-5 py-4 outline-none text-sm font-bold" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/30 block mb-2">Alt Text (SEO)</label>
                                    <input type="text" value={editingImage.alt_text} onChange={e => setEditingImage({ ...editingImage, alt_text: e.target.value })} className="w-full bg-charcoal/5 rounded-xl px-5 py-4 outline-none text-sm" />
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    const { error } = await supabase.from('gallery_images').update({ title: editingImage.title, alt_text: editingImage.alt_text }).eq('id', editingImage.id);
                                    if (error) alert(error.message);
                                    else { fetchImages(currentFolder!.id); setEditingImage(null); }
                                }}
                                className="mt-10 bg-forest text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl"
                            >
                                Apply Changes
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes scale-in-center { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                @keyframes slide-in-right { 0% { transform: translateX(100%); } 100% { transform: translateX(0); } }
                .scale-in-center { animation: scale-in-center 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
                .slide-in-right { animation: slide-in-right 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
            `}</style>
        </>
    );
}
