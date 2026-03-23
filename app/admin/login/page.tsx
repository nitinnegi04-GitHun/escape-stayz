'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/admin');
            router.refresh();
        }
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

                <form onSubmit={handleLogin} className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-10 rounded-3xl shadow-2xl">
                    <div className="mb-4">
                        <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
                            placeholder="admin@example.com"
                            required
                        />
                    </div>
                    
                    <div className="mb-8">
                        <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-forest text-white py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-forest/80 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <><i className="fas fa-circle-notch fa-spin"></i> Authenticating...</>
                        ) : (
                            <><i className="fas fa-lock"></i> Secure Login</>
                        )}
                    </button>
                </form>

                <p className="text-center text-white/20 text-[8px] font-bold uppercase tracking-widest mt-12">
                    Secure Internal Environment • Escape Stayz
                </p>
            </div>
        </div>
    );
}
