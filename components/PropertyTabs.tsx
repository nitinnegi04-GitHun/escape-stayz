'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';

interface Tab {
    id: string;
    label: string;
}

export const PropertyTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isSticky, setIsSticky] = useState(false);

    const [availableTabs, setAvailableTabs] = useState<Tab[]>([]);

    const allTabs: Tab[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'amenities', label: 'Amenities' },
        { id: 'rooms', label: 'Accommodations' },
        { id: 'location', label: 'Location' },
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
            const headerHeight = 80;
            // The component should become sticky after the gallery section (usually 65-70vh)
            const heroHeight = window.innerHeight * 0.7; 
            setIsSticky(scrollPosition > heroHeight - headerHeight);

            // Handle active tab highlighting
            for (const tab of availableTabs) {
                const element = document.getElementById(tab.id);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // Offset for sticky header + tabs (80 + 80 = 160)
                    if (rect.top <= 170 && rect.bottom >= 170) {
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
            const headerHeight = 160; // Combined Layout header + Sticky Tabs
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + (window.scrollY || window.pageYOffset) - headerHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className={`hidden lg:block w-full z-40 transition-all duration-300 ${
            isSticky 
                ? 'fixed top-20 left-0 bg-white/95 backdrop-blur-xl border-b border-forest/10 shadow-sm' 
                : 'bg-white border-b border-forest/5'
        }`}>
            <div className="container mx-auto px-6 overflow-visible h-20">
                <div className="flex items-center justify-between h-full overflow-visible">
                    <div className="flex items-center gap-8 h-full">
                        {availableTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => scrollToSection(tab.id)}
                                className={`text-[10px] font-bold uppercase tracking-[0.3em] whitespace-nowrap transition-all relative h-full flex items-center ${
                                    activeTab === tab.id ? 'text-terracotta' : 'text-forest/60 hover:text-forest'
                                }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-terracotta rounded-full shadow-[0_0_10px_rgba(191,103,71,0.5)]" />
                                )}
                            </button>
                        ))}
                    </div>
                    
                    <div className={`flex items-center h-full transition-all duration-300 ${isSticky ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                        <Button 
                            onClick={() => scrollToSection('reservation-sidebar')}
                            variant="primary"
                            size="sm"
                            className="!shadow-none hover:!translate-y-0"
                        >
                            Book Your Stay
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
