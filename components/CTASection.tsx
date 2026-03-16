
'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';

interface CTASectionProps {
    heading?: string;
    subtitle?: string;
    button_text?: string;
    button_link?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
    heading = "Ready for your next adventure?",
    subtitle = "Book your stay with us and experience the magic of the mountains.",
    button_text = "Book Now",
    button_link = "/plan-your-trip"
}) => {
    return (
        <section 
            className="relative py-32 px-6 md:px-12 text-white overflow-hidden bg-forest bg-fixed bg-center bg-cover" 
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=2952&auto=format&fit=crop")' }}
        >
            <div className="absolute inset-0 bg-forest/80 backdrop-blur-sm"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 mix-blend-screen"></div>
            
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto text-center relative z-10"
            >
                <h2 className="text-4xl md:text-6xl font-heading font-extrabold mb-8 drop-shadow-xl">{heading}</h2>
                <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-md font-light">
                    {subtitle}
                </p>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Button href={button_link}>{button_text}</Button>
                </motion.div>
            </motion.div>
        </section>
    );
}
