
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleBypass = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Directly navigate to dashboard
        setTimeout(() => {
            router.push('/admin');
        }, 500);
    };

    return (
        <div className="min-h-screen bg-charcoal flex items-center justify-center p-6 relative overflow-hidden text-white">
            {/* Visual Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-forest/20 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-umber/10 blur-[150px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-forest rounded-3xl flex items-center justify-center text-white text-2xl mx-auto mb-8 shadow-2xl shadow-forest/40">
                        <i className="fas fa-mountain"></i>
                    </div>
                    <h1 className="text-white text-3xl font-serif italic mb-2">Hotel Command</h1>
                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.4em]">Administrative Gateway</p>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-10 rounded-3xl shadow-2xl">
                    <div className="text-center mb-8">
                        <p className="text-sm text-white/60 font-light mb-6">Direct administrative access is currently enabled for development.</p>
                    </div>

                    <button
                        onClick={handleBypass}
                        disabled={loading}
                        className="w-full bg-forest text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-forest/80 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? 'Initializing Console...' : 'Enter Admin Portal'}
                    </button>
                </div>

                <p className="text-center text-white/20 text-[8px] font-bold uppercase tracking-widest mt-12">
                    Secure Internal Environment • Escape Stayz
                </p>
            </div>
        </div>
    );
}
