'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Users, Clock, Eye, IndianRupee, MessageCircle, Filter, Send, X } from 'lucide-react';
import emailjs from '@emailjs/browser';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Image from 'next/image';
import { Layout } from '../../components/Layout';
import { itineraries, accommodationRates } from '../../lib/itinerary';

emailjs.init('XKfAUOimCDkMQZMvq');

type Itinerary = typeof itineraries[0];

// ── Itinerary Card ─────────────────────────────────────────────────────────────

const ItineraryCard: React.FC<{
    itinerary: Itinerary;
    onViewDetails: (i: Itinerary) => void;
    onBookNow: (i: Itinerary) => void;
}> = ({ itinerary, onViewDetails, onBookNow }) => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-forest/10 hover:shadow-xl transition-all duration-300 flex flex-col">
        <div className="relative h-52 flex-shrink-0">
            <Image
                src={itinerary.image || '/og-default.jpg'}
                alt={itinerary.title}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-base font-heading font-bold text-white mb-1.5 leading-snug">{itinerary.title}</h3>
                <div className="flex justify-between items-center">
                    <p className="text-white/80 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />{itinerary.duration}
                    </p>
                    <span className="text-white text-[10px] font-bold bg-terracotta/80 px-2.5 py-0.5 rounded-full">
                        {itinerary.bestMonths}
                    </span>
                </div>
            </div>
        </div>

        <div className="p-5 flex flex-col flex-grow">
            <p className="text-charcoal/60 text-sm mb-4 line-clamp-2 leading-relaxed">{itinerary.description}</p>

            <div className="bg-forest/5 px-4 py-3 rounded-xl mb-4 border border-forest/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-0.5">Starting from</p>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-terracotta">₹{itinerary.pricing.standard.basePrice.toLocaleString()}</span>
                    <span className="text-xs text-charcoal/50">per person</span>
                </div>
                <p className="text-[10px] text-charcoal/40 mt-0.5">*Standard package</p>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-5">
                {itinerary.highlights.slice(0, 2).map((h, i) => (
                    <span key={i} className="bg-cream text-forest text-[10px] font-medium px-2.5 py-1 rounded-full border border-forest/10">
                        {h}
                    </span>
                ))}
            </div>

            <div className="mt-auto flex flex-col gap-2">
                <button
                    onClick={() => onViewDetails(itinerary)}
                    className="w-full bg-forest text-white px-4 py-2.5 rounded-xl hover:bg-forest/90 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
                >
                    <Eye className="w-4 h-4" />
                    View Details
                </button>
                <button
                    onClick={() => onBookNow(itinerary)}
                    className="w-full bg-whatsapp hover:bg-whatsapp-dark text-white px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
                >
                    <MessageCircle className="w-4 h-4" />
                    Book Now
                </button>
            </div>
        </div>
    </div>
);

// ── Section Heading Helper ─────────────────────────────────────────────────────

