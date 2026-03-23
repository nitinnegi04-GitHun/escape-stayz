
'use client';

import React, { useState } from 'react';
import { ImageGalleryModal } from './ImageGalleryModal';

interface HotelGalleryProps {
    images: any[];
    hotelName: string;
    heroImage?: string;
}

export const HotelGallery: React.FC<HotelGalleryProps> = ({ images, hotelName, heroImage }) => {
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [galleryStartIndex, setGalleryStartIndex] = useState(0);

    // Gallery Logic: Prioritize sorted gallery images over static hero_image
    const sortedImages = images || [];
    const mainAsset = sortedImages.length > 0
        ? { url: sortedImages[0].image_url, alt: sortedImages[0].alt_text, tag: sortedImages[0].tags, id: sortedImages[0].id }
        : { url: heroImage || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb', alt: hotelName, tag: undefined, id: 'hero' };

    const galleryImages = sortedImages.length > 0
        ? sortedImages.map((img: any) => ({ url: img.image_url, alt: img.alt_text, tag: img.tags }))
        : [{ url: mainAsset.url, alt: mainAsset.alt, tag: mainAsset.tag }];

    const openGallery = (index: number) => {
        setGalleryStartIndex(index);
        setIsGalleryOpen(true);
    };

    const getOptimizedUrl = (url: string, width: number) => {
        if (!url) return '';
        if (url.includes('images.unsplash.com')) {
            return url.includes('?') ? `${url}&fm=webp&w=${width}` : `${url}?fm=webp&w=${width}`;
        }
        return url;
    };

    return (
        <>
            <ImageGalleryModal
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                images={galleryImages}
                initialIndex={galleryStartIndex}
            />

            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[65vh] md:h-[65vh] lg:h-[75vh] overflow-hidden relative group/gallery">
                {/* Main Hero Image */}
                <div
                    className={`col-span-4 md:col-span-2 row-span-2 relative group cursor-pointer overflow-hidden`}
                    onClick={() => openGallery(0)}
                >
                    {mainAsset.url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                        <video
                            src={mainAsset.url}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            muted
                            loop
                            autoPlay
                            playsInline
                        />
                    ) : (
                        <img
                            src={getOptimizedUrl(mainAsset.url, 1600)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            alt={mainAsset.alt}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?fm=webp&w=1600';
                            }}
                        />
                    )}
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors"></div>

                    {/* Hotel Title Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 pointer-events-none">
                        <span className="inline-block px-3 py-1 border border-white/40 rounded-full text-white text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] mb-4 backdrop-blur-sm bg-black/20">
                            The Property
                        </span>
                        <h1 className="font-heading text-white text-shadow-lg leading-none">
                            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide opacity-90">
                                {hotelName.includes(' ') ? hotelName.substring(0, hotelName.lastIndexOf(' ')) : hotelName}
                            </span>
                            {hotelName.includes(' ') && (
                                <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mt-1">
                                    {hotelName.substring(hotelName.lastIndexOf(' ') + 1)}
                                </span>
                            )}
                        </h1>
                    </div>

                    {mainAsset.tag && (
                        <div className="absolute top-4 left-4 bg-forest/90 backdrop-blur-md text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-lg z-[30]">
                            {mainAsset.tag}
                        </div>
                    )}
                </div>

                {/* Sub Images (Start from index 1) */}
                {sortedImages.slice(1, 5).map((img: any, idx: number) => (
                    <div
                        key={img.id}
                        className="hidden md:block col-span-1 row-span-1 relative group cursor-pointer overflow-hidden"
                        onClick={() => openGallery(idx + 1)} // idx + 1 because hero image is at 0
                    >
                        {img.image_url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                            <video
                                src={img.image_url}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                muted
                                loop
                                onMouseOver={e => e.currentTarget.play()}
                                onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                            />
                        ) : (
                            <img
                                src={getOptimizedUrl(img.image_url, 800)}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                alt={img.alt_text}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none'; // Hide broken sub-images to keep layout clean
                                }}
                            />
                        )}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        {img.tags && (
                            <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 shadow-lg z-10">
                                {img.tags}
                            </div>
                        )}
                    </div>
                ))}

                {/* Fallback if no gallery images */}
                {(!images || images.length === 0) && Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="hidden md:block col-span-1 row-span-1 bg-charcoal/5 flex items-center justify-center">
                        <i className="fas fa-image text-charcoal/10 text-4xl"></i>
                    </div>
                ))}

                <button
                    onClick={() => openGallery(0)}
                    className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-white border border-charcoal/10 px-3 py-1.5 md:px-5 md:py-2 rounded-lg shadow-lg flex items-center gap-2 hover:scale-105 transition-transform z-30"
                >
                    <i className="fas fa-grid-2 text-[10px] md:text-xs"></i>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-charcoal">View All Photos</span>
                </button>
            </div>
        </>
    );
};
