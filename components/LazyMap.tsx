'use client';

import { useEffect, useRef, useState } from 'react';

interface LazyMapProps {
    src: string;
    title: string;
}

export function LazyMap({ src, title }: LazyMapProps) {
    const [shouldLoad, setShouldLoad] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '300px' }
        );

        if (wrapperRef.current) observer.observe(wrapperRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={wrapperRef} className="w-full h-full rounded-2xl overflow-hidden relative">
            {shouldLoad ? (
                <iframe
                    title={title}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0, filter: 'contrast(1.1) opacity(0.9) grayscale(0.2)' }}
                    src={src}
                    allowFullScreen
                    loading="lazy"
                    className="w-full h-full"
                />
            ) : (
                <div className="w-full h-full bg-forest/5 flex items-center justify-center">
                    <i className="fas fa-map text-forest/20 text-4xl"></i>
                </div>
            )}
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-charcoal/10 rounded-2xl"></div>
        </div>
    );
}
