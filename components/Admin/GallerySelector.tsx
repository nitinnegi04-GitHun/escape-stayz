import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Folder {
    id: string;
    name: string;
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
    const [folders, setFolders] = useState<Folder[]>([]);
    const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [selectedImages, setSelectedImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(false);

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
        setLoading(true);
        const { data } = await supabase.from('gallery_folders').select('*').order('name');
        setFolders(data || []);
        setLoading(false);
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

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-white w-full max-w-6xl h-[85vh] rounded-xl relative z-10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-8 py-6 border-b border-charcoal/10 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-6">
                        <h3 className="text-xl font-serif font-bold text-charcoal">Select Assets</h3>
                        <div className="h-8 w-px bg-charcoal/10"></div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentFolder(null)}
                                className={`text-xs font-bold uppercase tracking-wider transition-colors ${!currentFolder ? 'text-forest' : 'text-charcoal/40 hover:text-charcoal'}`}
                            >
                                Collections
                            </button>
                            {currentFolder && (
                                <>
                                    <i className="fas fa-chevron-right text-[10px] text-charcoal/20"></i>
                                    <span className="text-xs font-bold uppercase tracking-wider text-forest">{currentFolder.name}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="text-xs font-bold uppercase tracking-wider text-charcoal/60">
                            {selectedImages.length} Selected
                        </div>
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
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {folders.map(folder => (
                                <button
                                    key={folder.id}
                                    onClick={() => setCurrentFolder(folder)}
                                    className="aspect-[4/3] bg-white rounded-xl border border-charcoal/10 hover:border-forest/30 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-3 group"
                                >
                                    <i className="fas fa-folder text-3xl text-forest/20 group-hover:text-forest transition-colors"></i>
                                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal/60 group-hover:text-charcoal">{folder.name}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-end mb-6">
                                <button
                                    onClick={selectAllInFolder}
                                    className="text-xs font-bold uppercase tracking-wider text-forest hover:underline"
                                >
                                    Select All in {currentFolder.name}
                                </button>
                            </div>
                            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                {images.map(img => {
                                    const isSelected = selectedImages.some(s => s.id === img.id);
                                    return (
                                        <button
                                            key={img.id}
                                            onClick={() => toggleSelection(img)}
                                            className={`group relative aspect-square bg-white rounded-lg overflow-hidden transition-all ${isSelected ? 'ring-4 ring-forest shadow-xl' : 'hover:shadow-lg'
                                                }`}
                                        >
                                            {img.media_type === 'video' ? (
                                                <video
                                                    src={img.public_url}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    loop
                                                    onMouseOver={e => e.currentTarget.play()}
                                                    onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                                />
                                            ) : (
                                                <img src={img.public_url} className="w-full h-full object-cover" alt={img.title} />
                                            )}
                                            <div className={`absolute inset-0 transition-all ${isSelected ? 'bg-forest/20' : 'bg-forest/0 group-hover:bg-forest/10'}`}></div>

                                            {/* Checkmark Overlay */}
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
                </div>

                {/* Footer Actions */}
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
