
import { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { Layout } from '../../components/Layout';
import { PageHero } from '../../components/PageHero';
import { getDestinations } from '../../lib/queries';
import { supabase } from '../../lib/supabase';
import { SITE_URL, SITE_NAME, SITE_OG_IMAGE } from '../../lib/constants';

import { Breadcrumbs } from '../../components/Breadcrumbs';

// Revalidate every hour
export const revalidate = 3600;

const getPageData = cache(async () => {
    const { data: page } = await supabase.from('pages').select('*').eq('slug', 'destinations').single();
    return page;
});

const getSections = cache(async (pageId: string) => {
    const { data: sections } = await supabase.from('sections').select('*').eq('page_id', pageId);
    return sections || [];
});

export async function generateMetadata(): Promise<Metadata> {
    const page = await getPageData();

    if (!page) {
        return {
            title: 'Global Destinations | Escape Stayz',
            description: 'Explore our handpicked luxury travel destinations.',
        };
    }

    const title = page.meta_title || "Global Destinations | Escape Stayz";
    const description = page.meta_description || "Explore our handpicked luxury travel destinations.";

    return {
        title,
        description,
        alternates: {
            canonical: `${SITE_URL}/destinations`,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${SITE_URL}/destinations`,
            siteName: SITE_NAME,
            images: [SITE_OG_IMAGE],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [SITE_OG_IMAGE],
        },
    };
}

export default async function DestinationsPage() {
    const page = await getPageData();
    const destinations = await getDestinations() || [];

    let heroContent = {
        title: "Explore the Unseen",
        subtitle: "Curated Destinations",
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2921&auto=format&fit=crop"
    };

    let introContent = {
        heading: "World-Class Locations",
        text: "We operate in the most exclusive corners of the globe, offering unique cultural experiences and breathtaking natural beauty."
    };

    if (page) {
        const sections = await getSections(page.id);
        const getSection = (key: string) => sections.find(s => s.section_key === key)?.content || {};

        const fetchedHero = getSection('hero');
        if (fetchedHero.title) heroContent = { ...heroContent, ...fetchedHero };

        const fetchedIntro = getSection('intro');
        if (fetchedIntro.heading) introContent = { ...introContent, ...fetchedIntro };
    }

    const destSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
            { "@type": "ListItem", "position": 2, "name": "Destinations", "item": `${SITE_URL}/destinations` }
        ]
    };

    return (
        <Layout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(destSchema) }}
            />

            <PageHero
                title={heroContent.title}
                subtitle={heroContent.subtitle}
                image={heroContent.image}
            />

            <Breadcrumbs items={[{ label: 'Destinations' }]} />

            <section className="py-24 bg-cream">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="max-w-3xl mb-20">
                        <h2 className="text-4xl font-bold text-[#2D3A3A] mb-6">{introContent.heading}</h2>
                        <p className="text-xl text-charcoal/60 leading-relaxed font-light">
                            {introContent.text}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {destinations.map((dest) => (
                            <div key={dest.id} className="group cursor-pointer border border-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white flex flex-col">
                                {/* Image Section */}
                                <Link href={`/destinations/${dest.slug}`} className="relative aspect-[4/3] overflow-hidden block">
                                    <img
                                        src={dest.image_url || dest.hero_image}
                                        alt={dest.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                    <div className="absolute bottom-6 left-6 text-white group-hover:-translate-y-2 transition-transform duration-300">
                                        <h3 className="text-2xl font-bold mb-1">{dest.name}</h3>
                                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block">
                                            {(dest.hotel_count || 1)} Properties
                                        </span>
                                    </div>
                                </Link>

                                <div className="p-8 flex flex-col flex-grow">
                                    <p className="text-charcoal/60 mb-8 line-clamp-3 text-sm leading-relaxed font-light">
                                        {dest.description || "Experience the local heritage, breathtaking landscapes, and curated luxury at this signature destination."}
                                    </p>

                                    <div className="mt-auto flex justify-end">
                                        <Link href={`/destinations/${dest.slug}`} className="group/btn flex items-center gap-3">
                                            <span className="text-terracotta font-bold text-sm uppercase tracking-wider">Details</span>
                                            <div className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center transition-all duration-300 group-hover/btn:scale-110 shadow-md">
                                                <i className="fas fa-arrow-right text-white text-sm -rotate-45 group-hover/btn:rotate-0 transition-transform duration-300"></i>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </Layout>
    );
}
