'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../context/SettingsContext';

const COUNT_KEY = 'escape_stayz_booking_popup_count';
const MAX_SHOWS = 2;
const DELAY_MS = 30_000; // 30 seconds

export const DirectBookingPopup: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { settings } = useSettings();
    const secondTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Detect a full page refresh — reset the counter so the show limit restarts
        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        if (navEntry?.type === 'reload') {
            sessionStorage.removeItem(COUNT_KEY);
        }

        const count = parseInt(sessionStorage.getItem(COUNT_KEY) || '0', 10);
        if (count >= MAX_SHOWS) return;

        // First appearance: 30 seconds after page load
        const timer = setTimeout(() => {
            setIsVisible(true);
            sessionStorage.setItem(COUNT_KEY, String(count + 1));
        }, DELAY_MS);

        return () => clearTimeout(timer);
    }, []);

    const dismiss = () => {
        setIsVisible(false);

        // Schedule second appearance 30 seconds after the first is dismissed
        const count = parseInt(sessionStorage.getItem(COUNT_KEY) || '0', 10);
        if (count < MAX_SHOWS) {
            secondTimerRef.current = setTimeout(() => {
                setIsVisible(true);
                sessionStorage.setItem(COUNT_KEY, String(count + 1));
            }, DELAY_MS);
        }
    };

    useEffect(() => {
        return () => {
            if (secondTimerRef.current) clearTimeout(secondTimerRef.current);
        };
    }, []);

    const phone = settings?.contact?.phone?.replace(/[^0-9]/g, '') || '918448048862';
    const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent('Hi! I\'d like to enquire about direct booking rates.')}`;

    if (!isVisible) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] animate-fade-in"
                onClick={dismiss}
            />

            {/* Popup card */}
            <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 pointer-events-none animate-scale-in">
                <div className="bg-white rounded-3xl shadow-2xl shadow-forest/20 border border-forest/5 w-full max-w-sm pointer-events-auto overflow-hidden">

                    {/* Header band */}
                    <div
                        className="px-7 pt-7 pb-6 text-center relative"
                        style={{ background: 'linear-gradient(135deg, rgba(217,108,91,0.12) 0%, rgba(245,245,240,0.8) 100%)' }}
                    >
                        {/* Close button */}
                        <button
                            onClick={dismiss}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/70 hover:bg-white transition-colors shadow-sm border border-forest/5"
                            aria-label="Close"
                        >
                            <i className="fas fa-xmark text-charcoal/50 text-sm"></i>
                        </button>

                        {/* Icon */}
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-md shadow-forest/10 border border-forest/5 flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-tag text-terracotta text-xl"></i>
                        </div>

                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-terracotta block mb-2">Direct Booking</span>
                        <h2 className="text-xl font-heading font-bold text-forest leading-snug">
                            Reach out to Our Team<br />for Direct Booking
                        </h2>
                    </div>

                    {/* Body */}
                    <div className="px-7 py-5">
                        {/* Savings highlight */}
                        <div className="bg-forest/5 rounded-2xl px-5 py-4 border border-forest/10 flex items-start gap-3 mb-6">
                            <i className="fas fa-circle-check text-forest mt-0.5 text-sm flex-shrink-0"></i>
                            <p className="text-sm text-charcoal/70 leading-relaxed">
                                Rates offered from Direct Booking are{' '}
                                <span className="font-bold text-forest">10–20% lesser</span>{' '}
                                than online rates
                            </p>
                        </div>

                        {/* WhatsApp CTA */}
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={dismiss}
                            className="w-full flex items-center justify-center gap-2.5 bg-whatsapp text-white px-5 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-whatsapp-dark transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            <i className="fab fa-whatsapp text-lg"></i>
                            Chat for Best Rates
                        </a>

                        <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/30 italic text-center mt-3">
                            Best Rates  · Instant confirmation
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
                @keyframes scale-in { from { opacity: 0; transform: scale(0.92) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                .animate-fade-in { animation: fade-in 0.3s ease forwards; }
                .animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
            `}</style>
        </>
    );
};
