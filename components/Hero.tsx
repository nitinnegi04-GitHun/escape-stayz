'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';

interface HeroProps {
    title?: string;
    subtitle?: string;
    image?: string;
    video?: string;
    cta_text?: string;
    cta_link?: string;
}

export const Hero: React.FC<HeroProps> = ({
    title = "Adventure Trips",
    subtitle = "We are a boutique tour operator offering a selection of the best adventure trips around the globe.",
    image = "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=2940&auto=format&fit=crop",
    video,
    cta_text = "See all trips",
    cta_link = "/plan-your-trip"
}) => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isVideo = (url?: string) => {
        if (!url) return false;
        // More robust regex that handles query parameters
        return /\.(mp4|webm|ogg|mov|mkv|avi)(\?|$)/i.test(url);
    };

    const finalVideo = video || (isVideo(image) ? image : undefined);
    const finalImage = isVideo(image) ? undefined : image;

    return (
        <div className="relative h-[100dvh] w-full overflow-hidden font-body">
            {/* Dynamic Background */}
            <div
                className="absolute inset-0 transition-transform duration-75 ease-out"
                style={{
                    transform: `scale(${1 + scrollY * 0.0005}) translateY(${scrollY * 0.2}px)`
                }}
            >
                {finalVideo ? (
                    <div className="relative w-full h-full">
                        <video
                            key={finalVideo}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                            poster={finalImage}
                            src={finalVideo}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Fallback pattern/overlay if video fails to cover perfectly */}
                        <div className="absolute inset-0 bg-black/20"></div>
                    </div>
                ) : (
                    <div 
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url("${finalImage}")` }}
                    >
                        <div className="absolute inset-0 bg-black/20"></div>
                    </div>
                )}
            </div>

            {/* Content - Left Aligned */}
            <div className="relative h-full container mx-auto px-6 flex flex-col justify-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="max-w-4xl space-y-4 pt-44 md:pt-60"
                >
                    <h1 className="text-5xl md:text-8xl font-black md:font-bold leading-tight tracking-tight drop-shadow-xl" dangerouslySetInnerHTML={{ __html: title }}>
                    </h1>
                    <p className="text-base md:text-3xl font-light text-white max-w-2xl leading-relaxed drop-shadow-md">
                        {subtitle}
                    </p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="-mt-1 md:mt-0"
                    >
                        <Button href={cta_link} size="sm" className="md:py-5 md:px-12 md:text-base"> {cta_text}</Button>
                    </motion.div>
                </motion.div>

            </div>
        </div>
    );
};
