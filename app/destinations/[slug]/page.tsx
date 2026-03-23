
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { Layout } from '../../../components/Layout';
import { Breadcrumbs } from '../../../components/Breadcrumbs';
import { Button } from '../../../components/ui/Button';
import { DestinationGallery } from '../../../components/DestinationGallery';
import { FAQSection } from '../../../components/FAQSection';
import { getDestinationBySlug, getHotelsByDestination, getBlogsByDestination } from '../../../lib/queries';
import { DestinationTabs } from '@/components/DestinationTabs';
import { motion } from 'framer-motion';
import { MotionDiv } from '@/components/MotionDiv';
import { SITE_URL, SITE_NAME } from '../../../lib/constants';

// Revalidate every hour
export const revalidate = 3600;

const getOptimizedUrl = (url: string | null | undefined, width: number) => {
    if (!url) return '';
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}fm=webp&w=${width}&q=80`;
};

// Interfaces for new JSON fields
interface TransportMode {
    mode: string;
    hub: string;
    distance: string;
    time: string;
    details: string;
}

interface CuisineDish {
    name: string;
    description: string;
    image: string;
}

interface LocalCuisine {
    intro: string;
    dishes: CuisineDish[];
}

interface GeoCoordinates {
    lat: number;
    lng: number;
}

const getDestination = cache(async (slug: string) => {
    try {
        const dest = await getDestinationBySlug(slug);
        return dest;
    } catch (e) {
        return null;
    }
});

const getHotels = cache(async (slug: string) => {
    try {
        const hotels = await getHotelsByDestination(slug);
        return hotels || [];
    } catch (e) {
        return [];
    }
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const dest = await getDestination(slug);

    if (!dest) {
        return {
            title: 'Destination Not Found',
        };
    }

    const title = dest.meta_title || `${dest.name} Travel Guide | Escape Stayz`;
    const description = dest.meta_description || dest.description || `Discover ${dest.name} with Escape Stayz.`;
    const image = getOptimizedUrl(dest.hero_image || dest.image_url, 1200);

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: image ? [image] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: image ? [image] : [],
        },
        alternates: {
            canonical: `${SITE_URL}/destinations/${dest.slug}`,
        }
    };
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const dest = await getDestination(slug);

    if (!dest) {
        notFound();
    }

    const hotels = await getHotels(slug);
    const blogs = await getBlogsByDestination(slug);

    const howToReach: TransportMode[] = dest.how_to_reach || [];
    const languages: string[] = dest.languages_spoken || [];
    const thingsToDo = dest.things_to_do || [];
    const bestTime = dest.best_time_to_visit || [];
    const faqs = dest.faqs || [];

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
            { "@type": "ListItem", "position": 2, "name": "Destinations", "item": `${SITE_URL}/destinations` },
            { "@type": "ListItem", "position": 3, "name": dest.name, "item": `${SITE_URL}/destinations/${dest.slug}` }
        ]
    };

    const destinationSchema = {
        "@context": "https://schema.org",
        "@type": "TouristDestination",
        "name": dest.name,
        "description": dest.description,
        "image": dest.image_url,
        "touristType": ["Nature", "Luxury"],
        "geo": dest.coordinates ? {
            "@type": "GeoCoordinates",
            "latitude": dest.coordinates.lat,
            "longitude": dest.coordinates.lng
        } : undefined
    };

    return (
        <Layout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, destinationSchema]) }}
            />

            <DestinationGallery
                images={dest.images}
                destinationName={dest.name}
                heroImage={dest.hero_image || dest.image_url}
            />

            <Breadcrumbs items={[{ label: 'Destinations', path: '/destinations' }, { label: dest.name }]} />

            <DestinationTabs />

            <section className="pb-8 lg:pb-16 pt-6 lg:pt-14 bg-cream">
                <div className="w-full max-w-[2400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

                    {/* Main Content Column */}
                    <div className="lg:col-span-8">

                        <div id="overview" className="mb-10 lg:mb-16 scroll-mt-24 lg:scroll-mt-40">
                            <h2 className="text-xl lg:text-2xl font-bold text-forest mb-6 lg:mb-8 font-heading">About {dest.name}</h2>
                            <div className="prose prose-slate prose-lg max-w-none text-gray-600 leading-relaxed space-y-6 whitespace-pre-wrap">
                                {dest.long_description || dest.description}
                            </div>
                        </div>

                        {/* Best Time to Visit - Standardized Section */}
                        {bestTime.length > 0 && (
                            <div id="best-time" className="mb-10 lg:mb-12 scroll-mt-24 lg:scroll-mt-40">
                                <h2 className="text-xl lg:text-2xl font-bold text-forest mb-5 lg:mb-6 font-heading">Best Time to visit {dest.name}</h2>
                                <div className="divide-y divide-forest/5 border-t border-forest/5">
                                    {bestTime.map((season: any, idx: number) => (
                                        <div key={idx} className="relative group py-5 overflow-hidden transition-all">
                                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2.5">
                                                <h4 className="text-xl font-bold text-charcoal font-heading leading-tight">
                                                    {season.season} <span className="text-terracotta text-sm ml-1 font-sans font-medium">({season.months})</span>
                                                </h4>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed text-sm md:text-base border-l-2 border-forest/10 pl-6 ml-1 group-hover:border-terracotta/40 transition-colors">
                                                {season.description || `Experience the unique charm of ${dest.name} during the ${season.season} months. This period offers distinctive weather and unique opportunities for travelers.`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Attractions (Things to Do) */}
                        {thingsToDo.length > 0 && (
                            <div id="experiences" className="mb-12 lg:mb-16 scroll-mt-24 lg:scroll-mt-40">
                                <h3 className="text-xl lg:text-2xl font-bold text-forest mb-6 lg:mb-8 font-heading">Top Experiences in {dest.name}</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                    {thingsToDo.map((item: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="group bg-white rounded-[2.5rem] overflow-hidden border border-forest/5 shadow-lg shadow-forest/5 hover:border-terracotta/20 transition-all duration-500 h-full flex flex-col"
                                        >
                                            <div className="aspect-[4/3] relative overflow-hidden">
                                                <Image
                                                    src={getOptimizedUrl(item.imageUrl || item.image_url || dest.image_url, 600) || '/og-default.jpg'}
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    alt={item.title || "Experience"}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                                                {(item.category || item.tags?.[0]) && (
                                                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-forest shadow-sm z-10 border border-forest/5">
                                                        {item.category || item.tags?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-8 flex flex-col flex-grow text-center items-center">
                                                <h4 className="text-xl font-bold text-charcoal mb-3 group-hover:text-forest transition-colors">{item.title}</h4>
                                                <p className="text-charcoal/60 text-sm leading-relaxed">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Travel Tips - Concierge Selection */}
                        {dest.travel_tips && dest.travel_tips.length > 0 && (
                            <div id="travel-tips" className="mb-12 lg:mb-20 scroll-mt-24 lg:scroll-mt-40">
                                <div className="flex items-center gap-4 mb-6 lg:mb-8">
                                    <h3 className="text-xl lg:text-2xl font-bold text-forest font-heading">Concierge Travel Tips</h3>
                                    <div className="h-px flex-grow bg-forest/10"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {dest.travel_tips.map((tip: string, idx: number) => (
                                        <div key={idx} className="group bg-cream/30 p-6 rounded-3xl border border-forest/5 hover:bg-white hover:border-terracotta/20 hover:shadow-xl hover:shadow-forest/5 transition-all duration-500 flex gap-5">
                                            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-terracotta group-hover:text-white transition-all duration-500">
                                                <i className="fas fa-lightbulb text-sm text-terracotta group-hover:text-white"></i>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-charcoal/70 text-sm leading-relaxed font-medium">
                                                    {tip}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hotels Section */}
                        <div id="residences" className="mb-12 scroll-mt-24 lg:scroll-mt-40">
                            <h3 className="text-xl lg:text-2xl font-bold text-forest mb-6 lg:mb-8 font-heading">Our Hotels in {dest.name}</h3>

                            <div className="grid grid-cols-1 gap-8 lg:gap-12">
                                {hotels.map((hotel: any, idx: number) => (
                                    <Link key={hotel.id} href={`/hotels/${hotel.slug}`} className="group block bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-forest/5 shadow-2xl hover:shadow-forest/10 transition-all duration-700 hover:-translate-y-2">
                                        <div className="aspect-[4/5] md:aspect-[21/9] relative overflow-hidden">
                                            <Image
                                                src={getOptimizedUrl(hotel.hero_image || hotel.images?.[0]?.image_url, 1200) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'}
                                                className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                                                alt={hotel.name || "Hotel"}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 100vw"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-500"></div>

                                            <div className="absolute top-6 right-6 md:top-8 md:right-8 bg-white/95 backdrop-blur-md px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl shadow-xl z-20 border border-white/20 transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                                <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-forest/40 mb-0.5 md:mb-1">Luxury Stay</p>
                                                <p className="text-forest font-bold text-sm md:text-lg leading-none">Explore Suites</p>
                                            </div>

                                            <div className="absolute bottom-8 left-8 md:bottom-10 left-10 text-white z-20 pr-10 md:pr-20">
                                                <h3 className="text-2xl md:text-4xl font-heading font-bold mb-4 md:mb-6 leading-tight group-hover:text-terracotta transition-colors duration-500">{hotel.name}</h3>
                                                <div className="flex items-center gap-4 group/btn">
                                                    <div className="w-8 h-8 rounded-full bg-terracotta flex items-center justify-center group-hover:bg-forest transition-colors duration-300">
                                                        <i className="fas fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform duration-300 text-[10px]"></i>
                                                    </div>
                                                    <span className="text-[10px] uppercase tracking-widest opacity-90 font-bold group-hover:text-white transition-colors duration-500">
                                                        Reserve Now
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar Column */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-48 h-fit space-y-6 pb-20">


                        {/* Quick Guide Card */}
                        <div className="bg-white p-6 lg:p-8 rounded-[40px] shadow-2xl shadow-forest/10 border border-forest/5 text-center flex flex-col custom-scrollbar">
                            <h3 className="text-xl font-heading font-bold text-forest block mb-8 relative">
                                Quick Guide
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-terracotta rounded-full"></div>
                            </h3>

                            <div className="flex flex-col gap-2 mb-2">
                                {dest.altitude && (
                                    <div className="bg-cream/40 px-5 py-3 rounded-2xl border border-forest/5 flex items-center gap-4 text-left group hover:bg-white hover:border-terracotta/20 transition-all duration-300">
                                        <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <i className="fas fa-mountain-sun text-terracotta text-sm"></i>
                                        </div>
                                        <div className="text-left">
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-charcoal/40 block">Mean Altitude</span>
                                            <span className="text-[11px] text-charcoal">{dest.altitude}</span>
                                        </div>
                                    </div>
                                )}


                                {dest.distance_from_major_hub && (
                                    <div className="bg-cream/40 px-5 py-3 rounded-2xl border border-forest/5 flex items-center gap-4 text-left group hover:bg-white hover:border-terracotta/20 transition-all duration-300">
                                        <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <i className="fas fa-location-dot text-terracotta text-sm"></i>
                                        </div>
                                        <div className="text-left">
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-charcoal/40 block mb-0.5">Nearby Hubs</span>
                                            <span className="text-[12px] text-charcoal">{dest.distance_from_major_hub}</span>
                                        </div>
                                    </div>
                                )}

                                {howToReach.length > 0 && (
                                    <div id="getting-there" className="bg-cream/40 px-5 py-5 rounded-2xl border border-forest/5 flex flex-col gap-5 text-left group hover:bg-white hover:border-terracotta/20 transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                <i className="fas fa-route text-terracotta text-sm"></i>
                                            </div>
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-charcoal/40 block">Getting There</span>
                                        </div>
                                        <div className="space-y-2.5">
                                            {howToReach.map((mode, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white px-5 py-3.5 rounded-xl border border-forest/10 shadow-sm hover:border-terracotta/30 transition-all group/item">
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <i className={`fas ${mode.mode === 'Air' ? 'fa-plane' : mode.mode === 'Train' ? 'fa-train' : 'fa-car'} text-[10px] text-terracotta/60 group-hover/item:text-terracotta transition-colors`}></i>
                                                            <span className="text-[10px] font-bold text-terracotta block tracking-wider uppercase">{mode.mode}</span>
                                                        </div>
                                                        <span className="text-xs font-bold text-charcoal line-clamp-1">{mode.hub}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5 flex-shrink-0">
                                                        <span className="text-[10px] font-bold text-charcoal/60 bg-forest/5 px-2.5 py-1.5 rounded-lg group-hover/item:bg-terracotta/5 group-hover/item:text-terracotta transition-colors">{mode.time}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button href="#residences" size="sm" className="w-full shrink-0 transition-all mt-2">
                                View Our Properties
                            </Button>
                        </div>

                    </aside>

                </div>
            </section>

            {blogs.length > 0 && (
                <section className="bg-white py-12">
                    <div className="w-full max-w-[2400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24">
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-terracotta mb-2">From the Journal</p>
                                <h2 className="text-3xl font-bold text-charcoal font-heading">Stories & Experiences</h2>
                            </div>
                            <a href="/blog" className="text-xs font-bold uppercase tracking-widest text-charcoal/40 hover:text-forest transition-colors border-b border-charcoal/20 hover:border-forest pb-0.5">
                                All Articles →
                            </a>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {blogs.map((post: any) => (
                                <a
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className="group bg-cream rounded-[2.5rem] overflow-hidden border border-charcoal/6 shadow-md hover:border-terracotta/30 hover:shadow-xl transition-all duration-300 flex flex-col"
                                >
                                    <div className="aspect-[4/3] relative overflow-hidden bg-charcoal/5">
                                        {post.featured_image ? (
                                            <Image
                                                src={getOptimizedUrl(post.featured_image, 600) || '/og-default.jpg'}
                                                alt={post.title || "Blog Post"}
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                fill
                                                sizes="(max-width: 768px) 100vw, 25vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-forest/10 to-terracotta/10 flex items-center justify-center">
                                                <i className="fas fa-newspaper text-4xl text-charcoal/15"></i>
                                            </div>
                                        )}
                                        {post.category && (
                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-forest shadow-sm">
                                                {post.category}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-base font-bold text-charcoal mb-2 leading-snug group-hover:text-forest transition-colors">
                                            {post.title}
                                        </h3>
                                        {post.excerpt && (
                                            <p className="text-sm text-charcoal/55 leading-relaxed mb-4 line-clamp-2">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-charcoal/6">
                                            <span className="text-xs text-charcoal/40 font-medium">{post.author || 'Escape Concierge'}</span>
                                            <span className="text-xs font-bold text-terracotta flex items-center gap-1">
                                                Read more <i className="fas fa-arrow-right text-[9px]"></i>
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <div id="faqs">
                <FAQSection
                    faqs={faqs}
                    ctaTarget="residences"
                    ctaLabel="Book Your Stay"
                />
            </div>

        </Layout>
    );
}
