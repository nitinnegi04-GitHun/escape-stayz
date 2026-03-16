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
    const [folders, setFolders] = useState<Folder[]>([]);
    const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchFolders();
        }
    }, [isOpen]);

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
                        <i className="fas fa-image text-2xl mb-2"></i>
                        <p className="text-[9px] font-bold uppercase tracking-widest">Select from Gallery</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-md" onClick={() => setIsOpen(false)}></div>
                    <div className="bg-white w-full max-w-5xl h-[80vh] rounded-3xl relative z-10 flex flex-col overflow-hidden shadow-2xl scale-in-center">

                        {/* Header */}
                        <div className="px-8 py-6 border-b border-charcoal/5 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-4">
                                <h3 className="text-xl font-serif italic text-charcoal">Gallery Asset</h3>
                                <div className="h-6 w-px bg-charcoal/10"></div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentFolder(null)}
                                        className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${!currentFolder ? 'text-forest' : 'text-charcoal/30 hover:text-charcoal'}`}
                                    >
                                        Collections
                                    </button>
                                    {currentFolder && (
                                        <>
                                            <i className="fas fa-chevron-right text-[8px] text-charcoal/20"></i>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-forest">{currentFolder.name}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-charcoal/5 hover:bg-charcoal/10 flex items-center justify-center text-charcoal transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-grow overflow-y-auto p-8 bg-[#faf9f6] custom-scrollbar">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : !currentFolder ? (
                                // Folder Grid
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    {folders.map(folder => (
                                        <button
                                            key={folder.id}
                                            onClick={() => setCurrentFolder(folder)}
                                            className="aspect-[4/3] bg-white rounded-3xl border border-charcoal/5 hover:border-forest/20 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-3 group"
                                        >
                                            <i className="fas fa-folder text-3xl text-forest/20 group-hover:text-forest transition-colors"></i>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/60 group-hover:text-charcoal">{folder.name}</span>
                                        </button>
                                    ))}
                                    {folders.length === 0 && (
                                        <div className="col-span-full py-20 text-center">
                                            <p className="text-charcoal/30 text-sm">No collections found.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Image Grid
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-6">
                                    {images.map(img => (
                                        <button
                                            key={img.id}
                                            onClick={() => { onChange(img.public_url); setIsOpen(false); }}
                                            className="group relative aspect-square bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                                        >
                                            {img.media_type === 'video' ? (
                                                <video
                                                    src={img.public_url}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    muted
                                                    loop
                                                    onMouseOver={e => e.currentTarget.play()}
                                                    onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                                />
                                            ) : (
                                                <img src={img.public_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={img.title} />
                                            )}
                                            <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/20 transition-all"></div>
                                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-white truncate">{img.title}</p>
                                            </div>
                                        </button>
                                    ))}
                                    {images.length === 0 && (
                                        <div className="col-span-full py-20 text-center">
                                            <p className="text-charcoal/30 text-sm">No images in this collection.</p>
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
      `}</style>
        </div>
    );
};
