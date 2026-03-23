
'use client';

import React, { useState } from 'react';

interface FAQSectionProps {
    faqs: any[];
    ctaTarget?: string;
    ctaLabel?: string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs, ctaTarget = 'reservation-sidebar', ctaLabel = 'Reserve Now' }) => {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    if (!faqs || faqs.length === 0) return null;

    return (
        <section className="py-12 lg:py-24 bg-cream relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                    {/* Left Column */}
                    <div className="lg:sticky lg:top-40">
                        <span className="text-2xl font-bold uppercase tracking-widest text-charcoal/60 mb-4 block">FAQ</span>
                        <h3 className="text-3xl lg:text-4xl font-bold text-forest mb-4 lg:mb-8 font-heading">
                            Everything You Need to Know
                        </h3>
                        <button
                            onClick={() => document.getElementById(ctaTarget)?.scrollIntoView({ behavior: 'smooth' })}
                            className="hidden lg:flex group bg-terracotta text-white px-8 py-4 rounded-full items-center gap-4 hover:bg-forest transition-all duration-300 shadow-xl shadow-terracotta/20"
                        >
                            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <i className="fas fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
                            </span>
                            <span className="font-bold tracking-wide">{ctaLabel}</span>
                        </button>
                    </div>

                    {/* Right Column - Accordion */}
                    <div className="space-y-4">
                        {faqs.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)).map((faq: any, idx: number) => (
                            <div
                                key={idx}
                                className="bg-white border border-forest/5 rounded-3xl px-8 py-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-forest/10"
                                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                            >
                                <div className="flex justify-between items-center gap-6">
                                    <h3 className="text-xl font-heading font-bold text-charcoal flex-1">{faq.question}</h3>
                                    <div className={`w-10 h-10 rounded-full border border-terracotta/10 flex items-center justify-center transition-all duration-300 ${openFaqIndex === idx ? 'bg-terracotta text-white rotate-180 border-terracotta' : 'text-terracotta bg-white'}`}>
                                        <i className="fas fa-arrow-down text-sm"></i>
                                    </div>
                                </div>
                                <div
                                    className={`grid transition-all duration-300 ease-in-out ${openFaqIndex === idx ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}
                                >
                                    <div className="overflow-hidden">
                                        <p className="text-charcoal/60 leading-relaxed font-body text-base border-t border-forest/5 pt-4">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lg:hidden">
                        <button
                            onClick={() => document.getElementById(ctaTarget)?.scrollIntoView({ behavior: 'smooth' })}
                            className="w-auto inline-flex group bg-terracotta text-white px-8 py-4 rounded-full items-center gap-4 hover:bg-forest transition-all duration-300 shadow-xl shadow-terracotta/20"
                        >
                            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <i className="fas fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
                            </span>
                            <span className="font-bold tracking-wide">{ctaLabel}</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
