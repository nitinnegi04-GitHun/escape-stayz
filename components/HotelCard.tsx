'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HOTEL_ICON_MAP } from './Admin/hotelIcons';

interface HotelCardProps {
    hotel: any;
    index?: number;
    layout?: 'grid' | 'carousel';
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, index = 0, layout = 'carousel' }) => {
    
    const getMinPrice = (rooms: any[]) => {
        if (!rooms || rooms.length === 0) return 'N/A';
        const prices = rooms.map(r => r.price_per_night).filter(p => p);
        if (prices.length === 0) return 'N/A';
        return Math.min(...prices).toLocaleString();
    };

    const getHotelImage = (hotel: any) => {
        // thumbnail_image is the dedicated card thumbnail, set from admin panel
        if (hotel.thumbnail_image) return hotel.thumbnail_image;
        if (hotel.imageUrl) return hotel.imageUrl;
        if (hotel.images && hotel.images.length > 0) return hotel.images[0].image_url;
        return 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?fm=webp&w=800'; // Fallback
    };

    const containerClasses = layout === 'carousel' 
        ? "group cursor-pointer border border-forest/5 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white flex flex-col min-w-full md:min-w-[380px] snap-center flex-shrink-0"
        : "group cursor-pointer border border-forest/5 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white flex flex-col h-full";

    return (
        <div className={containerClasses}>

            {/* Image Section */}
            <Link href={`/hotels/${hotel.slug}`} className="relative aspect-[4/3] overflow-hidden block">
                {/* Primary Image */}
                <Image
                    src={getHotelImage(hotel) || '/og-default.jpg'}
                    alt={hotel.name}
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                />
                
                {/* Secondary Image Crossfade */}
                {hotel.images && hotel.images.length > 1 && (
                    <Image
                        src={hotel.images[1]?.image_url || '/og-default.jpg'}
                        alt={hotel.images[1]?.alt_text || 'Secondary View'}
                        className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 z-10"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 z-20"></div>
                
                {/* Quick View Button Hover Overlay */}
                <div className="absolute inset-0 bg-forest/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30 flex items-center justify-center pointer-events-none">
                    <span className="bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-full font-bold uppercase tracking-wider text-xs translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl border border-white/30 truncate max-w-[80%]">
                        Quick View
                    </span>
                </div>

                <div className="absolute bottom-6 left-6 text-white group-hover:-translate-y-2 transition-transform duration-500 z-30">
                    <h3 className="text-2xl font-bold mb-1">{hotel.name}</h3>
                    <p className="text-sm opacity-90 font-medium capitalize flex items-center">
                        <i className="fas fa-map-marker-alt mr-2 text-terracotta"></i>
                        {hotel.destination || hotel.location_name || hotel.destination_slug || 'Unknown Location'}
                    </p>
                </div>
            </Link>

            <div className="p-6 flex flex-col flex-grow relative bg-white">

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-3 pb-3 border-b border-forest/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mr-1">From</p>
                    <span className="text-xl font-bold text-terracotta">₹{getMinPrice(hotel.rooms)}</span>
                    <span className="text-xs text-charcoal/40 italic font-light">/night</span>
                </div>

                {/* Short Description */}
                <p className="text-charcoal/60 mb-4 line-clamp-2 text-sm leading-relaxed font-light">
                    {hotel.short_description || hotel.description || hotel.full_description}
                </p>

                {/* All Highlights */}
                {hotel.highlights && hotel.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                        {hotel.highlights.map((hl: { icon: string; text: string }, idx: number) => {
                            const IC = HOTEL_ICON_MAP[hl.icon];
                            return (
                                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cream rounded-xl border border-forest/5 flex-shrink-0">
                                    {IC ? <IC size={11} className="text-terracotta flex-shrink-0" /> : null}
                                    <span className="text-[10px] font-bold text-charcoal/70 whitespace-nowrap">{hl.text}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Details CTA */}
                <div className="mt-auto flex justify-end">
                    <Link href={`/hotels/${hotel.slug}`} className="group/btn flex items-center gap-3">
                        <span className="text-terracotta font-bold text-sm uppercase tracking-wider">Details</span>
                        <div className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center transition-all duration-300 group-hover/btn:scale-110 shadow-md">
                            <i className="fas fa-arrow-right text-white text-sm -rotate-45 group-hover/btn:rotate-0 transition-transform duration-300"></i>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};
