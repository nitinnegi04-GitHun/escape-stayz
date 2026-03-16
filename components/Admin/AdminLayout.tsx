
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check or load
    setLoading(false);
  }, []);

  const handleLogout = () => {
    router.push('/');
  };

  if (loading) return (
    <div className="h-screen bg-charcoal flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-forest border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const menuItems = [
    { label: 'Overview', icon: 'chart-pie', path: '/admin' },
    { label: 'Hotel Fleet', icon: 'hotel', path: '/admin/hotels' },
    { label: 'Amenities', icon: 'star', path: '/admin/amenities' },
    { label: 'Visual Assets', icon: 'images', path: '/admin/gallery' },
    { label: 'Blogs', icon: 'feather', path: '/admin/blog' },
    { label: 'Destinations', icon: 'map-location-dot', path: '/admin/destinations' },
    { label: 'Pages', icon: 'file-lines', path: '/admin/pages' },
    { label: 'Reservations', icon: 'calendar-check', path: '/admin/bookings' },
    { label: 'Settings', icon: 'sliders', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-charcoal text-white flex flex-col fixed inset-y-0 shadow-2xl z-50">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center text-white text-xs">
              <i className="fas fa-mountain"></i>
            </div>
            <span className="font-heading uppercase tracking-[0.2em] text-sm">Command <span className="text-forest">Center</span></span>
          </Link>
        </div>

        <nav className="flex-grow p-6 space-y-2 overflow-y-auto">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 mb-4 px-3">Management</p>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-4 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${pathname === item.path
                ? 'bg-forest text-white shadow-lg shadow-forest/10'
                : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
            >
              <i className={`fas fa-${item.icon} w-5`}></i>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-forest flex items-center justify-center text-[10px] font-bold">
                M
              </div>
              <div className="truncate w-32">
                <p className="text-[10px] font-bold truncate">Master Admin</p>
                <p className="text-[8px] text-white/30 uppercase tracking-widest">System Access</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 hover:text-red-400 transition-colors"
          >
            <i className="fas fa-sign-out-alt"></i>
            Exit Terminal
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-heading text-charcoal italic capitalize">
              {pathname === '/admin' ? 'Executive Overview' : pathname?.split('/').pop()?.replace('-', ' ')}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30 mt-1">Content Archive Control</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-charcoal/5 flex items-center gap-4">
              <i className="fas fa-bell text-charcoal/20 text-xs"></i>
              <div className="w-px h-4 bg-charcoal/10"></div>
              <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">Editor: Ready</span>
            </div>
          </div>
        </header>

        <div className="animate-in fade-in duration-700">
          {children}
        </div>
      </main>
    </div>
  );
};

