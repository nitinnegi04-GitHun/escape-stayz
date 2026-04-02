'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';

interface Award {
    id: string;
    title: string;
    image_url: string;
    pointers: { text: string }[];
    display_order: number;
}

interface AwardsSectionProps {
    awards: Award[];
}

export const AwardsSection: React.FC<AwardsSectionProps> = ({ awards }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    if (!awards || awards.length === 0) return null;

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const newIndex = direction === 'left'
            ? Math.max(0, activeIndex - 1)
            : Math.min(awards.length - 1, activeIndex + 1);

        const children = container.children;
        if (children[newIndex]) {
            const child = children[newIndex] as HTMLElement;
            container.scrollTo({ left: child.offsetLeft - container.offsetLeft, behavior: 'smooth' });
        }
        setActiveIndex(newIndex);
    };

    return (
        <section id="awards" className="py-14 bg-cream relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* Header */}
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <span className="text-terracotta font-bold uppercase tracking-[0.2em] text-xs block mb-3">Recognition</span>
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-forest leading-tight">Awards & Recognition</h2>
                        <div className="w-16 h-0.5 bg-terracotta rounded-full mt-4"></div>
                    </div>

                    {/* Nav controls */}
                    {awards.length > 1 && (
                        <div className="hidden md:flex items-center gap-4 flex-shrink-0 mb-1">
                            <button
                                onClick={() => scroll('left')}
                                disabled={activeIndex === 0}
                                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 shadow-sm ${activeIndex === 0 ? 'border-charcoal/10 text-charcoal/20 cursor-not-allowed' : 'border-forest/20 text-charcoal/50 hover:border-forest hover:text-forest'}`}
                                aria-label="Previous"
                            >
                                <i className="fas fa-chevron-left text-[11px]"></i>
                            </button>
                            <span className="text-sm font-bold text-charcoal/40 font-heading tabular-nums">
                                {activeIndex + 1} / {awards.length}
                            </span>
                            <button
                                onClick={() => scroll('right')}
                                disabled={activeIndex === awards.length - 1}
                                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 shadow-sm ${activeIndex === awards.length - 1 ? 'border-charcoal/10 text-charcoal/20 cursor-not-allowed' : 'border-forest/20 text-charcoal/50 hover:border-forest hover:text-forest'}`}
                                aria-label="Next"
                            >
                                <i className="fas fa-chevron-right text-[11px]"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Carousel */}
            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-5 pl-6 md:pl-12 pr-6 md:pr-12 pb-4 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {awards.map((award, idx) => (
                    <div
                        key={award.id}
                        className="snap-start shrink-0 w-[78vw] sm:w-[55vw] md:w-[38vw] lg:w-[320px] xl:w-[360px]"
                        onClick={() => setActiveIndex(idx)}
                    >
                        <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-forest/5 flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                            <div className="p-1  aspect-[4/3]">
                                <div className="relative w-full h-full rounded-1xl overflow-hidden">
                                    <Image
                                        src={award.image_url}
                                        alt={award.title}
                                        fill
                                        className="object-contain transition-transform duration-700 hover:scale-105"
                                        sizes="(max-width: 640px) 78vw, (max-width: 1024px) 38vw, 360px"
                                    />
                                </div>
                            </div>

                            <div className="px-4 pt-3 pb-4 flex flex-col flex-grow">
                                <h3 className="text-base font-bold text-forest font-heading mb-4">{award.title}</h3>
                                {award.pointers && award.pointers.length > 0 && (
                                    <ul className="space-y-2">
                                        {award.pointers.map((pointer, i) => (
                                            <li key={i} className="flex items-start gap-2.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-terracotta flex-shrink-0 mt-[7px]"></span>
                                                <span className="text-sm text-charcoal/65 font-light leading-relaxed">{pointer.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dot indicators */}
            {awards.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-6">
                    {awards.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                if (!scrollRef.current) return;
                                const child = scrollRef.current.children[idx] as HTMLElement;
                                scrollRef.current.scrollTo({ left: child.offsetLeft - scrollRef.current.offsetLeft, behavior: 'smooth' });
                                setActiveIndex(idx);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'bg-terracotta w-5' : 'bg-charcoal/20 w-1.5'}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};
