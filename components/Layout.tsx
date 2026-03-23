'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from '../context/SettingsContext';
import { supabase } from '../lib/supabase';
import Image from 'next/image';
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
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

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
      <header className={`fixed top-0 left-0 right-0 z-[100] h-16 lg:h-20 ${!isHome ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="h-full w-full max-w-[2400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 flex items-center justify-between" />
      </header>
    );
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] h-16 lg:h-20 transition-colors duration-300 ${isScrolledState ? 'bg-white shadow-md text-forest' : 'bg-transparent text-white'}`}
      >
        <div className="h-full w-full max-w-[2400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 flex items-center justify-between relative">

          {/* Logo - Force fixed dimensions to prevent any layout shifts */}
          <Link href="/" className="flex items-center gap-3 relative z-[110] shrink-0">
            {settings.logoUrl ? (
              <div className="h-8 md:h-10 w-32 md:w-40 flex items-center">
                <div className="relative w-full h-full flex items-center h-8 md:h-10 w-32 md:w-40">
                  <Image
                    src={(isScrolledState && settings.logoUrl2) ? settings.logoUrl2 : settings.logoUrl || '/Escape_Stayz_Transparent.png'}
                    alt={settings.siteName}
                    className={`object-contain transition-all duration-300 ${isScrolledState && !settings.logoUrl2 ? 'brightness-0' : ''}`}
                    fill
                    priority
                  />
                </div>
              </div>
            ) : (
              // Invisible placeholder while settings load — prevents fallback logo from flashing
              <div className="h-8 md:h-10 w-32 md:w-40" />
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
            <Link href="/plan-your-trip" className="font-medium text-sm hover:text-terracotta transition-colors">Plan Your Trip</Link>
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

            <Link href="/plan-your-trip" className="text-xl font-bold border-b border-white/10 pb-4 text-terracotta">Plan Your Trip</Link>
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
      <div className="w-full max-w-[2400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-white/5 pb-16 mb-12">
        {/* Brand Section */}
        <div className="space-y-6">
          <Link href="/" className="inline-block">
            {settings.logoUrl ? (
              <Image src={settings.logoUrl || '/Escape_Stayz_Transparent.png'} width={160} height={48} alt={settings.siteName} className="h-12 w-auto object-contain brightness-0 invert" />
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
            <a href={settings.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-terracotta hover:bg-terracotta hover:text-white transition-all duration-300">
              <i className="fab fa-instagram"></i>
            </a>
            <a href={settings.socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-terracotta hover:bg-terracotta hover:text-white transition-all duration-300">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href={settings.socials.pinterest} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-terracotta hover:bg-terracotta hover:text-white transition-all duration-300">
              <i className="fab fa-pinterest-p"></i>
            </a>
            <a href={settings.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-terracotta hover:bg-terracotta hover:text-white transition-all duration-300">
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

      <div className="w-full max-w-[2400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 flex flex-col md:flex-row justify-between items-center text-white/30 text-[10px] uppercase tracking-[0.2em] gap-6">
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
    <>
      {/* Fixed elements rendered outside the page wrapper to prevent compositing conflicts */}
      <Header />

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 z-[9999] text-white w-14 h-14 rounded-full hidden lg:flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300"
        style={{ backgroundColor: '#25D366' }}
        aria-label="Chat on WhatsApp"
      >
        <i className="fab fa-whatsapp text-3xl"></i>
      </a>

      {/* Mobile Bottom Navigation — Full width dark bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[9999] lg:hidden pb-safe" style={{ backgroundColor: 'rgba(45, 58, 58, 0.98)' }}>
        <div className="flex items-stretch border-t border-white/10 pt-1 pb-0">

          {/* Home */}
          <Link
            href="/"
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-200 relative ${pathname === '/' ? 'text-white' : 'text-white/45'}`}
          >
            {pathname === '/' && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-terracotta rounded-b-full" />}
            <i className="fas fa-home text-lg leading-none"></i>
            <span className="text-[10px] font-semibold tracking-wide uppercase">Home</span>
          </Link>

          {/* Stays */}
          <Link
            href="/hotels"
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 transition-all duration-200 relative ${pathname.startsWith('/hotels') ? 'text-white' : 'text-white/45'}`}
          >
            {pathname.startsWith('/hotels') && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-terracotta rounded-b-full" />}
            <i className="fas fa-mountain text-lg leading-none"></i>
            <span className="text-[10px] font-semibold tracking-wide uppercase">Stays</span>
          </Link>

          {/* WhatsApp — centre */}
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 transition-all duration-200 relative text-white"
          >
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] rounded-b-full" style={{ backgroundColor: '#25D366' }} />
            <i className="fab fa-whatsapp text-lg leading-none" style={{ color: '#25D366' }}></i>
            <span className="text-[10px] font-semibold tracking-wide uppercase" style={{ color: '#25D366' }}>Chat</span>
          </a>

          {/* Explore */}
          <Link
            href="/destinations"
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 transition-all duration-200 relative ${pathname.startsWith('/destinations') ? 'text-white' : 'text-white/45'}`}
          >
            {pathname.startsWith('/destinations') && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-terracotta rounded-b-full" />}
            <i className="fas fa-compass text-lg leading-none"></i>
            <span className="text-[10px] font-semibold tracking-wide uppercase">Explore</span>
          </Link>

          {/* Plan */}
          <Link
            href="/plan-your-trip"
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 transition-all duration-200 relative ${pathname === '/plan-your-trip' ? 'text-white' : 'text-white/45'}`}
          >
            {pathname === '/plan-your-trip' && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-terracotta rounded-b-full" />}
            <i className="fas fa-map-marked-alt text-lg leading-none"></i>
            <span className="text-[10px] font-semibold tracking-wide uppercase">Plan</span>
          </Link>

        </div>
      </nav>

      {/* Scrollable page content */}
      <div className="min-h-screen flex flex-col selection:bg-forest selection:text-white">
        <main className={`flex-grow relative ${isHome ? '' : 'pt-16 lg:pt-20'} pb-24 lg:pb-0`}>
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};
