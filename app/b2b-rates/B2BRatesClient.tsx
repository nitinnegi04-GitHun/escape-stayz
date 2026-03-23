'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Handshake, MapPin, Users, Mountain, Shield, Calendar, Clock } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface RatePlan {
    roomType: string;
    cpRate: number;
    mapRate: number;
    validFrom: string;
    validTo: string;
    extraAdultCPRate: number;
    extraAdultMAPRate: number;
    season: string;
}

interface HotelRates {
    hotelId: string;
    ratePlans: RatePlan[];
}

interface HotelInfo {
    id: string;
    name: string;
    location: string;
    description: string;
    features: string[];
    slug: string;
}

// ── Static Hotel Info ──────────────────────────────────────────────────────────

const hotelInfo: HotelInfo[] = [
    {
        id: 'escape-camps-rakcham',
        name: 'Escape Camps Rakcham',
        location: 'Rakcham, Kinnaur, Himachal Pradesh',
        description: 'A luxury glamping experience set amidst the stunning landscapes of Rakcham village in Kinnaur. Our tents offer a perfect blend of comfort and nature, with breathtaking views of the Baspa Valley and the mighty Kinner Kailash range.',
        features: ['Luxury Tents', 'Mountain Views', 'Authentic Cuisine', 'Cultural Experiences', 'Guided Treks'],
        slug: 'escape-camps-rakcham',
    },
    {
        id: 'escape-inn-kaza',
        name: 'Escape Inn Kaza',
        location: 'Kaza, Spiti Valley, Himachal Pradesh',
        description: 'A boutique inn nestled in the heart of Kaza, the gateway to the spectacular Spiti Valley. Offering warm hospitality and stunning Himalayan views at 3,800 metres, this is the perfect base for exploring Spiti\'s monasteries, villages and landscapes.',
        features: ['Mountain View Rooms', 'Family Rooms', 'Rooftop Dining', 'Monastery Tours', 'High Altitude Trekking'],
        slug: 'escape-inn-kaza',
    },
    {
        id: 'escape-inn-narkanda',
        name: 'Escape Inn Narkanda',
        location: 'Narkanda, Shimla District, Himachal Pradesh',
        description: 'A luxury retreat in the charming apple-orchard town of Narkanda, perched at 2,708 metres on the Hindustan-Tibet Highway. Our property offers stunning valley views, impeccable hospitality, and a serene escape from city life.',
        features: ['Valley View Rooms', 'Family Suites', 'Apple Orchard Walks', 'Skiing (Winter)', 'Bonfire Evenings'],
        slug: 'escape-inn-narkanda',
    },
];

// ── B2B Rate Data ──────────────────────────────────────────────────────────────

