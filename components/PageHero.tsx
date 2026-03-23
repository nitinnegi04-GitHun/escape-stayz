
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface PageHeroProps {
    title: string;
    subtitle?: string;
    image: string;
    height?: string;
}

export const PageHero: React.FC<PageHeroProps> = ({
    title,
    subtitle,
    image,
    height = 'h-[70vh]'
}) => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={`relative ${height} w-full overflow-hidden`}>
            {/* Dynamic Background */}
            <div
                className="absolute inset-0"
                style={{
                    transform: `scale(${1 + scrollY * 0.0005}) translateY(${scrollY * 0.2}px)`
                }}
            >
                <Image
                    src={image || '/og-default.jpg'}
                    alt={title || "Hero Image"}
                    className="object-cover"
                    fill
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/40 z-10"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
                {subtitle && (
                    <span className="text-sm md:text-base font-bold uppercase tracking-[0.2em] mb-4 animate-fade-in-up text-white/80">
                        {subtitle}
                    </span>
                )}
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 max-w-4xl leading-tight animate-fade-in-up delay-100 font-heading">
                    {title}
                </h1>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white flex flex-col items-center gap-2 animate-bounce">
                <i className="fas fa-chevron-down opacity-70"></i>
            </div>
        </div>
    );
};
