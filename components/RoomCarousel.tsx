"use client";

import { useRef, useState, useEffect, useCallback } from 'react';
import { RoomCard } from './RoomCard';

export const RoomCarousel = ({ rooms, hotelName }: { rooms: any[], hotelName?: string }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const scrollPosition = container.scrollLeft;

        let newIndex = 0;
        let minDiff = Infinity;

        const children = container.children;
        const containerCenter = scrollPosition + container.clientWidth / 2;

        for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            const childCenter = child.offsetLeft - container.offsetLeft + child.offsetWidth / 2;
            const diff = Math.abs(containerCenter - childCenter);
            if (diff < minDiff) {
                minDiff = diff;
                newIndex = i;
            }
        }

        setActiveIndex(newIndex);
    }, []);

    const scrollToIndex = (index: number) => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const children = container.children;
        if (index >= 0 && index < children.length) {
            const child = children[index] as HTMLElement;

            const paddingLeft = window.innerWidth < 1024 ? 16 : 0;

            container.scrollTo({
                left: child.offsetLeft - container.offsetLeft - paddingLeft,
                behavior: 'smooth'
            });
            setActiveIndex(index);
        }
    };

    return (
        <div className="w-full">
            {/* Header / Navigation Controls */}
            <div className="flex justify-between items-center mb-6 lg:mb-8">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl lg:text-2xl font-bold text-forest mb-6 lg:mb-8 font-heading">
                        Room Details
                    </h3>
                </div>

                {rooms.length > 1 && (
                    <div className="flex items-center gap-4 lg:gap-6">
                        <button
                            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
                            disabled={activeIndex === 0}
                            className={`transition-opacity ${activeIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:opacity-70'} w-8 h-8 flex items-center justify-center`}
                            aria-label="Previous room"
                        >
                            <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 18L3 10L11 2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={activeIndex === 0 ? "text-gray-300" : "text-gray-400"} />
                            </svg>
                        </button>
                        <span className="text-base lg:text-lg font-bold text-gray-900 font-heading tracking-wide">
                            {activeIndex + 1} / {rooms.length}
                        </span>
                        <button
                            onClick={() => scrollToIndex(Math.min(rooms.length - 1, activeIndex + 1))}
                            disabled={activeIndex === rooms.length - 1}
                            className={`transition-opacity ${activeIndex === rooms.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:opacity-70'} w-8 h-8 flex items-center justify-center`}
                            aria-label="Next room"
                        >
                            <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 18L11 10L3 2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={activeIndex === rooms.length - 1 ? "text-gray-300" : "text-gray-900"} />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Carousel Container */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto gap-4 lg:gap-8 pb-8  px-4 lg:mx-0 lg:px-0 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {rooms.map((room) => (
                    <div key={room.id} className="snap-start shrink-0 w-[80vw] md:w-[60vw] lg:w-[380px] xl:w-[420px]">
                        <RoomCard room={room} hotelName={hotelName} />
                    </div>
                ))}
            </div>
        </div>
    );
};
