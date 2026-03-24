
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import Link from 'next/link';
import { Layout } from '../../../components/Layout';
import { Breadcrumbs } from '../../../components/Breadcrumbs';
import { RoomCarousel } from '../../../components/RoomCarousel';
import { ReservationSidebar } from '../../../components/ReservationSidebar';
import { HotelGallery } from '../../../components/HotelGallery';
import { FadeIn } from '../../../components/ui/FadeIn';
import { getHotelBySlug, getExperiencesByDestinationSlug } from '../../../lib/queries';
import { supabase } from '../../../lib/supabase';
import { PropertyTabs } from '@/components/PropertyTabs';
import { HOTEL_ICON_MAP } from '@/components/Admin/hotelIcons';
import { SITE_URL, SITE_NAME } from '../../../lib/constants';
import { LazyMap } from '../../../components/LazyMap';
import dynamic from 'next/dynamic';
import { DirectBookingPopup, OtherPropertiesSection, ExperiencesCarousel } from '../../../components/PropertyClientSections';

const FAQSection = dynamic(() => import('../../../components/FAQSection').then(m => ({ default: m.FAQSection })));

// Revalidate every hour
export const revalidate = 3600;

// Deduplicate request
const getHotel = cache(async (slug: string) => {
    try {
        const hotel = await getHotelBySlug(slug);
        return hotel;
    } catch (e) {
        return null;
    }
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const hotel = await getHotel(slug);

    if (!hotel) {
        return {
            title: 'Hotel Not Found',
        };
    }

    const title = hotel.meta_title || `${hotel.name} | Luxury Hotel in ${hotel.location_name}`;
    const description = hotel.meta_description || `Experience high-altitude luxury at ${hotel.name}.`;
    const image = hotel.thumbnail_image || hotel.hero_image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb';

    return {
        title,
        description,
        alternates: {
            canonical: `${SITE_URL}/hotels/${hotel.slug}`,
        },
        openGraph: {
            title,
            description,
            images: [image],
            type: 'website',
            url: `${SITE_URL}/hotels/${hotel.slug}`,
            siteName: SITE_NAME,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
    };
}

export default async function HotelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const hotel = await getHotel(slug);

    if (!hotel) {
        notFound();
    }

    const hotelName = hotel.name;
    const location = hotel.location_name;
    const lat = hotel.latitude || 31.45;
    const lng = hotel.longitude || 78.25;

    const destinationData = hotel.destination_slug
        ? await getExperiencesByDestinationSlug(hotel.destination_slug)
        : null;
    const experiences: { title: string; description: string; imageUrl?: string; image_url?: string; category?: string }[] =
        destinationData?.things_to_do || [];
    const recommendedDays = experiences.length > 0
        ? 2 + Math.floor((experiences.length - 1) / 3)
        : 0;

    const { data: settingsData } = await supabase.from('site_settings').select('*');
    const contactInfo = settingsData?.find((s: any) => s.key === 'contact_info')?.value;
    const whatsappNumber = contactInfo?.phone?.replace(/\D/g, '') || '';
    const experiencesWhatsappLink = whatsappNumber
        ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi! I'd like to chat with a travel expert about experiences near ${hotelName} in ${location}.`)}`
        : '#';

    // Schema
    const hotelSchema = {
        "@context": "https://schema.org",
        "@type": "Hotel",
        "name": hotelName,
        "description": hotel.meta_description,
        "image": [hotel.thumbnail_image || hotel.hero_image],
        "url": `${SITE_URL}/hotels/${hotel.slug}`,
        "telephone": "+91-9999999999",
        "priceRange": "$$$",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": location,
            "addressRegion": "Himachal Pradesh",
            "addressCountry": "IN"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": lat,
            "longitude": lng
        },
        "hasMap": `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        "starRating": {
            "@type": "Rating",
            "ratingValue": "5"
        },
        "amenityFeature": hotel.hotel_amenities?.map((ha: any) => ({
            "@type": "LocationFeatureSpecification",
            "name": ha.amenity?.name,
            "value": true
        })) || []
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
            { "@type": "ListItem", "position": 2, "name": "Hotels", "item": `${SITE_URL}/hotels` },
            { "@type": "ListItem", "position": 3, "name": hotelName, "item": `${SITE_URL}/hotels/${hotel.slug}` }
        ]
    };

    return (
        <Layout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([hotelSchema, breadcrumbSchema]) }}
            />

            <HotelGallery
                images={hotel.images}
                hotelName={hotelName}
                heroImage={hotel.hero_image}
            />

            <Breadcrumbs items={[{ label: 'Hotels', path: '/hotels' }, { label: hotelName }]} />

            <PropertyTabs />

            <section className="pb-8 lg:pb-16 pt-6 lg:pt-14 bg-cream">
                <div className="w-full max-w-[2400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-16">

                    <div className="lg:col-span-8">
                        <div id="overview" className="mb-10 lg:mb-16 scroll-mt-24 lg:scroll-mt-40">

                            {/* Property Highlights */}
                            {hotel.highlights && hotel.highlights.length > 0 && (
                                <FadeIn delay={0.05} className="mb-8 lg:mb-10">
                                    <div className="flex flex-wrap gap-3">
                                        {hotel.highlights.map((hl: { icon: string; text: string }, idx: number) => {
                                            const IC = HOTEL_ICON_MAP[hl.icon];
                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-1.5 border border-terracotta/20  shadow-sm px-3 py-3 rounded-2xl"
                                                    style={{ background: 'linear-gradient(to right, rgba(217, 108, 91, 0.18), #F5F5F0)' }}
                                                >
                                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" >
                                                        {IC ? <IC size={16} /> : null}
                                                    </div>
                                                    <span className="text-sm font-bold whitespace-nowrap" >{hl.text}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </FadeIn>
                            )}

                            {/* Short Description */}
                            <FadeIn delay={0.1} className="mb-8 lg:mb-12">
                                <p className="text-xl md:text-xl text-charcoal/80 leading-relaxed font-heading">
                                    {hotel.short_description || `Experience high-altitude luxury at ${hotelName} in ${location}.`}
                                </p>
                            </FadeIn>

                            {/* Features & Amenities (Pills) */}
                            {hotel.hotel_amenities && hotel.hotel_amenities.length > 0 && (
                                <FadeIn delay={0.2} id="amenities" className="mb-10 lg:mb-16 scroll-mt-24 lg:scroll-mt-40">
                                    <h3 className="text-xl lg:text-2xl font-bold text-forest mb-6 lg:mb-8 font-heading">Hotel Features & Amenities</h3>
                                    <div className="flex flex-wrap gap-2 md:gap-4">
                                        {hotel.hotel_amenities.map((ha: any, idx: number) => (
                                            <div key={idx} className="bg-cream px-3 py-2 md:px-6 md:py-4 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 border border-forest/5 hover:border-forest/20 transition-colors flex-grow-0">
                                                {(() => { const IC = HOTEL_ICON_MAP[ha.amenity?.icon]; return IC ? <IC size={18} className="text-terracotta flex-shrink-0" /> : null; })()}
                                                <span className="text-xs md:text-sm font-bold text-charcoal/80 whitespace-nowrap">{ha.amenity?.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </FadeIn>
                            )}

                            {/* About the Property (Long Description) */}
                            <FadeIn delay={0.3}>
                                <h3 className="text-xl lg:text-2xl font-bold text-forest mb-6 lg:mb-8 font-heading">About the Property</h3>
                                <div className="prose prose-slate prose-lg max-w-none text-gray-600 leading-loose space-y-6 whitespace-pre-wrap">
                                    {hotel.full_description}
                                </div>
                            </FadeIn>
                        </div>

                        {hotel.rooms && hotel.rooms.length > 0 && (
                            <div id="rooms" className="mb-12 lg:mb-20 scroll-mt-24 lg:scroll-mt-40">
                                <FadeIn delay={0.2}>
                                    <RoomCarousel rooms={hotel.rooms} hotelName={hotel.name} />
                                </FadeIn>
                            </div>
                        )}

                        {/* Experiences Near the Stay */}
                        {experiences.length > 0 && (
                            <FadeIn delay={0.3} className="mb-12 lg:mb-20 scroll-mt-24 lg:scroll-mt-40">
                                <ExperiencesCarousel
                                    experiences={experiences}
                                    heroImage={hotel.hero_image}
                                    recommendedDays={recommendedDays}
                                    destinationName={destinationData?.name}
                                    experiencesWhatsappLink={experiencesWhatsappLink}
                                />
                            </FadeIn>
                        )}

                        {/* Other Properties */}
                        <OtherPropertiesSection currentSlug={slug} />

                        {/* Map Section */}
                        <FadeIn delay={0.4} id="location" className="mb-12 lg:mb-16 scroll-mt-24 lg:scroll-mt-40">
                            <h3 className="text-xl lg:text-2xl font-bold text-forest mb-6 lg:mb-8 font-heading">Location & Geography</h3>
                            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 h-[280px] md:h-[500px] bg-white/10 backdrop-blur-3xl relative group p-2">
                                <LazyMap
                                    title={`${hotelName} Location Map`}
                                    src={hotel.google_maps_embed_url || `https://www.google.com/maps?q=${lat},${lng}&hl=en;z=14&output=embed`}
                                />

                                {/* Overlay Card */}
                                <div className="absolute bottom-6 right-6 pointer-events-auto">
                                    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/30 flex flex-col gap-4 min-w-[280px]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-forest rounded-full flex items-center justify-center text-white text-xs shadow-lg shadow-forest/20 flex-shrink-0">
                                                <i className="fas fa-location-dot"></i>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/60 mb-1">Coordinates</p>
                                                <p className="text-xs font-bold text-charcoal font-heading">{lat.toFixed(4)}° N, {lng.toFixed(4)}° E</p>
                                            </div>
                                        </div>

                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-forest text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-forest/90 transition-all flex items-center justify-center gap-2 shadow-md"
                                        >
                                            <i className="fas fa-directions"></i> Get Directions
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                    <aside id="reservation-sidebar" className="lg:col-span-4 lg:sticky lg:top-48 self-start mb-20 scroll-mt-24 lg:scroll-mt-48 flex flex-col gap-5">
                        {/* Planning Your Trip Card */}
                        <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-2xl shadow-forest/10 border border-forest/5 text-center">
                            <div className="flex flex-col items-center mb-6">
                                <h3 className="text-2xl font-heading font-bold text-forest leading-snug mb-3">Planning Your Trip?</h3>
                                <div className="w-8 h-0.5 bg-terracotta rounded-full mb-3"></div>
                                <p className="text-xs text-charcoal/55 leading-relaxed">Let our local experts help you create the perfect Himalayan adventure</p>
                            </div>

                            <div className="space-y-2.5 mb-6 text-left">
                                {[
                                    { question: 'Best time to visit?', answer: 'Get personalised recommendations based on your preferences.' },
                                    { question: 'Which route to take?', answer: 'We\'ll help you choose between Shimla, Manali, or circuit options.' },
                                    { question: 'Worried about altitude?', answer: 'Get expert guidance on acclimatisation and safety.' },
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-cream/50 rounded-2xl px-4 py-3 border border-forest/5">
                                        <p className="text-md font-bold text-forest mb-0.5">{item.question}</p>
                                        <p className="text-[14px] text-charcoal/55 leading-relaxed">{item.answer}</p>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="/plan-your-trip"
                                className="w-full flex items-center justify-center gap-2 bg-terracotta text-white px-5 py-3.5 rounded-full font-bold text-md uppercase tracking-widest hover:bg-forest/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                Plan Your Trip Now
                            </Link>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-terracotta italic mt-2">Free consultation · No obligation</p>
                        </div>

                        <ReservationSidebar hotelName={hotelName} location={location} />
                    </aside>
                </div>
            </section>

            <div id="faqs">
                <FAQSection faqs={hotel.faqs} />
            </div>

            <DirectBookingPopup />
        </Layout>
    );
}
