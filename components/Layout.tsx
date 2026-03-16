'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from '../context/SettingsContext';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';

const Header = () => {
  const { settings } = useSettings();
  const [scrolled, setScrolled] = React.useState(false);
  const [hotels, setHotels] = React.useState<any[]>([]);
  const [destinations, setDestinations] = React.useState<any[]>([]);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Use a very small threshold for immediate feedback
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Fetch navigation data
    const fetchNavData = async () => {
      const { data: hotelsData } = await supabase.from('hotels').select('name, slug').order('name');
      const { data: destsData } = await supabase.from('destinations').select('name, slug').order('name');
      if (hotelsData) setHotels(hotelsData);
      if (destsData) setDestinations(destsData);
    };
    fetchNavData();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isScrolledState = scrolled || !isHome || mobileMenuOpen;

  if (!mounted) {
    return (
      <header className={`fixed top-0 left-0 right-0 z-[100] h-16 lg:h-20 w-full ${!isHome ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="h-full container mx-auto px-6 flex items-center justify-between" />
      </header>
    );
  }

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-[100] h-16 lg:h-20 w-full transition-colors duration-300 ${isScrolledState ? 'bg-white shadow-md text-forest' : 'bg-transparent text-white'}`}
      >
        <div className="h-full container mx-auto px-6 flex items-center justify-between relative">
          
          {/* Logo - Force fixed dimensions to prevent any layout shifts */}
          <Link href="/" className="flex items-center gap-3 relative z-[110] shrink-0">
            {settings.logoUrl ? (
              <div className="h-8 md:h-10 w-32 md:w-40 flex items-center">
                <img 
                  src={(isScrolledState && settings.logoUrl2) ? settings.logoUrl2 : settings.logoUrl} 
                  alt={settings.siteName} 
                  className={`h-full w-auto object-contain transition-all duration-300 ${isScrolledState && !settings.logoUrl2 ? 'brightness-0' : ''}`}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg ${isScrolledState ? 'bg-terracotta text-white' : 'bg-gradient-to-tr from-terracotta to-terracotta/80 text-white'}`}>
                  <i className="fas fa-mountain text-sm md:text-base"></i>
                </div>
                <span className="text-lg md:text-xl lg:text-2xl font-bold tracking-tighter font-heading uppercase whitespace-nowrap">
                  ESCAPE <span className="font-light opacity-70">STAYZ</span>
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 font-body">
            <Link href="/#about" className="font-medium text-sm hover:text-terracotta transition-colors">About us</Link>

            <div className="relative group cursor-pointer">
              <span className="font-medium text-sm flex items-center gap-1 group-hover:text-terracotta transition-colors py-4">
                Our Properties <i className="fas fa-chevron-down text-[10px] opacity-70"></i>
              </span>
              <div className="absolute top-full left-0 bg-white rounded-xl shadow-xl w-56 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all transform translate-y-2 group-hover:translate-y-0 p-2 flex flex-col gap-1 z-[105] text-charcoal">
                <Link href="/hotels" className="block px-4 py-2 text-terracotta hover:bg-terracotta/5 rounded-lg text-sm font-bold border-b border-forest/5 mb-1">
                  View All Properties
                </Link>
                {hotels.map(hotel => (
                  <Link key={hotel.slug} href={`/hotels/${hotel.slug}`} className="block px-4 py-2 text-forest hover:bg-forest/5 rounded-lg text-sm font-medium truncate">
                    {hotel.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative group cursor-pointer">
              <span className="font-medium text-sm flex items-center gap-1 group-hover:text-terracotta transition-colors py-4">
                Destinations <i className="fas fa-chevron-down text-[10px] opacity-70"></i>
              </span>
              <div className="absolute top-full left-0 bg-white rounded-xl shadow-xl w-56 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all transform translate-y-2 group-hover:translate-y-0 p-2 flex flex-col gap-1 z-[105] text-charcoal">
                <Link href="/destinations" className="block px-4 py-2 text-terracotta hover:bg-terracotta/5 rounded-lg text-sm font-bold border-b border-forest/5 mb-1">
                  All Destinations
                </Link>
                {destinations.map(dest => (
                  <Link key={dest.slug} href={`/destinations/${dest.slug}`} className="block px-4 py-2 text-forest hover:bg-forest/5 rounded-lg text-sm font-medium truncate">
                    {dest.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/blog" className="font-medium text-sm hover:text-terracotta transition-colors">Journal</Link>
            <Link href="/admin" className={`font-medium text-sm hover:text-terracotta transition-colors border px-3 py-1 rounded-md ${isScrolledState ? 'border-forest/10 bg-forest/5' : 'border-white/20 bg-white/10'}`}>
              Admin
            </Link>
          </nav>

          {/* Mobile Menu Button - Locked dimensions and fixed position at end of flex */}
          <div className="lg:hidden flex justify-end shrink-0 w-12">
            <button
              className="text-2xl focus:outline-none h-12 w-12 flex items-center justify-end relative z-[110]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} w-8 text-center`}></i>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-forest z-40 transition-all duration-300 lg:hidden ${mobileMenuOpen ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible'}`}>
        <div className="flex flex-col h-full pt-28 px-6 pb-10 overflow-y-auto">
          <nav className="flex flex-col gap-6 text-white font-heading">
            <Link href="/" className="text-xl font-bold border-b border-white/10 pb-4">Home</Link>
            <Link href="/#about" className="text-xl font-bold border-b border-white/10 pb-4">About Us</Link>
            <Link href="/blog" className="text-xl font-bold border-b border-white/10 pb-4">Journal</Link>

            <div className="border-b border-white/10 pb-4">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-4">Our Properties</p>
              <div className="flex flex-col gap-4 pl-4">
                <Link href="/hotels" className="text-lg font-bold text-terracotta">All Properties</Link>
                {hotels.map(hotel => (
                  <Link key={hotel.slug} href={`/hotels/${hotel.slug}`} className="text-base text-white/90">
                    {hotel.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-b border-white/10 pb-4">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-4">Destinations</p>
              <div className="flex flex-col gap-4 pl-4">
                <Link href="/destinations" className="text-lg font-bold text-terracotta">All Destinations</Link>
                {destinations.map(dest => (
                  <Link key={dest.slug} href={`/destinations/${dest.slug}`} className="text-base text-white/90">
                    {dest.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/plan-your-trip" className="text-xl font-bold border-b border-white/10 pb-4 text-terracotta">AI Concierge</Link>
            <Link href="/admin" className="text-sm opacity-50">Admin Panel</Link>
          </nav>
        </div>
      </div>
    </>
  );
};

const Footer = () => {
  const { settings } = useSettings();
  return (
    <footer className="bg-charcoal text-white pt-24 pb-12 font-body">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-white/5 pb-16 mb-12">
        {/* Brand Section */}
        <div className="space-y-6">
          <Link href="/" className="inline-block">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.siteName} className="h-12 w-auto object-contain brightness-0 invert" />
            ) : (
              <div className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-charcoal">
                  <i className="fas fa-mountain"></i>
                </div>
                <span className="font-heading">ESCAPE</span>
              </div>
            )}
          </Link>
          <p className="text-white/60 text-sm leading-relaxed font-light max-w-sm">
            Crafting silent luxury and refined mountain hospitality across the globe's most secluded peaks.
          </p>

          {/* Social Icons - Moved here for better layout */}
          <div className="flex gap-4 pt-4">
            <a href={settings.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-terracotta hover:text-white transition-all duration-300">
              <i className="fab fa-instagram"></i>
            </a>
            <a href={settings.socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-terracotta hover:text-white transition-all duration-300">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href={settings.socials.pinterest} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-terracotta hover:text-white transition-all duration-300">
              <i className="fab fa-pinterest-p"></i>
            </a>
            <a href={settings.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-terracotta hover:text-white transition-all duration-300">
              <i className="fab fa-facebook-f"></i>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="md:pl-12">
          <h4 className="font-heading text-xl mb-8">Navigation</h4>
          <ul className="space-y-4 text-white/50 text-sm">
            <li><Link href="/#about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/hotels" className="hover:text-white transition-colors">Our Properties</Link></li>
            <li><Link href="/destinations" className="hover:text-white transition-colors">Destinations</Link></li>
            <li><Link href="/blog" className="hover:text-white transition-colors">Journal</Link></li>
          </ul>
        </div>
 
        {/* Guest Care */}
        <div>
          <h4 className="font-heading text-xl mb-8">Guest Care</h4>
          <ul className="space-y-4 text-white/50 text-sm">
            <li><Link href="/contact" className="hover:text-white transition-colors">Get in Touch</Link></li>
            <li><Link href="/admin" className="hover:text-terracotta transition-colors font-bold text-terracotta/80 uppercase tracking-widest text-[9px]">Staff Portal</Link></li>
            <li className="pt-4 space-y-1">
              <p className="text-[10px] text-white/40 font-mono tracking-tighter">{settings.contact.phone}</p>
              <p className="text-[10px] text-white/40 font-mono tracking-tighter">{settings.contact.email}</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-white/30 text-[10px] uppercase tracking-[0.2em] gap-6">
        <p>© {new Date().getFullYear()} {settings.siteName} Luxury Group.</p>
        <div className="flex gap-8">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};


export const Layout: React.FC<{ children: React.ReactNode, title?: string }> = ({ children }) => {
  const { settings } = useSettings();
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  const whatsappNumber = settings.contact.phone.replace(/\D/g, '');

  return (
    <div className="min-h-screen flex flex-col selection:bg-forest selection:text-white">
      <Header />
      <main className={`flex-grow relative ${isHome ? '' : 'pt-16 lg:pt-20'} pb-24 lg:pb-0`}>
        {children}
      </main>
      <Footer />

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 z-[9999] bg-[#25D366] text-white w-14 h-14 rounded-full hidden lg:flex items-center justify-center shadow-lg hover:bg-[#128C7E] transition-all hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <i className="fab fa-whatsapp text-3xl"></i>
      </a>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-[9999] px-6 py-3 lg:hidden safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <ul className="flex justify-between items-center">
          <li>
            <Link href="/" className={`flex flex-col items-center gap-1 ${pathname === '/' ? 'text-terracotta' : 'text-forest/60'}`}>
              <i className="fas fa-home text-lg"></i>
              <span className="text-[10px] font-medium">Home</span>
            </Link>
          </li>
          <li>
            <Link href="/hotels" className={`flex flex-col items-center gap-1 ${pathname.startsWith('/hotels') ? 'text-terracotta' : 'text-forest/60'}`}>
              <i className="fas fa-mountain text-lg"></i>
              <span className="text-[10px] font-medium">Properties</span>
            </Link>
          </li>
          <li>
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-[#25D366]">
              <i className="fab fa-whatsapp text-lg"></i>
              <span className="text-[10px] font-medium">WhatsApp</span>
            </a>
          </li>
          <li>
            <a href={`tel:${settings.contact.phone}`} className="flex flex-col items-center gap-1 text-forest/60">
              <i className="fas fa-phone-alt text-lg"></i>
              <span className="text-[10px] font-medium">Contact</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};
