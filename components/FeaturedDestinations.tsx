'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface FeaturedDestinationsProps {
    heading?: string;
    sub_heading?: string;
    link_text?: string;
    link_url?: string;
    description?: string;
    destinations?: any[];
}

export const FeaturedDestinations: React.FC<FeaturedDestinationsProps> = ({
    heading = "Popular Destinations",
    sub_heading = "Where to next?",
    description = "Discover the most enchanting corners of the world, where culture meets comfort and every journey tells a new story.",
    link_text = "View All Destinations",
    link_url = "/destinations",
    destinations = []
}) => {
    // Determine which destinations to show (limit to 3 if many passed, or just use what's passed)
    const displayDestinations = destinations.length > 0 ? destinations.slice(0, 3) : [];

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

    return (
        <section className="py-14 px-6 md:px-12 bg-white relative overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <span className="text-terracotta font-bold uppercase tracking-[0.2em] text-sm block mb-4">{sub_heading}</span>
                    <h2 className="text-3xl md:text-5xl font-heading font-bold text-forest leading-tight">{heading}</h2>
                    <div className="w-24 h-1 bg-terracotta mx-auto mt-6 mb-8 rounded-full"></div>
                    <p className="text-charcoal/60 text-base md:text-lg leading-relaxed font-light">{description}</p>
                </div>

                <div className="relative group/nav overflow-x-hidden md:overflow-visible">

                    <div 
                        ref={scrollRef}
                        className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 pb-12 pt-4 snap-x snap-mandatory scrollbar-hide" 
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {displayDestinations.length > 0 ? (
                            displayDestinations.map((dest, idx) => (
                                <div key={dest.id || idx} className="min-w-[75vw] md:min-w-0 snap-center">
                                    <div className="group cursor-pointer border border-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white flex flex-col h-full">
                                        {/* Image Section */}
                                        <Link href={`/destinations/${dest.slug}`} className="relative aspect-[4/3] overflow-hidden block">
                                            <Image
                                                src={`${dest.hero_image || dest.image_url}${(dest.hero_image || dest.image_url)?.includes('?') ? '&' : '?'}fm=webp&w=800` || '/og-default.jpg'}
                                                alt={dest.name}
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                fill
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                            <div className="absolute bottom-6 left-6 text-white group-hover:-translate-y-2 transition-transform duration-300">
                                                <h3 className="text-2xl font-bold mb-1">{dest.name}</h3>
                                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block">
                                                    {idx === 0 ? 'Popular' : idx === 1 ? 'Nature' : 'Retreat'}
                                                </span>
                                            </div>
                                        </Link>

                                        <div className="p-8 flex flex-col flex-grow bg-white">
                                            <p className="text-charcoal/60 mb-8 line-clamp-3 text-sm leading-relaxed">
                                                {dest.description || "Experience the local heritage, breathtaking landscapes, and curated luxury at this signature destination."}
                                            </p>

                                            <div className="mt-auto flex justify-end">
                                                <Link href={`/destinations/${dest.slug}`} className="group/btn flex items-center gap-3">
                                                    <span className="text-terracotta font-bold text-sm uppercase tracking-wider">Details</span>
                                                    <div className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center transition-all duration-300 group-hover/btn:scale-110 shadow-md">
                                                        <i className="fas fa-arrow-right text-white text-sm -rotate-45 group-hover/btn:rotate-0 transition-transform duration-300"></i>
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-3 text-center text-charcoal/40">No destinations found.</p>
                        )}
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <Link href={link_url} className="inline-flex items-center gap-3 font-bold text-forest hover:text-terracotta transition-colors group">
                        {link_text}
                        <div className="w-8 h-8 rounded-full border border-forest/20 flex items-center justify-center group-hover:border-terracotta transition-colors">
                            <i className="fas fa-arrow-right text-xs"></i>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
};
