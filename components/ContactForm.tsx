'use client';

import React from 'react';
import { Button } from './ui/Button';

export const ContactForm = () => {
    return (
        <div className="bg-cream/40 p-10 rounded-3xl border border-forest/5 sticky top-32">
            {/* Decorative Circle */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta/5 rounded-bl-[100px] pointer-events-none"></div>

            <form className="space-y-8 relative z-10" onSubmit={(e) => e.preventDefault()}>
                <div className="w-20 h-20 bg-forest/5 rounded-full"></div>
                <div className="h-4 bg-forest/5 rounded w-64"></div>
                <div className="h-3 bg-forest/5 rounded w-48"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-forest uppercase tracking-widest pl-2">First Name</label>
                        <input type="text" className="w-full bg-white border-transparent focus:border-terracotta focus:ring-0 rounded-2xl px-6 py-4 font-light text-forest placeholder-charcoal/30 transition-all shadow-sm" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-forest uppercase tracking-widest pl-2">Last Name</label>
                        <input type="text" className="w-full bg-white border-transparent focus:border-terracotta focus:ring-0 rounded-2xl px-6 py-4 font-light text-forest placeholder-charcoal/30 transition-all shadow-sm" placeholder="Doe" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-forest uppercase tracking-widest pl-2">Subject</label>
                    <div className="relative">
                        <select className="w-full bg-white border-transparent focus:border-terracotta focus:ring-0 rounded-2xl px-6 py-4 font-light text-forest placeholder-charcoal/30 transition-all shadow-sm appearance-none cursor-pointer">
                            <option>General Inquiry</option>
                            <option>Booking Modification</option>
                            <option>Special Requests</option>
                            <option>Partnership</option>
                        </select>
                        <i className="fas fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-forest/20 text-xs pointer-events-none"></i>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-forest uppercase tracking-widest pl-2">Message</label>
                    <textarea rows={5} className="w-full bg-white border-transparent focus:border-terracotta focus:ring-0 rounded-2xl px-6 py-4 font-light text-forest placeholder-charcoal/30 transition-all shadow-sm resize-none" placeholder="How can we help you explore?"></textarea>
                </div>

                <Button type="submit" variant="secondary" className="py-5 px-12">
                    Send Message
                </Button>
            </form>
        </div>
    );
};
