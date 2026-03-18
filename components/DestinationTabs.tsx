'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';

interface Tab {
    id: string;
    label: string;
}

export const DestinationTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isSticky, setIsSticky] = useState(false);

    const [availableTabs, setAvailableTabs] = useState<Tab[]>([]);

    const allTabs: Tab[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'experiences', label: 'Experiences' },
        { id: 'residences', label: 'Our Hotels' },
        { id: 'getting-there', label: 'Getting There' },
        { id: 'faqs', label: 'FAQs' }
    ];

    useEffect(() => {
        // Filter tabs based on existence of IDs in the DOM
        const filtered = allTabs.filter(tab => document.getElementById(tab.id));
        setAvailableTabs(filtered);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;

            // Handle sticky state
            const headerHeight = 72; // Layout header height
            const heroHeight = window.innerHeight * 0.65; // Matches DestinationGallery height
            setIsSticky(scrollPosition > heroHeight - headerHeight);

            // Handle active tab highlighting
            for (const tab of availableTabs) {
                const element = document.getElementById(tab.id);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 150) {
                        setActiveTab(tab.id);
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [availableTabs]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const headerHeight = 140; // Combined Layout header + Sticky Tabs
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + (window.scrollY || window.pageYOffset) - headerHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className={`w-full z-40 transition-all duration-300 ${isSticky
                ? 'fixed top-16 lg:top-20 left-0 bg-white/95 backdrop-blur-xl border-b border-forest/10 shadow-sm'
                : 'bg-white border-b border-forest/5'
            }`}>
            <div className="w-full max-w-[2400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 overflow-visible h-14 lg:h-20">
                <div className="flex items-center justify-between h-full overflow-visible gap-4">
                    <div className="flex items-center gap-6 lg:gap-8 h-full overflow-x-auto no-scrollbar mask-fade-right lg:mask-none">
                        {availableTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => scrollToSection(tab.id)}
                                className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] lg:tracking-[0.3em] whitespace-nowrap transition-all relative h-full flex items-center flex-shrink-0 ${activeTab === tab.id ? 'text-terracotta' : 'text-forest/60 hover:text-forest'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-terracotta rounded-full shadow-[0_0_10px_rgba(191,103,71,0.5)]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
