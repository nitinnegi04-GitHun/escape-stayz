
import { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { Layout } from '../../components/Layout';
import { PageHero } from '../../components/PageHero';
import { getHotels } from '../../lib/queries';
import { supabase } from '../../lib/supabase';

import { Breadcrumbs } from '../../components/Breadcrumbs';

import { HotelCard } from '../../components/HotelCard';

// Revalidate every hour
export const revalidate = 3600;

const getPageData = cache(async () => {
    const { data: page } = await supabase.from('pages').select('*').eq('slug', 'hotels').single();
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
            title: 'Luxury Hotels | Escape Stayz',
            description: 'Discover our handpicked collection of silent luxury hotels.',
        };
    }

    const title = page.meta_title || "Luxury Hotels | Escape Stayz";
    const description = page.meta_description || "Discover our handpicked collection of silent luxury hotels.";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            url: 'https://escapestayz.com/hotels',
            siteName: 'Escape Stayz',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
        alternates: {
            canonical: 'https://escapestayz.com/hotels',
        }
    };
}

export default async function HotelsPage() {
    const page = await getPageData();
    const hotels = await getHotels();

    let heroContent = { title: "Sanctuaries in Silence", subtitle: "The Collection", image: "https://images.unsplash.com/photo-1518098268026-4e1877433630?q=80&w=2874&auto=format&fit=crop" };
    let introContent = {
        heading: "Our Portfolio",
        text: "Every property in our portfolio is selected for its silent luxury, architectural integrity, and connection to the natural world."
    };

    if (page) {
        const sections = await getSections(page.id);
        const getSection = (key: string) => sections.find(s => s.section_key === key)?.content || {};

        const fetchedHero = getSection('hero');
        if (fetchedHero.title) heroContent = { ...heroContent, ...fetchedHero };

        const fetchedIntro = getSection('intro');
        if (fetchedIntro.heading) introContent = { ...introContent, ...fetchedIntro };
    }

    const hotelsSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://escapestayz.com/" },
            { "@type": "ListItem", "position": 2, "name": "Hotels", "item": "https://escapestayz.com/hotels" }
        ]
    };

    return (
        <Layout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelsSchema) }}
            />

            <PageHero
                title={heroContent.title}
                subtitle={heroContent.subtitle}
                image={heroContent.image}
            />

            <Breadcrumbs items={[{ label: 'Hotels' }]} />

            <section className="bg-white min-h-screen py-24">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="max-w-3xl mb-20 text-left">
                        <h2 className="text-4xl md:text-5xl font-bold text-[#2D3A3A] mb-6 font-heading">
                            {introContent.heading}
                        </h2>
                        <p className="text-xl text-charcoal/60 leading-relaxed font-light">
                            {introContent.text}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {hotels?.map((hotel, index) => (
                            <HotelCard key={hotel.id} hotel={hotel} index={index} layout="grid" />
                        ))}
                    </div>
                </div>
            </section>
        </Layout>
    );
}
