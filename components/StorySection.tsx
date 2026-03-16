
'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface StorySectionProps {
    headline?: string; // New top-level headline
    heading: string;
    badge?: string;
    image: string;
    quote?: string;
    content: string; // HTML string
    cta_text?: string;
    cta_link?: string;
}

export const StorySection: React.FC<StorySectionProps> = ({ headline, heading, badge, image, quote, content, cta_text, cta_link }) => {
    if (!heading || !content || !image) return null;

    return (
        <section id="about" className="py-24 px-6 md:px-12 bg-cream">
            <div className="max-w-7xl mx-auto">

                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <span className="text-terracotta font-bold uppercase tracking-[0.2em] text-sm block mb-4">{badge || 'OUR STORY'}</span>
                    {headline && <h2 className="text-3xl md:text-5xl font-heading font-bold text-forest leading-tight">{headline}</h2>}
                    <div className="w-24 h-1 bg-terracotta mx-auto mt-6 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                    {/* Left Column - Images */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="relative h-[450px] md:h-[550px] w-full"
                    >
                        {/* Main large image */}
                        <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl z-10">
                            <img
                                src={image}
                                alt={heading}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        </div>

                        {/* Quote overlay */}
                        {quote && (
                            <div className="absolute -bottom-6 -right-6 md:-right-10 z-30 max-w-[280px] text-white bg-forest/95 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/10 group hover:-translate-y-1 hover:scale-105 transition-all">
                                <div className="flex text-terracotta mb-3 gap-1 text-xs">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                </div>
                                <p className="font-heading italic text-base leading-relaxed">"{quote}"</p>
                            </div>
                        )}

                        {/* Decorative Elements */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-10 -left-10 w-64 h-64 bg-terracotta/20 rounded-full blur-3xl -z-0"
                        ></motion.div>
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-10 -right-10 w-80 h-80 bg-forest/20 rounded-full blur-3xl -z-0"
                        ></motion.div>
                    </motion.div>

                    {/* Right Column - Story Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-6"
                    >


                        <div className="prose prose-lg text-charcoal/70 font-light space-y-6" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}>
                        </div>

                        {cta_text && cta_link && (
                            <div className="pt-8">
                                <Link href={cta_link} className="inline-flex items-center gap-3 bg-terracotta-gradient text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg shadow-terracotta/30 hover:opacity-90 transition-all hover:-translate-y-1">
                                    {cta_text} <i className="fas fa-arrow-right"></i>
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
