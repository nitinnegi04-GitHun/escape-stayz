
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { Layout } from '../../../components/Layout';
import { Breadcrumbs } from '../../../components/Breadcrumbs';
import { RoomCarousel } from '../../../components/RoomCarousel';
import { ReservationSidebar } from '../../../components/ReservationSidebar';
import { HotelGallery } from '../../../components/HotelGallery';
import { FAQSection } from '../../../components/FAQSection';
import { FadeIn } from '../../../components/ui/FadeIn';
import { getHotelBySlug } from '../../../lib/queries';
import { PropertyTabs } from '@/components/PropertyTabs';

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
    const image = hotel.hero_image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [image],
            type: 'website', // 'hotel' is not a standard OG type, fallback to website
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
        alternates: {
            canonical: `https://escapestayz.com/hotels/${hotel.slug}`,
        }
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

    // Schema
    const hotelSchema = {
        "@context": "https://schema.org",
        "@type": "Hotel",
        "name": hotelName,
        "description": hotel.meta_description,
        "image": [hotel.hero_image],
        "url": `https://escapestayz.com/hotels/${hotel.slug}`,
        "telephone": "+91800ESCAPE7",
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
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://escapestayz.com/" },
            { "@type": "ListItem", "position": 2, "name": "Hotels", "item": "https://escapestayz.com/hotels" },
            { "@type": "ListItem", "position": 3, "name": hotelName, "item": `https://escapestayz.com/hotels/${hotel.slug}` }
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
                            {/* Short Description */}
                            <FadeIn delay={0.1} className="mb-8 lg:mb-12">
                                <p className="text-xl md:text-2xl text-charcoal/80 leading-relaxed font-heading">
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
                                                <i className={`fas fa-${ha.amenity?.icon || 'star'} text-terracotta text-sm md:text-lg`}></i>
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

                        {/* Map Section */}
                        <FadeIn delay={0.4} id="location" className="mb-12 lg:mb-16 scroll-mt-24 lg:scroll-mt-40">
                            <h3 className="text-xl lg:text-2xl font-bold text-forest mb-6 lg:mb-8 font-heading">Location & Geography</h3>
                            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 h-[500px] bg-white/10 backdrop-blur-3xl relative group p-2">
                                <div className="w-full h-full rounded-2xl overflow-hidden relative">
                                    <iframe
                                        title={`${hotelName} Location Map`}
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        style={{ border: 0, filter: 'contrast(1.1) opacity(0.9) grayscale(0.2)' }}
                                        src={`https://www.google.com/maps?q=${lat},${lng}&hl=en;z=14&output=embed`}
                                        allowFullScreen
                                        className="w-full h-full"
                                    ></iframe>
                                    <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-charcoal/10 rounded-2xl"></div>
                                </div>

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

                    <aside id="reservation-sidebar" className="lg:col-span-4 lg:sticky lg:top-48 self-start mb-20 scroll-mt-24 lg:scroll-mt-48">
                        <ReservationSidebar hotelName={hotelName} location={location} />
                    </aside>
                </div>
            </section>

            <div id="faqs">
                <FAQSection faqs={hotel.faqs} />
            </div>
        </Layout>
    );
}
