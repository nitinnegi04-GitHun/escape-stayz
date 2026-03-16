
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../../lib/supabase';
import { compressImage } from '../../../../lib/imageCompression';

interface Folder {
    id: string;
    name: string;
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
    const [folders, setFolders] = useState<Folder[]>([]);
    const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [showFolderModal, setShowFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchFolders();
    }, []);

    useEffect(() => {
        if (currentFolder) {
            fetchImages(currentFolder.id);
        } else {
            setImages([]);
        }
    }, [currentFolder]);

    const fetchFolders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('gallery_folders').select('*').order('name');
            if (error) throw error;
            setFolders(data || []);
        } catch (err: any) {
            console.error('Folder Sync Error:', err.message);
        } finally {
            setLoading(false);
        }
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

    const performDeleteAsset = async (image: GalleryImage, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const confirmed = window.confirm(`Permanently purge "${image.title}"? This cannot be undone.`);
        if (!confirmed) return;

        setDeletingId(image.id);
        console.log("Starting Deletion Process for:", image.id);

        try {
            // 1. Delete Storage First
            if (image.storage_path) {
                const { error: storageError } = await supabase.storage.from('gallery').remove([image.storage_path]);
                if (storageError) console.warn("Storage binary might be missing or restricted:", storageError.message);
            }

            // 2. Delete DB Record
            const { error, status } = await supabase
                .from('gallery_images')
                .delete()
                .eq('id', image.id);

            if (error) {
                throw new Error(`[DB ERROR ${error.code}] ${error.message}`);
            }

            // If status is 204 but nothing happened, RLS might be blocking
            if (status === 204) {
                console.log("Database accepted request.");
            }

            setImages(prev => prev.filter(img => img.id !== image.id));
            alert("Asset successfully purged.");
        } catch (err: any) {
            console.error("Purge Failed:", err);
            alert(`Critical Deletion Failure:\n\n${err.message}\n\nHint: If you see 'Permission Denied', ensure Supabase RLS policies allow DELETE for anon users.`);
        } finally {
            setDeletingId(null);
        }
    };

    const performDeleteFolder = async (folder: Folder, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const confirmed = window.confirm(`WARNING: This will delete the collection "${folder.name}" and ALL images inside. Continue?`);
        if (!confirmed) return;

        try {
            // 1. Fetch images in folder to clean storage
            const { data: folderImages } = await supabase.from('gallery_images').select('storage_path').eq('folder_id', folder.id);

            if (folderImages && folderImages.length > 0) {
                const paths = folderImages.map(img => img.storage_path).filter(Boolean);
                if (paths.length > 0) await supabase.storage.from('gallery').remove(paths);

                // 2. Delete Images (Children)
                const { error: childError } = await supabase.from('gallery_images').delete().eq('folder_id', folder.id);
                if (childError) throw new Error(`Failed to clear child assets: ${childError.message}`);
            }

            // 3. Delete Folder (Parent)
            const { error: parentError } = await supabase.from('gallery_folders').delete().eq('id', folder.id);
            if (parentError) throw new Error(`Failed to delete collection: ${parentError.message}`);

            fetchFolders();
            alert("Collection purged successfully.");
        } catch (err: any) {
            console.error("Folder Purge Error:", err);
            alert(`Database Error: ${err.message}`);
        }
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
                // Robust video detection (MIME type or Extension)
                const isVideo = file.type.startsWith('video/') || !!file.name.match(/\.(mp4|webm|ogg|mov|mkv|avi)$/i);
                console.log(`Processing file: ${file.name}, isVideo: ${isVideo}, type: ${file.type}`);

                // ── Compress & convert FIRST so we know the real final extension ──
                let uploadFile = file;
                if (!isVideo) {
                    try {
                        uploadFile = await compressImage(file);
                        console.log(`Compressed: ${file.name} → ${uploadFile.name} (${uploadFile.type})`);
                    } catch (compErr) {
                        console.warn(`Compression failed for ${file.name}, uploading original.`, compErr);
                    }
                }

                // ── Build filename AFTER compression so the extension matches reality ──
                const uniqueId = Math.random().toString(36).substring(2, 8);
                const timestamp = Date.now();
                const safeName = uploadFile.name.replace(/\.[^/.]+$/, "").replace(/\W/g, '_').substring(0, 30);
                const fileExt = uploadFile.name.split('.').pop() || (isVideo ? 'mp4' : 'webp');
                const filename = `${timestamp}-${uniqueId}-${safeName}.${fileExt}`;
                const path = `${currentFolder.name}/${filename}`;

                // Upload processed file
                console.log(`Uploading to path: ${path}`);
                const { error: upErr } = await supabase.storage.from('gallery').upload(path, uploadFile);
                if (upErr) throw upErr;

                const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);

                await supabase.from('gallery_images').insert([{
                    folder_id: currentFolder.id,
                    storage_path: path,
                    public_url: publicUrl,
                    title: file.name.split('.')[0],
                    alt_text: `Escape Stayz ${currentFolder.name}`,
                    description: '',
                    tags: currentFolder.name,
                    media_type: isVideo ? 'video' : 'image'
                }]);

                count++;
                setUploadProgress(Math.round((count / files.length) * 100));
            } catch (err: any) {
                console.error(`Upload failure for ${file.name}:`, err.message);
                if (err.message && err.message.includes('The object exceeded the maximum allowed size')) {
                    alert(`Upload Failed: ${file.name} is too large.\n\nPlease upload a smaller file or compress the video (Target < 50MB for free tier).`);
                } else {
                    alert(`Upload Failed for ${file.name}: ${err.message || 'Unknown error'}`);
                }
            }
        }

        setIsUploading(false);
        fetchImages(currentFolder.id);
    };

    const getFileFormat = (url: string) => {
        try {
            const extension = url.split('.').pop()?.toUpperCase();
            return extension || 'IMG';
        } catch {
            return 'IMG';
        }
    };

    return (
        <>
            <div className="space-y-8 min-h-[80vh]">
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-charcoal/5">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentFolder(null)}
                            className={`text-[10px] font-bold uppercase tracking-widest transition-all ${!currentFolder ? 'text-forest' : 'text-charcoal/20 hover:text-charcoal'}`}
                        >
                            Master Gallery
                        </button>
                        {currentFolder && (
                            <span className="text-charcoal/10 flex items-center gap-3">
                                <i className="fas fa-chevron-right text-[8px]"></i>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-forest italic">{currentFolder.name}</span>
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {!currentFolder ? (
                            <button
                                onClick={() => setShowFolderModal(true)}
                                className="bg-charcoal text-white px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-forest transition-all"
                            >
                                + New Collection
                            </button>
                        ) : (
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

                {!currentFolder ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {folders.map(folder => (
                            <div
                                key={folder.id}
                                onClick={() => setCurrentFolder(folder)}
                                className="group relative bg-white p-8 rounded-3xl border border-charcoal/5 flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all"
                            >
                                <button
                                    type="button"
                                    onClick={(e) => performDeleteFolder(folder, e)}
                                    className="absolute top-4 right-4 w-7 h-7 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-[100] hover:bg-red-500 hover:text-white pointer-events-auto shadow-sm"
                                    title="Purge Collection"
                                >
                                    <i className="fas fa-times text-[10px]"></i>
                                </button>
                                <div className="w-16 h-16 bg-forest/5 rounded-[24px] flex items-center justify-center text-forest/40 text-2xl mb-4 group-hover:bg-forest group-hover:text-white transition-all">
                                    <i className="fas fa-folder"></i>
                                </div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/60">{folder.name}</p>
                            </div>
                        ))}
                    </div>
                ) : (
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
                                            muted
                                            loop
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
                                    {/* Format Badge */}
                                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[8px] font-bold text-white uppercase tracking-wider">
                                        {getFileFormat(image.public_url)}
                                    </div>

                                    {deletingId === image.id && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                                            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex items-center justify-between border-t border-charcoal/5 relative z-10">
                                    <div className="truncate pr-4">
                                        <p className="text-[10px] font-bold uppercase text-charcoal truncate">{image.title}</p>
                                        <p className="text-[8px] text-charcoal/30 uppercase tracking-widest truncate">{image.alt_text || 'No Alt Text'}</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0 pointer-events-auto">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setEditingImage(image); }}
                                            className="w-8 h-8 rounded-full bg-charcoal/5 text-charcoal/40 hover:bg-forest hover:text-white flex items-center justify-center transition-all z-[100]"
                                        >
                                            <i className="fas fa-pen text-[9px]"></i>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => performDeleteAsset(image, e)}
                                            className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all z-[100]"
                                        >
                                            <i className="fas fa-trash-alt text-[9px]"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isUploading && (
                    <div className="fixed inset-0 z-[200] bg-charcoal/90 backdrop-blur-md flex flex-col items-center justify-center text-white">
                        <h3 className="text-3xl font-serif italic mb-6">Vault Synchronization</h3>
                        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-forest transition-all" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">{uploadProgress}% Complete</p>
                    </div>
                )}

                {showFolderModal && (
                    <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={() => setShowFolderModal(false)}></div>
                        <div className="bg-white w-full max-sm rounded-3xl p-10 relative z-10 shadow-2xl scale-in-center">
                            <h3 className="text-2xl font-serif italic mb-6">New Collection</h3>
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                className="w-full bg-charcoal/5 border-none rounded-2xl px-5 py-4 outline-none mb-6 font-bold text-sm"
                                placeholder="Folder Name"
                                autoFocus
                            />
                            <button
                                onClick={async () => {
                                    if (!newFolderName.trim()) return;
                                    const { data, error } = await supabase.from('gallery_folders').insert([{ name: newFolderName.trim() }]).select();
                                    if (error) alert(error.message);
                                    else { fetchFolders(); setShowFolderModal(false); setNewFolderName(''); }
                                }}
                                className="w-full bg-forest text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {editingImage && (
                    <div className="fixed inset-0 z-[210] flex items-center justify-end">
                        <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={() => setEditingImage(null)}></div>
                        <div className="bg-white w-full max-lg h-full p-12 relative z-10 shadow-2xl flex flex-col slide-in-right">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-3xl font-serif italic">Asset Details</h3>
                                <button onClick={() => setEditingImage(null)} className="text-charcoal/20 hover:text-charcoal"><i className="fas fa-times text-xl"></i></button>
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