const b2bRates: HotelRates[] = [
    {
        hotelId: 'escape-camps-rakcham',
        ratePlans: [
            { roomType: 'Luxury Mountain View Tent', cpRate: 4500, mapRate: 5500, validFrom: '01 May', validTo: '30 June', extraAdultCPRate: 1250, extraAdultMAPRate: 1750, season: 'Season Rate' },
            { roomType: 'Luxury Mountain View Tent', cpRate: 3500, mapRate: 4500, validFrom: '1 April', validTo: '30 Apr', extraAdultCPRate: 1250, extraAdultMAPRate: 1750, season: 'Off Season Rate' },
            { roomType: 'Luxury Mountain View Tent', cpRate: 3500, mapRate: 4500, validFrom: '1 July ', validTo: '31 Oct', extraAdultCPRate: 1250, extraAdultMAPRate: 1750, season: 'Off Season Rate' },

        ],
    },
    {
        hotelId: 'escape-inn-kaza',
        ratePlans: [
            { roomType: 'Premium Mountain View Room', cpRate: 3500, mapRate: 4500, validFrom: '15 May', validTo: '15 Jul', extraAdultCPRate: 1250, extraAdultMAPRate: 1750, season: 'Season Rate' },
            { roomType: 'Premium Mountain View Room', cpRate: 3500, mapRate: 4500, validFrom: '15 Sep', validTo: '31 Oct', extraAdultCPRate: 1250, extraAdultMAPRate: 1750, season: 'Season Rate' },
            { roomType: 'Premium Mountain View Room', cpRate: 2500, mapRate: 3500, validFrom: '01 Nov', validTo: '14 May', extraAdultCPRate: 1250, extraAdultMAPRate: 1750, season: 'Off Season Rate' },
            { roomType: 'Premium Mountain View - Family Room', cpRate: 5500, mapRate: 7000, validFrom: '15 May', validTo: '15 Jul', extraAdultCPRate: 0, extraAdultMAPRate: 0, season: 'Season Rate' },
            { roomType: 'Premium Mountain View - Family Room', cpRate: 5500, mapRate: 7000, validFrom: '15 Sep', validTo: '31 Oct', extraAdultCPRate: 0, extraAdultMAPRate: 0, season: 'Season Rate' },
            { roomType: 'Premium Mountain View - Family Room', cpRate: 4500, mapRate: 6000, validFrom: '01 Nov', validTo: '14 May', extraAdultCPRate: 0, extraAdultMAPRate: 0, season: 'Off Season Rate' },
        ],
    },
    {
        hotelId: 'escape-inn-narkanda',
        ratePlans: [
            { roomType: 'Luxury Valley View - Family Suite', cpRate: 6000, mapRate: 8000, validFrom: '01 May', validTo: '15 Jul', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Season Rate' },
            { roomType: 'Luxury Valley View - Family Suite', cpRate: 6000, mapRate: 8000, validFrom: '15 Sep', validTo: '31 Oct', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Season Rate' },
            { roomType: 'Luxury Valley View - Family Suite', cpRate: 6000, mapRate: 8000, validFrom: '15 Dec', validTo: '31 Jan', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Season Rate' },
            { roomType: 'Premium Valley View (With Balcony)', cpRate: 3500, mapRate: 4500, validFrom: '01 May', validTo: '15 Jul', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Season Rate' },
            { roomType: 'Premium Valley View (With Balcony)', cpRate: 3500, mapRate: 4500, validFrom: '15 Sep', validTo: '31 Oct', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Season Rate' },
            { roomType: 'Premium Valley View (With Balcony)', cpRate: 3500, mapRate: 4500, validFrom: '15 Dec', validTo: '31 Jan', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Season Rate' },
            { roomType: 'Premium Valley View (Without Balcony)', cpRate: 3500, mapRate: 4500, validFrom: '01 May', validTo: '15 Jul', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Season Rate' },
            { roomType: 'Premium Valley View (Without Balcony)', cpRate: 3500, mapRate: 4500, validFrom: '15 Sep', validTo: '31 Oct', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Season Rate' },
            { roomType: 'Premium Valley View (Without Balcony)', cpRate: 3500, mapRate: 4500, validFrom: '15 Dec', validTo: '31 Jan', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Season Rate' },
            { roomType: 'Luxury Valley View - Family Suite', cpRate: 4500, mapRate: 6000, validFrom: '16 Jul', validTo: '14 Sep', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Off Season Rate' },
            { roomType: 'Luxury Valley View - Family Suite', cpRate: 4500, mapRate: 6000, validFrom: '01 Nov', validTo: '14 Dec', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Off Season Rate' },
            { roomType: 'Luxury Valley View - Family Suite', cpRate: 4500, mapRate: 6000, validFrom: '01 Feb', validTo: '30 Apr', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Off Season Rate' },
            { roomType: 'Premium Valley View (With Balcony)', cpRate: 2500, mapRate: 3500, validFrom: '16 Jul', validTo: '14 Sep', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Off Season Rate' },
            { roomType: 'Premium Valley View (With Balcony)', cpRate: 2500, mapRate: 3500, validFrom: '01 Nov', validTo: '14 Dec', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Off Season Rate' },
            { roomType: 'Premium Valley View (With Balcony)', cpRate: 2500, mapRate: 3500, validFrom: '01 Feb', validTo: '30 Apr', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Off Season Rate' },
            { roomType: 'Premium Valley View (Without Balcony)', cpRate: 2500, mapRate: 3500, validFrom: '16 Jul', validTo: '14 Sep', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Off Season Rate' },
            { roomType: 'Premium Valley View (Without Balcony)', cpRate: 2500, mapRate: 3500, validFrom: '01 Nov', validTo: '14 Dec', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Off Season Rate' },
            { roomType: 'Premium Valley View (Without Balcony)', cpRate: 2500, mapRate: 3500, validFrom: '01 Feb', validTo: '30 Apr', extraAdultCPRate: 1200, extraAdultMAPRate: 1700, season: 'Off Season Rate' },
        ],
    },
];

// ── Additional Images ──────────────────────────────────────────────────────────

// ── Consolidate Rate Plans ─────────────────────────────────────────────────────

const consolidateRatePlans = (ratePlans: RatePlan[]) => {
    const consolidated: {
        roomType: string;
        season: string;
        cpRate: number;
        mapRate: number;
        extraAdultCPRate: number;
        extraAdultMAPRate: number;
        validityPeriods: string[];
    }[] = [];

    ratePlans.forEach(plan => {
        const existing = consolidated.find(
            c => c.roomType === plan.roomType && c.season === plan.season && c.cpRate === plan.cpRate && c.mapRate === plan.mapRate
        );
        if (existing) {
            existing.validityPeriods.push(`${plan.validFrom} – ${plan.validTo}`);
        } else {
            consolidated.push({
                roomType: plan.roomType,
                season: plan.season,
                cpRate: plan.cpRate,
                mapRate: plan.mapRate,
                extraAdultCPRate: plan.extraAdultCPRate,
                extraAdultMAPRate: plan.extraAdultMAPRate,
                validityPeriods: [`${plan.validFrom} – ${plan.validTo}`],
            });
        }
    });

    return consolidated.sort((a, b) => {
        if (a.season !== b.season) return a.season === 'Season Rate' ? -1 : 1;
        return a.roomType.localeCompare(b.roomType);
    });
};

// ── Season Info per Hotel ──────────────────────────────────────────────────────

const SeasonInfo: React.FC<{ hotelId: string }> = ({ hotelId }) => {
    const seasons: Record<string, { season: string; off: string }> = {
        'escape-camps-rakcham': {
            season: 'May 1 – July 10',
            off: 'Rest of the year',
        },
        'escape-inn-kaza': {
            season: 'May 15 – July 15 & September 15 – October 31',
            off: 'Rest of the year',
        },
        'escape-inn-narkanda': {
            season: 'May 1 – July 15, September 15 – October 31 & December 15 – January 31',
            off: 'Rest of the year',
        },
    };
    const info = seasons[hotelId];
    if (!info) return null;
    return (
        <div className="ml-9 space-y-1.5">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-600 flex-shrink-0" />
                <p className="font-medium text-charcoal/80 text-sm">Season: {info.season}</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
                <p className="font-medium text-charcoal/80 text-sm">Off Season: {info.off}</p>
            </div>
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function B2BRatesClient() {
    const [selectedHotel, setSelectedHotel] = useState<string>('all');

    const visibleHotels = selectedHotel === 'all'
        ? hotelInfo
        : hotelInfo.filter(h => h.id === selectedHotel);

    const getConsolidatedRates = (hotelId: string) => {
        const plans = b2bRates.find(r => r.hotelId === hotelId)?.ratePlans ?? [];
        return consolidateRatePlans(plans);
    };

    return (
        <div className="min-h-screen bg-cream/30 pt-8 pb-16 px-4 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <Link href="/">
                        <Image
                            src="https://res.cloudinary.com/dzsazqbfe/image/upload/c_crop,w_400,h_200/v1739965913/Escape_Stayz_Transparent_ziqhph.png"
                            alt="EscapeStayz Logo"
                            className="h-16 w-auto object-contain"
                            width={160}
                            height={64}
                        />
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-heading font-bold text-forest">B2B Partner Rates</h1>
                </div>

                {/* ── Welcome Section ── */}
                <div className="bg-forest/5 rounded-2xl p-6 md:p-10 mb-12 border border-forest/15">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                        <div className="bg-white p-4 rounded-full shadow-md flex-shrink-0">
                            <Handshake className="w-12 md:w-16 h-12 md:h-16 text-forest" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-heading font-bold text-forest mb-2 text-center md:text-left">
                                Welcome Travel Partners
                            </h2>
                            <p className="text-charcoal/70 text-base md:text-lg text-center md:text-left">
                                Exclusive B2B rates for travel agents and tour operators
                            </p>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-sm border border-forest/10 mb-8">
                        <p className="text-charcoal/80 text-base font-medium mb-4">Dear Travel Partners,</p>
                        <p className="text-charcoal/70 mb-4 leading-relaxed">
                            We are delighted to welcome you to EscapeStayz's exclusive B2B Partner Portal. As a homegrown hospitality company founded by natives of Kinnaur over a decade ago, we bring authentic Himalayan experiences to your clients with our carefully curated properties in Kinnaur and Spiti Valley.
                        </p>
                        <p className="text-charcoal/70 leading-relaxed">
                            We look forward to building a mutually beneficial partnership that delivers exceptional value to your clients while maximizing your business potential. Our team is committed to providing you with prompt support, flexible booking options, and competitive rates that ensure healthy margins for your business.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[
                            { icon: <MapPin className="w-6 h-6 text-terracotta" />, title: 'Prime Locations', body: 'Strategic properties along the Kinnaur-Spiti circuit, perfect for creating seamless itineraries for your clients.' },
                            { icon: <Users className="w-6 h-6 text-terracotta" />, title: 'Local Expertise', body: 'As natives of Kinnaur, we offer unmatched local knowledge and can assist with any situation or special request your clients may have.' },
                            { icon: <Mountain className="w-6 h-6 text-terracotta" />, title: 'Competitive Rates', body: 'Enjoy special B2B rates that allow you to offer competitive packages while maintaining healthy profits.' },
                        ].map(card => (
                            <div key={card.title} className="bg-white p-6 rounded-xl shadow-sm border border-forest/10 hover:shadow-md transition-all">
                                <div className="flex items-center gap-2 mb-3">
                                    {card.icon}
                                    <h3 className="font-semibold text-forest text-base">{card.title}</h3>
                                </div>
                                <p className="text-charcoal/60 leading-relaxed text-sm">{card.body}</p>
                            </div>
                        ))}
                    </div>

                </div>

                {/* ── Split Layout: Left = Rates, Right = Sticky Local Advantage ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

                    {/* LEFT — Filter + Hotel Rate Tables */}
                    <div className="min-w-0">

                        {/* Property Filter Buttons */}
                        <div className="mb-8">
                            <p className="text-xs font-bold uppercase tracking-widest text-charcoal/40 mb-3">View Rates For</p>
                            <div className="flex flex-wrap gap-3">
                                {[{ id: 'all', name: 'All Properties' }, ...hotelInfo.map(h => ({ id: h.id, name: h.name }))].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setSelectedHotel(opt.id)}
                                        className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${selectedHotel === opt.id
                                            ? 'bg-forest text-white border-forest shadow-md'
                                            : 'bg-white text-forest border-forest/20 hover:border-forest/50 hover:shadow-sm'
                                            }`}
                                    >
                                        {opt.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hotel Sections */}
                        {visibleHotels.map(hotel => {
                            const rates = getConsolidatedRates(hotel.id);
                            return (
                                <div key={hotel.id} id={hotel.id} className="mb-16 scroll-mt-24">

                                    {/* Rates Heading */}
                                    <h3 className="text-lg font-heading font-bold text-forest mb-4">B2B Rates — {hotel.name}</h3>

                                    {/* Rates Table */}
                                    <div className="overflow-x-auto rounded-xl border border-forest/10 shadow-sm">
                                        <table className="w-full border-collapse text-sm">
                                            <thead>
                                                <tr className="bg-forest text-white">
                                                    {['Room Type', 'Season', 'Validity', 'CP Rate', 'MAP Rate', 'Extra Adult (CP)', 'Extra Adult (MAP)'].map(h => (
                                                        <th key={h} className="px-3 py-3 text-left font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rates.map((rate, idx) => (
                                                    <tr
                                                        key={idx}
                                                        className={`border-b border-forest/5 ${rate.season === 'Season Rate' ? 'bg-green-50 hover:bg-green-100/60' : 'bg-amber-50 hover:bg-amber-100/60'} transition-colors`}
                                                    >
                                                        <td className="px-3 py-3 font-medium text-charcoal">{rate.roomType}</td>
                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                            {rate.season === 'Season Rate' ? (
                                                                <span className="inline-flex items-center gap-1.5 text-green-700 font-medium text-xs">
                                                                    <span className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0" />
                                                                    {rate.season}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium text-xs">
                                                                    <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                                                                    {rate.season}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 text-charcoal whitespace-nowrap">
                                                            <div className="space-y-1">
                                                                {rate.validityPeriods.map((p, i) => (
                                                                    <div key={i} className={i > 0 ? 'pt-1 border-t border-charcoal/10 text-md' : 'text-md'}>
                                                                        {p}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 font-bold text-forest whitespace-nowrap">₹{rate.cpRate.toLocaleString()}</td>
                                                        <td className="px-3 py-3 font-bold text-forest whitespace-nowrap">₹{rate.mapRate.toLocaleString()}</td>
                                                        <td className="px-3 py-3 text-charcoal/70 whitespace-nowrap">
                                                            {rate.extraAdultCPRate > 0 ? `₹${rate.extraAdultCPRate.toLocaleString()}` : <span className="text-charcoal/40">N/A</span>}
                                                        </td>
                                                        <td className="px-3 py-3 text-charcoal/70 whitespace-nowrap">
                                                            {rate.extraAdultMAPRate > 0 ? `₹${rate.extraAdultMAPRate.toLocaleString()}` : <span className="text-charcoal/40">N/A</span>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Child Policy & T&C */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        <div className="bg-forest/5 p-5 rounded-xl border border-forest/10">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Users className="w-5 h-5 text-terracotta" />
                                                <h4 className="font-semibold text-forest text-sm">Child Policy</h4>
                                            </div>
                                            <ul className="space-y-1.5 text-sm text-charcoal/70 list-disc list-inside ml-2">
                                                <li>Kids below 6 will be free (without mattress)</li>
                                                <li>Kids 6–12 at 50%: Breakfast ₹150, Dinner ₹350 (without mattress)</li>
                                                <li>Kids 12 years and above will be considered adult</li>
                                                <li>Meals will be buffet with both veg & non-veg options</li>
                                            </ul>
                                        </div>
                                        <div className="bg-forest/5 p-5 rounded-xl border border-forest/10">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Clock className="w-5 h-5 text-terracotta" />
                                                <h4 className="font-semibold text-forest text-sm">Terms & Conditions</h4>
                                            </div>
                                            <ul className="space-y-1.5 text-sm text-charcoal/70 list-disc list-inside ml-2">
                                                <li>Rates are valid for B2B partners only</li>
                                                <li>Blackout dates may apply during festivals and holidays</li>
                                                <li>Cancellation policy: as per standard hotel policy</li>
                                                <li>5% GST will be applicable on the total bill</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* RIGHT — Sticky Local Advantage Panel */}
                    <div>
                        <div className="sticky top-8 bg-terracotta/10 border border-terracotta/20 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="bg-terracotta/20 p-2 rounded-lg">
                                    <Mountain className="w-5 h-5 text-terracotta" />
                                </div>
                                <h3 className="font-heading font-bold text-terracotta text-xl leading-tight">
                                    Why Partner With Us
                                </h3>
                            </div>

                            <div className="mb-5">
                                <ul className="space-y-3">
                                    {[
                                        'Immediate assistance during road closures, weather changes, or emergencies',
                                        'Access to hidden gems and experiences not available to regular tourists',
                                        'Deep connections with local communities for authentic cultural experiences',
                                    ].map(item => (
                                        <li key={item} className="flex items-start gap-2.5">
                                            <Shield className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
                                            <span className="text-charcoal/70 text-sm leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="border-t border-terracotta/20 gap-3 pt-5">

                                <ul className="space-y-3">
                                    {[
                                        'Consistently high guest ratings (4.6+ across platforms)',
                                        'Flexible booking policies designed for tour operators',
                                        'Comprehensive itinerary planning and logistical support',
                                    ].map(item => (
                                        <li key={item} className="flex items-start gap-2.5">
                                            <Shield className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
                                            <span className="text-charcoal/70 text-sm leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── Footer ── */}
                <div className="mt-16 pt-8 border-t border-forest/10 text-center">
                    <Link href="/">
                        <Image
                            src="https://res.cloudinary.com/dzsazqbfe/image/upload/c_crop,w_400,h_200/v1739965913/Escape_Stayz_Transparent_ziqhph.png"
                            alt="EscapeStayz Logo"
                            className="h-12 w-auto mx-auto mb-4 opacity-70 hover:opacity-100 transition-opacity object-contain"
                            width={120}
                            height={48}
                        />
                    </Link>
                    <p className="text-charcoal/40 text-sm">
                        © {new Date().getFullYear()} EscapeStayz. All rights reserved.
                    </p>
                </div>

            </div>
        </div>
    );
}
