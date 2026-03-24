'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReservationSidebar } from './ReservationSidebar';

const POPUP_KEY = 'escape_stayz_reservation_popup_shown';

interface MobileReservationPopupProps {
    hotelName: string;
    location: string;
}

export const MobileReservationPopup: React.FC<MobileReservationPopupProps> = ({ hotelName, location }) => {
    const [isVisible, setIsVisible] = useState(false);
    const searchParams = useSearchParams();
    const isTestMode = searchParams.get('test_popup') === '1';

    useEffect(() => {
        // Only run on mobile (skip check in test mode)
        if (!isTestMode && window.innerWidth >= 1024) return;
        // Only show once (skip check in test mode)
        if (!isTestMode && localStorage.getItem(POPUP_KEY)) return;

        const timer = setTimeout(() => {
            setIsVisible(true);
            if (!isTestMode) localStorage.setItem(POPUP_KEY, '1');
        }, isTestMode ? 1000 : 5000);

        return () => clearTimeout(timer);
    }, [isTestMode]);

    const dismiss = () => setIsVisible(false);

    if (!isVisible) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] lg:hidden animate-fade-in"
                onClick={dismiss}
            />

            {/* Drawer sliding up from bottom */}
            <div
                className="fixed bottom-0 left-0 right-0 z-[1000] lg:hidden max-h-[90vh] overflow-y-auto rounded-t-3xl shadow-2xl animate-slide-up"
            >
                {/* Drag handle + close */}
                <div className="bg-white rounded-t-3xl px-6 pt-4 pb-2 flex items-center justify-between sticky top-0 z-10 border-b border-forest/5">
                    <div className="w-10 h-1 bg-charcoal/20 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
                    <div /> {/* spacer */}
                    <button
                        onClick={dismiss}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-cream hover:bg-charcoal/10 transition-colors ml-auto"
                        aria-label="Close"
                    >
                        <i className="fas fa-xmark text-charcoal/50 text-sm"></i>
                    </button>
                </div>

                <ReservationSidebar hotelName={hotelName} location={location} />
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slide-up { from { transform: translateY(100%) } to { transform: translateY(0) } }
                .animate-fade-in { animation: fade-in 0.3s ease forwards; }
                .animate-slide-up { animation: slide-up 0.35s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
            `}</style>
        </>
    );
};