const SectionHeading: React.FC<{ label: string; title: string; subtitle?: string; center?: boolean }> = ({
    label, title, subtitle, center = true
}) => (
    <div className={`mb-12 ${center ? 'text-center max-w-2xl mx-auto' : ''}`}>
        <span className="text-terracotta font-bold uppercase tracking-[0.2em] text-sm block mb-4">{label}</span>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-forest leading-tight">{title}</h2>
        <div className={`w-16 h-1 bg-terracotta mt-5 mb-6 rounded-full ${center ? 'mx-auto' : ''}`} />
        {subtitle && <p className="text-charcoal/60 text-base md:text-lg leading-relaxed font-light">{subtitle}</p>}
    </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function PlanTripClient() {
    const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [durationFilter, setDurationFilter] = useState('all');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formRef.current) return;
        setIsSubmitting(true);
        setSubmitSuccess(null);
        setSubmitError(null);

        const formattedDates = startDate && endDate
            ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
            : '';
        const formData = new FormData(formRef.current);
        formData.set('travelDates', formattedDates);
        const templateParams = Object.fromEntries(formData.entries());

        emailjs.send('service_g1tl1wf', 'template_q6t8wad', templateParams, 'XKfAUOimCDkMQZMvq')
            .then(() => {
                setSubmitSuccess(true);
                setIsSubmitting(false);
                formRef.current?.reset();
                setStartDate(null);
                setEndDate(null);
            })
            .catch((err) => {
                console.error('Email error:', err);
                setSubmitError('There was an error sending your request. Please try again or contact us directly.');
                setIsSubmitting(false);
            });
    };

    const handleBookNow = (itinerary: Itinerary) => {
        const msg = encodeURIComponent(`Hi, I'm interested in the ${itinerary.title} package (${itinerary.duration}). Please help me with availability and rates.`);
        window.open(`https://wa.me/918448048862?text=${msg}`, '_blank');
    };

    const filteredItineraries = itineraries.filter(it => {
        if (durationFilter === 'all') return true;
        if (durationFilter === '1-3') return it.days >= 1 && it.days <= 3;
        if (durationFilter === '4-7') return it.days >= 4 && it.days <= 7;
        if (durationFilter === '8+') return it.days >= 8;
        return true;
    });

    const scrollToItineraries = () => {
        document.getElementById('itineraries-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Layout>
            <div>

                {/* ── Hero ── */}
                <div className="relative h-[65vh] md:h-screen w-full overflow-hidden">
                    <Image
                        src="https://res.cloudinary.com/dzsazqbfe/image/upload/v1739812680/Escape%20Inn%20Kaza/ely7xovvoealgmeuaoho.jpg"
                        alt="Spiti Valley Landscape"
                        className="object-cover"
                        fill
                        priority
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 lg:px-20">
                        <div className="max-w-3xl">
                            <span className="text-terracotta font-bold uppercase tracking-[0.2em] text-sm block mb-6">Plan Your Trip</span>
                            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-8 leading-tight">
                                <span className="block">No Middlemen.</span>
                                <span className="block">No Guesswork.</span>
                                <span className="block text-terracotta">Just Authentic Travel.</span>
                            </h1>
                            <button
                                onClick={scrollToItineraries}
                                className="bg-terracotta hover:bg-terracotta/90 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 text-base"
                            >
                                Start Planning
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Planning Struggles ── */}
                <div className="bg-forest/5 py-6 px-6 md:px-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center max-w-2xl mx-auto mb-14">
                            <span className="text-terracotta font-bold uppercase tracking-[0.2em] text-sm block mb-4">We Understand</span>
                            <h2 className="text-3xl md:text-4xl font-heading font-bold text-forest leading-tight mb-5">
                                Planning a Trip to Spiti or Kinnaur?<br className="hidden md:block" /> We Know the Struggle!
                            </h2>
                            <div className="w-16 h-1 bg-terracotta mx-auto rounded-full mb-6" />
                            <p className="text-charcoal/60 text-base md:text-lg leading-relaxed font-light">
                                It's about finding the perfect itinerary that fits your travel style—whether you love slow travel, adventure-packed days, or a mix of both—all while making sure it fits within your limited holidays.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
                            {[
                                {
                                    title: 'Sounds Familiar?',
                                    items: [
                                        { emoji: '😩', bold: 'Where do I even stay?', body: 'Google throws a hundred options, but which ones are actually good?' },
                                        { emoji: '🚗', bold: 'Will my car survive these roads?', body: 'Some say a hatchback is fine, others swear by a 4x4. Who to trust?' },
                                        { emoji: '📅', bold: 'Am I planning this right?', body: 'What if I book hotels too far apart or get stuck somewhere?' },
                                        { emoji: '💰', bold: 'Why is everything so expensive?', body: 'Hidden costs, overpriced taxis, and last-minute surprises—no thanks!' },
                                    ]
                                },
                                {
                                    title: "Here's Where We Step In!",
                                    items: [
                                        { emoji: '👋', bold: "Hey there, we're locals!", body: 'We own hotels along this route, so we know exactly where you should stay.' },
                                        { emoji: '🚙', bold: 'Need a ride?', body: "We'll hook you up with reliable transport—cabs, tempo travelers, whatever works best." },
                                        { emoji: '🗺️', bold: 'Confused about the itinerary?', body: "We'll suggest the best route based on real-time road & weather conditions." },
                                        { emoji: '💸', bold: 'No middlemen, no inflated prices.', body: 'Just fair deals from people who actually live here.' },
                                    ]
                                }
                            ].map(col => (
                                <div key={col.title} className="bg-white p-8 rounded-2xl shadow-sm border border-forest/10">
                                    <h3 className="text-xl font-heading font-bold text-forest mb-6 pb-4 border-b border-forest/10">{col.title}</h3>
                                    <div className="space-y-5">
                                        {col.items.map((item, i) => (
                                            <div key={i} className="flex items-start gap-4">
                                                <span className="text-2xl flex-shrink-0 leading-none mt-0.5">{item.emoji}</span>
                                                <p className="text-charcoal/70 text-sm leading-relaxed">
                                                    <span className="font-semibold text-forest">{item.bold} </span>
                                                    {item.body}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center">
                            <p className="text-charcoal/60 text-lg mb-6 font-light">
                                Whether you just need stays or a full package with stay + transport, we've got your back.
                            </p>
                            <button
                                onClick={scrollToItineraries}
                                className="bg-terracotta hover:bg-terracotta/90 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-105"
                            >
                                View Recommended Itineraries
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Trip Cost Overview ── */}
                <div className="py-2 px-6 md:px-12 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <SectionHeading
                            label="Transparent Pricing"
                            title="Trip Cost Overview"
                            subtitle="Choose the package that suits your travel style. All prices are per person and include accommodation and meals."
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {accommodationRates.map(rate => (
                                <div key={rate.id} className="bg-white rounded-2xl shadow-md p-7 border border-forest/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-xl font-heading font-bold text-forest">{rate.name}</h3>
                                        <div className="bg-terracotta/10 p-2.5 rounded-full">
                                            <IndianRupee className="w-5 h-5 text-terracotta" />
                                        </div>
                                    </div>
                                    <p className="text-charcoal/60 text-sm mb-5 leading-relaxed">{rate.description}</p>
                                    <div className="bg-forest/5 px-4 py-3 rounded-xl border border-forest/10">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-1">Price Range</p>
                                        <p className="text-terracotta font-bold text-base">{rate.priceRange}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Itineraries ── */}
                <div id="itineraries-section" className="py-6 px-6 md:px-12 bg-cream/40 scroll-mt-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                            <SectionHeading
                                label="Handpicked Routes"
                                title="Recommended Itineraries"
                                center={false}
                            />
                            <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-forest/10 px-3 py-2 self-start md:self-auto mb-12 md:mb-0">
                                <Filter className="w-4 h-4 text-terracotta flex-shrink-0" />
                                <span className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Days:</span>
                                <div className="flex gap-1">
                                    {[
                                        { value: 'all', label: 'All' },
                                        { value: '1-3', label: '1–3' },
                                        { value: '4-7', label: '4–7' },
                                        { value: '8+', label: '8+' },
                                    ].map(f => (
                                        <button
                                            key={f.value}
                                            onClick={() => setDurationFilter(f.value)}
                                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${durationFilter === f.value ? 'bg-terracotta text-white' : 'bg-charcoal/5 text-charcoal/70 hover:bg-charcoal/10'}`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItineraries.map(it => (
                                <ItineraryCard
                                    key={it.id}
                                    itinerary={it}
                                    onViewDetails={setSelectedItinerary}
                                    onBookNow={handleBookNow}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Custom Itinerary Form ── */}
                <div className="py-6 px-6 md:px-12 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <SectionHeading
                            label="Get in Touch"
                            title="Request a Custom Itinerary"
                            subtitle="Don't see what you're looking for? Tell us your requirements and we'll craft a bespoke itinerary just for you."
                        />

                        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8 border border-forest/10">
                            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2">Your Name *</label>
                                        <input type="text" id="name" name="name" required placeholder="John Doe"
                                            className="w-full px-4 py-3 border border-forest/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta" />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2">Email Address *</label>
                                        <input type="email" id="email" name="email" required placeholder="john@example.com"
                                            className="w-full px-4 py-3 border border-forest/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2">Phone Number *</label>
                                        <input type="tel" id="phone" name="phone" required placeholder="+91 98765 43210"
                                            className="w-full px-4 py-3 border border-forest/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2">Travel Dates</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-terracotta pointer-events-none z-10" />
                                            <DatePicker
                                                selected={startDate}
                                                onChange={(dates: [Date | null, Date | null]) => { setStartDate(dates[0]); setEndDate(dates[1]); }}
                                                startDate={startDate ?? undefined}
                                                endDate={endDate ?? undefined}
                                                selectsRange
                                                minDate={new Date()}
                                                placeholderText="Select travel dates"
                                                name="travelDates"
                                                className="w-full pl-9 pr-4 py-3 border border-forest/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="groupSize" className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2">Number of Travelers *</label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-terracotta pointer-events-none" />
                                            <input type="number" id="groupSize" name="groupSize" required min="1" placeholder="2"
                                                className="w-full pl-9 pr-4 py-3 border border-forest/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="duration" className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2">Trip Duration *</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-terracotta pointer-events-none" />
                                            <select id="duration" name="duration" required
                                                className="w-full pl-9 pr-4 py-3 border border-forest/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta appearance-none bg-white">
                                                <option value="">Select Duration</option>
                                                <option value="3-4 days">3–4 days</option>
                                                <option value="5-7 days">5–7 days</option>
                                                <option value="8-10 days">8–10 days</option>
                                                <option value="More than 10 days">More than 10 days</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2">Special Requirements or Questions</label>
                                    <textarea id="message" name="message" rows={4} placeholder="Tell us about any specific requirements, interests, or questions…"
                                        className="w-full px-4 py-3 border border-forest/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta resize-none" />
                                </div>

                                {submitSuccess && (
                                    <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl text-sm">
                                        Thank you for your inquiry! We'll get back to you within 24 hours.
                                    </div>
                                )}
                                {submitError && (
                                    <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">
                                        {submitError}
                                    </div>
                                )}

                                <button type="submit" disabled={isSubmitting}
                                    className="w-full bg-terracotta hover:bg-terracotta/90 disabled:opacity-60 text-white px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 font-semibold">
                                    {isSubmitting ? 'Sending…' : <><Send className="w-4 h-4" /> Send Inquiry</>}
                                </button>

                                <p className="text-[11px] text-charcoal/40 text-center">Fields marked with * are required. We respond within 24 hours.</p>
                            </form>
                        </div>
                    </div>
                </div>

                {/* ── Itinerary Detail Modal ── */}
                {selectedItinerary && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 overflow-y-auto">
                        <div className="relative bg-white rounded-2xl max-w-4xl w-full my-8">
                            <button
                                onClick={() => setSelectedItinerary(null)}
                                className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal z-10 bg-white rounded-full p-1.5 shadow-md"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="relative h-72 rounded-t-2xl overflow-hidden">
                                <Image src={selectedItinerary.image || '/og-default.jpg'} alt={selectedItinerary.title} className="object-cover" fill sizes="(max-width: 768px) 100vw, 800px" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-16">
                                    <h2 className="text-2xl font-heading font-bold text-white mb-2 leading-tight">{selectedItinerary.title}</h2>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="text-white/80 text-sm flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{selectedItinerary.duration}</span>
                                        <span className="bg-terracotta/80 text-white text-xs font-bold px-3 py-0.5 rounded-full">Best: {selectedItinerary.bestMonths}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-8">
                                <p className="text-charcoal/60 mb-8 leading-relaxed border-b border-forest/10 pb-8">{selectedItinerary.description}</p>

                                <h3 className="text-lg font-heading font-bold text-forest mb-4">Highlights</h3>
                                <ul className="space-y-2 mb-8">
                                    {selectedItinerary.highlights.map((h, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-charcoal/70">
                                            <span className="text-terracotta font-bold mt-0.5 flex-shrink-0">•</span>{h}
                                        </li>
                                    ))}
                                </ul>

                                <h3 className="text-lg font-heading font-bold text-forest mb-4">Day-wise Itinerary</h3>
                                <div className="space-y-4 mb-8">
                                    {selectedItinerary.itineraryDays.map(day => (
                                        <div key={day.day} className="border-l-2 border-terracotta pl-4 pb-1">
                                            <h4 className="font-semibold text-forest text-sm mb-0.5">Day {day.day}: {day.title}</h4>
                                            <p className="text-charcoal/60 text-sm leading-relaxed">{day.description}</p>
                                            {day.overnight && day.overnight !== 'N/A' && (
                                                <p className="text-xs text-charcoal/40 mt-1">
                                                    <span className="font-medium">Overnight:</span> {day.overnight}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <h3 className="text-base font-heading font-bold text-forest mb-4">Inclusions</h3>
                                        <ul className="space-y-2">
                                            {selectedItinerary.inclusions.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-charcoal/70">
                                                    <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">✓</span>{item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-heading font-bold text-forest mb-4">Exclusions</h3>
                                        <ul className="space-y-2">
                                            {selectedItinerary.exclusions.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-charcoal/70">
                                                    <span className="text-red-400 font-bold flex-shrink-0 mt-0.5">✗</span>{item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <h3 className="text-base font-heading font-bold text-forest mb-4">Important Notes</h3>
                                <ul className="space-y-2 mb-8">
                                    {selectedItinerary.notes.map((note, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-charcoal/70">
                                            <span className="text-terracotta font-bold flex-shrink-0 mt-0.5">•</span>{note}
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex flex-col gap-3 pt-4 border-t border-forest/10">
                                    <button
                                        onClick={() => handleBookNow(selectedItinerary)}
                                        className="w-full bg-whatsapp hover:bg-whatsapp-dark text-white px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 font-semibold"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        Book This Package
                                    </button>
                                    <button
                                        onClick={() => setSelectedItinerary(null)}
                                        className="w-full bg-charcoal/8 text-charcoal/60 px-6 py-3 rounded-xl hover:bg-charcoal/12 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
                                    >
                                        <X className="w-4 h-4" />
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
