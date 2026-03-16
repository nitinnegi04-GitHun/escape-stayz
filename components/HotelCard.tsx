'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
        // Handle both relational images (from query) and direct imageUrl (from some old data structures)
        if (hotel.imageUrl) return hotel.imageUrl;
        if (hotel.hero_image) return hotel.hero_image;
        if (hotel.images && hotel.images.length > 0) return hotel.images[0].image_url;
        return 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?fm=webp&w=800'; // Fallback
    };

    const containerClasses = layout === 'carousel' 
        ? "group cursor-pointer border border-forest/5 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white flex flex-col min-w-full md:min-w-[380px] snap-center flex-shrink-0"
        : "group cursor-pointer border border-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white flex flex-col h-full";

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: layout === 'grid' ? 0 : index * 0.1 }}
            className={containerClasses}
        >

            {/* Image Section */}
            <Link href={`/hotels/${hotel.slug}`} className="relative aspect-[4/3] overflow-hidden block">
                {/* Primary Image */}
                <img
                    src={getHotelImage(hotel)}
                    alt={hotel.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                
                {/* Secondary Image Crossfade */}
                {hotel.images && hotel.images.length > 1 && (
                    <img
                        src={hotel.images[1]?.image_url}
                        alt={hotel.images[1]?.alt_text || 'Secondary View'}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 z-10"
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

            <div className="p-8 flex flex-col flex-grow relative bg-white">
                <div className="flex justify-between items-center mb-4 text-sm text-charcoal/60 border-b border-forest/5 pb-4">
                    <div className="flex items-center gap-2 text-terracotta font-medium line-clamp-1">
                        {hotel.hotel_amenities && hotel.hotel_amenities.length > 0 ? (
                            <>
                                <i className={`fas ${hotel.hotel_amenities[0].amenity?.icon || 'fa-star'}`}></i>
                                <span className="truncate max-w-[120px]">{hotel.hotel_amenities[0].amenity?.name || 'Refined Luxury'}</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-star text-xs"></i>
                                <span>{hotel.rating || '5.0'} / 5.0</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-terracotta text-lg">
                            ₹{getMinPrice(hotel.rooms)}
                            <span className="text-charcoal/40 font-normal text-xs ml-1 font-sans italic">/nt</span>
                        </span>
                    </div>
                </div>

                <p className="text-charcoal/60 mb-6 line-clamp-3 text-sm leading-relaxed font-light">
                    {hotel.short_description || hotel.description || hotel.full_description}
                </p>

                <div className="mt-auto flex justify-between items-center">
                    <div className="flex gap-2 flex-wrap">
                        {/* Render raw amenities strings or properly structured ones depending on the data shape passed in */}
                        {(hotel.amenities || []).slice(0, 2).map((amenity: any, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-forest/5 rounded text-[9px] font-bold uppercase tracking-wider text-forest/60">
                                {typeof amenity === 'string' ? amenity : amenity.name}
                            </span>
                        ))}
                    </div>
                    <Link href={`/hotels/${hotel.slug}`} className="group/btn flex items-center gap-3">
                        <span className="text-terracotta font-bold text-sm uppercase tracking-wider">Details</span>
                        <div className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center transition-all duration-300 group-hover/btn:scale-110 shadow-md">
                            <i className="fas fa-arrow-right text-white text-sm -rotate-45 group-hover/btn:rotate-0 transition-transform duration-300"></i>
                        </div>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};
