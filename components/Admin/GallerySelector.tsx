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
    alt_text?: string;
    media_type?: 'image' | 'video';
}

interface GallerySelectorProps {
    onClose: () => void;
    onSelect: (selectedImages: GalleryImage[]) => void;
}

export const GallerySelector: React.FC<GallerySelectorProps> = ({ onClose, onSelect }) => {
    const [folders, setFolders] = useState<Folder[]>([]);         // root folders
    const [subFolders, setSubFolders] = useState<Folder[]>([]);   // children of currentFolder
    const [folderStack, setFolderStack] = useState<Folder[]>([]);  // navigation stack
    const currentFolder = folderStack[folderStack.length - 1] ?? null;

    const [images, setImages] = useState<GalleryImage[]>([]);
    const [selectedImages, setSelectedImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(false);

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
        setLoading(true);
        const { data } = await supabase
            .from('gallery_folders')
            .select('*')
            .is('parent_id', null)
            .order('name');
        setFolders(data || []);
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

    const toggleSelection = (img: GalleryImage) => {
        setSelectedImages(prev => {
            const exists = prev.find(p => p.id === img.id);
            if (exists) return prev.filter(p => p.id !== img.id);
            return [...prev, img];
        });
    };

    const selectAllInFolder = () => {
        const newImages = images.filter(img => !selectedImages.find(s => s.id === img.id));
        setSelectedImages(prev => [...prev, ...newImages]);
    };

    const FolderButton = ({ folder }: { folder: Folder }) => (
        <button
            onClick={() => enterFolder(folder)}
            className="aspect-[4/3] bg-white rounded-xl border border-charcoal/10 hover:border-forest/30 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-3 group"
        >
            <i className="fas fa-folder text-3xl text-forest/20 group-hover:text-forest transition-colors"></i>
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal/60 group-hover:text-charcoal text-center px-2">{folder.name}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-white w-full max-w-6xl h-[85vh] rounded-xl relative z-10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-8 py-6 border-b border-charcoal/10 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-4 flex-wrap">
                        <h3 className="text-xl font-serif font-bold text-charcoal">Select Assets</h3>
                        <div className="h-5 w-px bg-charcoal/10"></div>

                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => navigateTo(-1)}
                                className={`text-xs font-bold uppercase tracking-wider transition-colors ${!currentFolder ? 'text-forest' : 'text-charcoal/40 hover:text-charcoal'}`}
                            >
                                Collections
                            </button>
                            {folderStack.map((f, idx) => (
                                <span key={f.id} className="flex items-center gap-2">
                                    <i className="fas fa-chevron-right text-[9px] text-charcoal/20"></i>
                                    <button
                                        onClick={() => navigateTo(idx)}
                                        className={`text-xs font-bold uppercase tracking-wider transition-colors ${idx === folderStack.length - 1 ? 'text-forest' : 'text-charcoal/40 hover:text-charcoal'}`}
                                    >
                                        {f.name}
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-charcoal/60">
                            {selectedImages.length} Selected
                        </span>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-charcoal/5 hover:bg-charcoal/10 flex items-center justify-center text-charcoal transition-colors">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-8 bg-gray-50/50 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : !currentFolder ? (
                        /* Root folders */
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {folders.map(folder => <FolderButton key={folder.id} folder={folder} />)}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Subfolders first */}
                            {subFolders.length > 0 && (
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/30 mb-4">
                                        Collections inside {currentFolder.name}
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {subFolders.map(folder => <FolderButton key={folder.id} folder={folder} />)}
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
                                    <div className="flex justify-end mb-4">
                                        <button
                                            onClick={selectAllInFolder}
                                            className="text-xs font-bold uppercase tracking-wider text-forest hover:underline"
                                        >
                                            Select All
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                        {images.map(img => {
                                            const isSelected = selectedImages.some(s => s.id === img.id);
                                            return (
                                                <button
                                                    key={img.id}
                                                    onClick={() => toggleSelection(img)}
                                                    className={`group relative aspect-square bg-white rounded-lg overflow-hidden transition-all ${isSelected ? 'ring-4 ring-forest shadow-xl' : 'hover:shadow-lg'}`}
                                                >
                                                    {img.media_type === 'video' ? (
                                                        <video
                                                            src={img.public_url}
                                                            className="w-full h-full object-cover"
                                                            muted loop
                                                            onMouseOver={e => e.currentTarget.play()}
                                                            onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                                        />
                                                    ) : (
                                                        <img src={img.public_url} className="w-full h-full object-cover" alt={img.title} />
                                                    )}
                                                    <div className={`absolute inset-0 transition-all ${isSelected ? 'bg-forest/20' : 'bg-forest/0 group-hover:bg-forest/10'}`}></div>
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2 w-6 h-6 bg-forest text-white rounded-full flex items-center justify-center shadow-md">
                                                            <i className="fas fa-check text-xs"></i>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {subFolders.length === 0 && images.length === 0 && (
                                <div className="text-center py-20">
                                    <p className="text-xs font-bold uppercase tracking-widest text-charcoal/20">Empty Collection</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-charcoal/10 bg-white flex justify-between items-center">
                    <button onClick={onClose} className="px-6 py-3 rounded-lg text-xs font-bold uppercase text-charcoal/60 hover:bg-gray-100 transition-colors">Cancel</button>
                    <button
                        onClick={() => onSelect(selectedImages)}
                        disabled={selectedImages.length === 0}
                        className="bg-forest text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-forest/90 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        Add {selectedImages.length} Assets
                    </button>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};
