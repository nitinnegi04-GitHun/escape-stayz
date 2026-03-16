
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

// Revalidate every minute for admin dashboard stats
export const revalidate = 60;

export default async function AdminDashboardPage() {
    const [hRes, pRes, dRes] = await Promise.all([
        supabase.from('hotels').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('destinations').select('*', { count: 'exact', head: true }),
    ]);

    const stats = {
        hotels: hRes.count || 0,
        posts: pRes.count || 0,
        destinations: dRes.count || 0,
    };

    const cards = [
        { label: 'Active Hotels', value: stats.hotels, icon: 'hotel', color: 'bg-blue-500' },
        { label: 'Journal Entries', value: stats.posts, icon: 'feather', color: 'bg-forest' },
        { label: 'Territories Map', value: stats.destinations, icon: 'globe', color: 'bg-umber' },
        { label: 'Guest Inquiries', value: 12, icon: 'message-dots', color: 'bg-purple-500' },
    ];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-charcoal/5 group hover:shadow-xl transition-all duration-500">
                        <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center text-white text-lg mb-4 shadow-lg shadow-charcoal/5`}>
                            <i className={`fas fa-${card.icon}`}></i>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30 mb-1">{card.label}</p>
                        <h3 className="text-3xl font-heading text-charcoal">{card.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    {/* CRM Activity Section */}
                    <div className="bg-white rounded-3xl shadow-sm border border-charcoal/5 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-serif italic">Operational Log</h4>
                            <button className="text-[10px] font-bold uppercase tracking-widest text-forest">View History</button>
                        </div>
                        <div className="space-y-6">
                            {[
                                { event: 'New Hotel Registered', meta: 'Baspa River Hotel', time: '2h ago', icon: 'plus-circle' },
                                { event: 'Journal Post Published', meta: 'Best Time to Visit Spiti', time: '5h ago', icon: 'check-circle' },
                                { event: 'Metadata Synchronized', meta: 'System Global Update', time: '1d ago', icon: 'rotate' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f8f9fa] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-charcoal/5 rounded-full flex items-center justify-center text-charcoal/30 text-xs">
                                            <i className={`fas fa-${item.icon}`}></i>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-charcoal">{item.event}</p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/30">{item.meta}</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-charcoal/20 uppercase">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className="bg-charcoal p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <h4 className="text-xl font-serif italic mb-6">Concierge AI Load</h4>
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-3">
                                    <span>Inference Tokens</span>
                                    <span>84%</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-forest w-[84%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-3">
                                    <span>Database Sharding</span>
                                    <span>Optimal</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-forest w-full"></div>
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                            System Diagnostics
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
