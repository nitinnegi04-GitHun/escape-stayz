'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../lib/supabase';
import { HOTEL_ICON_MAP } from './Admin/hotelIcons';

interface OtherPropertiesSectionProps {
    currentSlug: string;
}

export const OtherPropertiesSection: React.FC<OtherPropertiesSectionProps> = ({ currentSlug }) => {
    const [hotels, setHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchHotels = async () => {
            const { data } = await supabase
                .from('hotels')
                .select(`
                    *,
                    images:hotel_images(image_url, alt_text),
                    rooms(price_per_night),
                    hotel_amenities(amenity:amenities(name, icon)),
                    highlights
                `)
                .neq('slug', currentSlug)
                .limit(8);

            if (data) setHotels(data);
            setLoading(false);
        };
        fetchHotels();
    }, [currentSlug]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const { scrollLeft, clientWidth } = scrollRef.current;
        scrollRef.current.scrollTo({
            left: direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75,
            behavior: 'smooth',
        });
    };

    const getMinPrice = (rooms: any[]) => {
        if (!rooms || rooms.length === 0) return null;
        const prices = rooms.map((r: any) => r.price_per_night).filter(Boolean);
        return prices.length ? Math.min(...prices).toLocaleString() : null;
    };

    const FALLBACK = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?fm=webp&w=800';

    const getImage = (hotel: any) => {
        if (hotel.thumbnail_image) return hotel.thumbnail_image;
        const fromGallery = hotel.images?.find((img: any) => img.image_url)?.image_url;
        return fromGallery || hotel.hero_image || FALLBACK;
    };

    if (loading || hotels.length === 0) return null;

    return (
        <div className="mb-12 lg:mb-20">
            {/* Section Heading */}
            <div className="flex items-end justify-between mb-8 lg:mb-10">
                <div>
                    <span className="text-terracotta font-bold uppercase tracking-[0.2em] text-xs block mb-3">Explore More</span>
                    <h3 className="text-xl lg:text-2xl font-bold text-forest font-heading leading-tight">Our Other Properties</h3>
                    <div className="w-10 h-0.5 bg-terracotta rounded-full mt-3"></div>
                </div>

                <div className="hidden md:flex items-center gap-2 flex-shrink-0 mb-1">
                    <button onClick={() => scroll('left')} className="w-9 h-9 rounded-full border border-forest/15 bg-white flex items-center justify-center text-charcoal/50 hover:border-forest/40 hover:text-forest transition-all duration-200 shadow-sm" aria-label="Scroll left">
                        <i className="fas fa-chevron-left text-[11px]"></i>
                    </button>
                    <button onClick={() => scroll('right')} className="w-9 h-9 rounded-full border border-forest/15 bg-white flex items-center justify-center text-charcoal/50 hover:border-forest/40 hover:text-forest transition-all duration-200 shadow-sm" aria-label="Scroll right">
                        <i className="fas fa-chevron-right text-[11px]"></i>
                    </button>
                </div>
            </div>

            {/* Scroll strip */}
            <div
                ref={scrollRef}
                className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {hotels.map((hotel) => {
                    const minPrice = getMinPrice(hotel.rooms);
                    return (
                        <div
                            key={hotel.id}
                            className="flex-none snap-center"
                            style={{ width: 'clamp(260px, 72vw, 300px)' }}
                        >
                            <Link
                                href={`/hotels/${hotel.slug}`}
                                className="group block bg-white rounded-2xl border border-forest/5 shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 h-full"
                            >
                                {/* Image — fixed height, no aspect-ratio tricks */}
                                <div className="relative h-48 overflow-hidden">
                                    <Image
                                        src={getImage(hotel)}
                                        alt={hotel.name}
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <p className="font-bold text-base font-heading leading-snug">{hotel.name}</p>
                                        <p className="text-xs opacity-80 flex items-center gap-1 mt-0.5">
                                            <i className="fas fa-map-marker-alt text-terracotta text-[10px]"></i>
                                            {hotel.location_name || hotel.destination_slug}
                                        </p>
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="p-4 flex flex-col gap-3">
                                    {minPrice && (
                                        <div className="flex items-baseline gap-1 border-b border-forest/5 pb-3">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">From</span>
                                            <span className="text-lg font-bold text-terracotta">₹{minPrice}</span>
                                            <span className="text-xs text-charcoal/40 italic font-light">/night</span>
                                        </div>
                                    )}

                                    <p className="text-charcoal/60 text-xs leading-relaxed line-clamp-2 font-light">
                                        {hotel.short_description || hotel.full_description}
                                    </p>

                                    {hotel.highlights?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {hotel.highlights.slice(0, 3).map((hl: { icon: string; text: string }, idx: number) => {
                                                const IC = HOTEL_ICON_MAP[hl.icon];
                                                return (
                                                    <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-cream rounded-lg border border-forest/5">
                                                        {IC && <IC size={10} className="text-terracotta flex-shrink-0" />}
                                                        <span className="text-[10px] font-bold text-charcoal/70 whitespace-nowrap">{hl.text}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="flex justify-end mt-auto pt-1">
                                        <span className="flex items-center gap-2 text-terracotta font-bold text-xs uppercase tracking-wider group-hover:gap-3 transition-all duration-300">
                                            Details
                                            <span className="w-7 h-7 rounded-full bg-terracotta flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                                <i className="fas fa-arrow-right text-white text-[10px] -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
