
'use client';

import React from 'react';

export default function AdminBookingsPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-24 h-24 bg-forest/5 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-calendar-check text-4xl text-forest/40"></i>
            </div>
            <h2 className="text-3xl font-serif italic text-charcoal mb-4">Reservations Management</h2>
            <p className="max-w-md text-charcoal/60 leading-relaxed mb-8">
                Current bookings are handled directly via WhatsApp Concierge.
                <br />
                Digital reservation syncing is coming in a future update.
            </p>
            <button className="bg-charcoal text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-forest transition-colors shadow-xl">
                View WhatsApp Logs
            </button>
        </div>
    );
}
