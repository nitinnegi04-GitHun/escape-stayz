
'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface StorySectionProps {
    headline?: string;
    heading: string;
    badge?: string;
    image: string;
    quote?: string;
    content: string;
    cta_text?: string;
    cta_link?: string;
}

export const StorySection: React.FC<StorySectionProps> = ({ headline, heading, badge, image, quote, content, cta_text, cta_link }) => {
    if (!heading || !content || !image) return null;

    return (
        <section id="about" className="py-14 px-6 md:px-12 bg-cream">
            <div className="max-w-7xl mx-auto">

                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <span className="text-terracotta font-bold uppercase tracking-[0.2em] text-sm block mb-4">{badge || 'OUR STORY'}</span>
                    {headline && <h2 className="text-3xl md:text-5xl font-heading font-bold text-forest leading-tight">{headline}</h2>}
                    <div className="w-24 h-1 bg-terracotta mx-auto mt-6 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                    {/* Left Column - Images */}
                    <div className="relative h-[450px] md:h-[550px] w-full">
                        {/* Main large image */}
                        <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl z-10">
                            <Image
                                src={image || '/og-default.jpg'}
                                alt={heading}
                                className="object-cover"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        </div>

                        {/* Quote overlay */}
                        {quote && (
                            <div className="absolute -bottom-6 -right-6 md:-right-10 z-30 max-w-[280px] text-white bg-forest/95 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/10">
                                <div className="flex text-terracotta mb-3 gap-1 text-xs">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                </div>
                                <p className="font-heading italic text-base leading-relaxed">"{quote}"</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Story Content */}
                    <div className="space-y-6">
                        <div className="prose prose-lg text-charcoal/60 font-light space-y-6" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}>
                        </div>

                        {cta_text && cta_link && (
                            <div className="pt-8">
                                <Link href={cta_link} className="inline-flex items-center gap-3 bg-terracotta-gradient text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg shadow-terracotta/30 hover:opacity-90 transition-opacity">
                                    {cta_text} <i className="fas fa-arrow-right"></i>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
