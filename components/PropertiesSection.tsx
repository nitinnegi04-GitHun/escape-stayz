'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HOTELS } from '../constants'; // Or fetch from DB eventually, but this component will likely be replaced by a fetched list.
// Actually, staying consistent, we should probably fetch hotels here or pass them as props.
// But for now, let's keep it simple and just extract the UI.
// Wait, `HOTELS` is being deprecated. We should use `useQuery` here if we want "100% Backend".
// But `Home.tsx` isn't refactored yet to fetch hotels.
// I'll keep reusing HOTELS for now, but the Goal "100% Backend" means I should fetch.
// I will fetching hotels in this component.

import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';
import { HotelCard } from './HotelCard';

interface PropertiesSectionProps {
    heading?: string;
    sub_heading?: string;
    description?: string;
}

export const PropertiesSection: React.FC<PropertiesSectionProps> = ({
    heading = "Our Properties",
    sub_heading = "Our Collections",
    description = "Explore our handpicked selection of luxury stays, from serene mountain retreats to vibrant coastal escapes, each offering a unique immersion into local heritage."
}) => {
    const [hotels, setHotels] = useState<any[]>([]); // Using any[] to bypass strict type mismatch for now
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotels = async () => {
            const { data } = await supabase
                .from('hotels')
                .select(`
                    *,
                    images:hotel_images(image_url, alt_text),
                    rooms(price_per_night),
                    hotel_amenities(
                        amenity:amenities(name, icon)
                    )
                `)
                .limit(6);

            if (data) setHotels(data);
            setLoading(false);
        };
        fetchHotels();
    }, []);

    const scrollRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            scrollRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (loading) return <div className="py-24 text-center">Loading Properties...</div>;

    return (
        <section className="py-24 px-6 md:px-12 bg-white relative overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <span className="text-terracotta font-bold uppercase tracking-[0.2em] text-sm block mb-4">{sub_heading}</span>
                    <h2 className="text-3xl md:text-5xl font-heading font-bold text-forest leading-tight">{heading}</h2>
                    <div className="w-24 h-1 bg-terracotta mx-auto mt-6 mb-8 rounded-full"></div>
                    <p className="text-charcoal/70 text-base md:text-lg leading-relaxed font-light">{description}</p>
                </div>

                <div className="relative group/nav overflow-x-hidden md:overflow-visible">

                    <div 
                        ref={scrollRef}
                        className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 pb-12 pt-4 snap-x snap-mandatory scrollbar-hide" 
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {hotels.map((hotel, index) => (
                            <div key={hotel.id} className="min-w-[75vw] md:min-w-0 snap-center">
                                <HotelCard hotel={hotel} index={index} layout="grid" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
