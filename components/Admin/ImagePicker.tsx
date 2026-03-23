import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Folder {
    id: string;
    name: string;
    parent_id?: string | null;
}

interface GalleryImage {
    id: string;
    public_url: string;
    title: string;
    folder_id: string;
    media_type?: 'image' | 'video';
}

interface ImagePickerProps {
    label: string;
    value: string;
    onChange: (url: string) => void;
    className?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({ label, value, onChange, className }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Navigation state — mirrors GallerySelector
    const [rootFolders, setRootFolders] = useState<Folder[]>([]);
    const [subFolders, setSubFolders] = useState<Folder[]>([]);
    const [folderStack, setFolderStack] = useState<Folder[]>([]);
    const currentFolder = folderStack[folderStack.length - 1] ?? null;

    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch root folders on open
    useEffect(() => {
        if (isOpen) {
            setFolderStack([]);
            fetchRootFolders();
        }
    }, [isOpen]);

    // Fetch subfolders + images when folder changes
    useEffect(() => {
        if (!isOpen) return;
        if (currentFolder) {
            fetchSubFolders(currentFolder.id);
            fetchImages(currentFolder.id);
        } else {
            setSubFolders([]);
            setImages([]);
        }
    }, [currentFolder, isOpen]);

    const fetchRootFolders = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('gallery_folders')
            .select('*')
            .is('parent_id', null)
            .order('name');
        setRootFolders(data || []);
        setLoading(false);
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
        setLoading(true);
        const { data } = await supabase
            .from('gallery_images')
            .select('*')
            .eq('folder_id', folderId)
            .order('created_at', { ascending: false });
        setImages(data || []);
        setLoading(false);
    };

    const enterFolder = (folder: Folder) => {
        setFolderStack(prev => [...prev, folder]);
    };

    const navigateTo = (idx: number) => {
        if (idx === -1) setFolderStack([]);
        else setFolderStack(prev => prev.slice(0, idx + 1));
    };

    const handleSelect = (url: string) => {
        onChange(url);
        setIsOpen(false);
    };

    const FolderBtn = ({ folder }: { folder: Folder }) => (
        <button
            onClick={() => enterFolder(folder)}
            className="aspect-[4/3] bg-white rounded-2xl border border-charcoal/5 hover:border-forest/20 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-3 group"
        >
            <i className="fas fa-folder text-3xl text-forest/20 group-hover:text-forest transition-colors" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/60 group-hover:text-charcoal text-center px-2">{folder.name}</span>
        </button>
    );

    return (
        <div className={className}>
            <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40 block mb-2">{label}</label>

            {/* Preview / Trigger */}
            <div
                onClick={() => setIsOpen(true)}
                className="group relative w-full h-32 bg-cream rounded-2xl border-2 border-dashed border-charcoal/10 hover:border-forest/30 cursor-pointer overflow-hidden transition-all flex items-center justify-center"
            >
                {value ? (
                    <>
                        {value.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video src={value} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" muted loop />
                        ) : (
                            <img src={value} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Selected" />
                        )}
                        <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/20 transition-all flex items-center justify-center">
                            <span className="bg-white/90 text-forest px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">Change Image</span>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-charcoal/30 group-hover:text-forest transition-colors">
                        <i className="fas fa-image text-2xl mb-2" />
                        <p className="text-[9px] font-bold uppercase tracking-widest">Select from Gallery</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-md" onClick={() => setIsOpen(false)} />
                    <div className="bg-white w-full max-w-5xl h-[80vh] rounded-3xl relative z-10 flex flex-col overflow-hidden shadow-2xl scale-in-center">

                        {/* Header */}
                        <div className="px-8 py-6 border-b border-charcoal/5 flex justify-between items-center bg-white flex-shrink-0">
                            <div className="flex items-center gap-4 flex-wrap">
                                <h3 className="text-xl font-serif italic text-charcoal">Gallery Asset</h3>
                                <div className="h-5 w-px bg-charcoal/10" />

                                {/* Breadcrumb */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        onClick={() => navigateTo(-1)}
                                        className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${!currentFolder ? 'text-forest' : 'text-charcoal/30 hover:text-charcoal'}`}
                                    >
                                        Collections
                                    </button>
                                    {folderStack.map((f, idx) => (
                                        <span key={f.id} className="flex items-center gap-2">
                                            <i className="fas fa-chevron-right text-[8px] text-charcoal/20" />
                                            <button
                                                onClick={() => navigateTo(idx)}
                                                className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${idx === folderStack.length - 1 ? 'text-forest' : 'text-charcoal/30 hover:text-charcoal'}`}
                                            >
                                                {f.name}
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-charcoal/5 hover:bg-charcoal/10 flex items-center justify-center text-charcoal transition-colors">
                                <i className="fas fa-times" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-grow overflow-y-auto p-8 bg-[#faf9f6] custom-scrollbar">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : !currentFolder ? (
                                // Root folder grid
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    {rootFolders.map(folder => <FolderBtn key={folder.id} folder={folder} />)}
                                    {rootFolders.length === 0 && (
                                        <div className="col-span-full py-20 text-center">
                                            <p className="text-charcoal/30 text-sm">No collections found.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Subfolders */}
                                    {subFolders.length > 0 && (
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/30 mb-4">
                                                Collections inside {currentFolder.name}
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                                {subFolders.map(folder => <FolderBtn key={folder.id} folder={folder} />)}
                                            </div>
                                        </div>
                                    )}

                                    {/* Images */}
                                    {images.length > 0 && (
                                        <div>
                                            {subFolders.length > 0 && (
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/30 mb-4">
                                                    Images in {currentFolder.name}
                                                </p>
                                            )}
                                            <div className="grid grid-cols-3 md:grid-cols-5 gap-6">
                                                {images.map(img => (
                                                    <button
                                                        key={img.id}
                                                        onClick={() => handleSelect(img.public_url)}
                                                        className="group relative aspect-square bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                                                    >
                                                        {img.media_type === 'video' ? (
                                                            <video
                                                                src={img.public_url}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                muted loop
                                                                onMouseOver={e => e.currentTarget.play()}
                                                                onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                                            />
                                                        ) : (
                                                            <img src={img.public_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={img.title} />
                                                        )}
                                                        <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/20 transition-all" />
                                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <p className="text-[9px] font-bold uppercase tracking-widest text-white truncate">{img.title}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {subFolders.length === 0 && images.length === 0 && (
                                        <div className="text-center py-20">
                                            <p className="text-charcoal/30 text-xs font-bold uppercase tracking-widest">Empty Collection</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
            <style>{`
                .scale-in-center { animation: scale-in-center 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
                @keyframes scale-in-center { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};
