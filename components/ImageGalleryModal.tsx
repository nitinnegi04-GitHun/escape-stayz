import React, { useState, useEffect, useCallback } from 'react';

export interface GalleryImage {
    url: string;
    alt?: string;
    tag?: string;
}

interface ImageGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: (string | GalleryImage)[];
    initialIndex?: number;
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
    isOpen,
    onClose,
    images,
    initialIndex = 0
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Helper to get image data
    const getImageData = (img: string | GalleryImage) => {
        if (typeof img === 'string') return { url: img, alt: '', tag: null, type: 'image' };
        return {
            url: img.url,
            alt: img.alt || '',
            tag: img.tag,
            type: (img.url.match(/\.(mp4|webm|ogg|mov)$/i)) ? 'video' : 'image'
        };
    };

    const currentImage = images[currentIndex] ? getImageData(images[currentIndex]) : null;
    const isVideo = currentImage && (currentImage.type === 'video' || currentImage.url.match(/\.(mp4|webm|ogg|mov)$/i));

    // Reset index when modal opens with a specific initialIndex
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
        }
    }, [isOpen, initialIndex]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    // Keyboard support
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, handleNext, handlePrev]);

    if (!isOpen || images.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fadeIn">

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[110]"
            >
                <i className="fas fa-times text-3xl"></i>
            </button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md z-[110]"
                    >
                        <i className="fas fa-chevron-left text-xl"></i>
                    </button>

                    <button
                        onClick={handleNext}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md z-[110]"
                    >
                        <i className="fas fa-chevron-right text-xl"></i>
                    </button>
                </>
            )}

            {/* Main Image */}
            <div className="w-full h-full p-4 md:p-12 flex items-center justify-center relative">
                {currentImage && (
                    <div className="relative max-w-full max-h-full flex items-center justify-center">
                        {isVideo ? (
                            <div className="max-h-full max-w-full aspect-video flex items-center justify-center">
                                <video
                                    src={currentImage.url}
                                    controls
                                    autoPlay
                                    className="max-h-[80vh] max-w-full rounded-lg shadow-2xl"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ) : (
                            <img
                                src={currentImage.url}
                                alt={currentImage.alt || `Gallery Image ${currentIndex + 1}`}
                                className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
                            />
                        )}
                        {currentImage.tag && (
                            <div className="absolute top-4 left-4 bg-forest/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-lg z-[120]">
                                {currentImage.tag}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                <span className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md">
                    {currentIndex + 1} / {images.length}
                </span>
            </div>

            {/* Thumbnails (Desktop Only) */}
            {images.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 hidden md:flex justify-center gap-2 px-8 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="bg-black/40 p-2 rounded-2xl flex gap-2 backdrop-blur-md">
                        {images.map((img, idx) => {
                            const data = getImageData(img);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-16 h-12 rounded-lg overflow-hidden transition-all duration-300 border-2 ${idx === currentIndex ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                                        }`}
                                >
                                    {data.type === 'video' || data.url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                        <div className="w-full h-full bg-black flex items-center justify-center">
                                            <i className="fas fa-play text-white/50"></i>
                                        </div>
                                    ) : (
                                        <img src={data.url} className="w-full h-full object-cover" alt={data.alt || `Thumbnail ${idx + 1}`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
