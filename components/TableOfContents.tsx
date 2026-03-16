
'use client';

import React, { useMemo, useEffect, useState } from 'react';

interface TocItem {
    level: number;
    id: string;
    text: string;
}

export const TableOfContents = ({ content }: { content: string }) => {
    const [activeId, setActiveId] = useState<string | null>(null);

    const headings = useMemo<TocItem[]>(() => {
        // Parse h1/h2 tags that have id attributes
        const headingRegex = /<h([12])[^>]*id="([^"]+)"[^>]*>([^<]+)<\/h[12]>/gi;
        const items: TocItem[] = [];
        let match;
        while ((match = headingRegex.exec(content)) !== null) {
            items.push({
                level: parseInt(match[1]),
                id: match[2],
                text: match[3].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
            });
        }
        return items;
    }, [content]);

    // Intersection observer to highlight the active heading
    useEffect(() => {
        if (headings.length === 0) return;
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                }
            },
            { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
        );
        headings.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <div className="bg-white p-8 rounded-3xl border border-forest/8 shadow-xl shadow-forest/5 sticky top-32">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-terracotta mb-6">
                On This Page
            </p>
            <nav className="space-y-1">
                {headings.map((h, idx) => {
                    const isActive = activeId === h.id;
                    return (
                        <a
                            key={idx}
                            href={`#${h.id}`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                                setActiveId(h.id);
                            }}
                            className={`
                                flex items-start gap-2.5 py-2 px-3 rounded-xl transition-all duration-200 leading-snug
                                ${h.level === 2 ? 'ml-4 text-xs' : 'text-sm'}
                                ${isActive
                                    ? 'bg-forest/8 text-forest font-semibold'
                                    : 'text-charcoal/50 hover:text-charcoal hover:bg-charcoal/4 font-normal'}
                            `}
                        >
                            <span className={`mt-0.5 flex-shrink-0 rounded-full transition-all ${isActive ? 'w-1.5 h-1.5 bg-forest mt-1.5' : 'w-1 h-1 bg-charcoal/20 mt-2'}`} />
                            {h.text}
                        </a>
                    );
                })}
            </nav>
        </div>
    );
};
