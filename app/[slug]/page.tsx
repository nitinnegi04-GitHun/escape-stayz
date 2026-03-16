
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { supabase } from '../../lib/supabase';
import { Layout } from '../../components/Layout';
import { PageHero } from '../../components/PageHero';

// Revalidate every hour
export const revalidate = 3600;

const getPageData = cache(async (slug: string) => {
    const { data: page } = await supabase.from('pages').select('*').eq('slug', slug).single();
    return page;
});

const getSections = cache(async (pageId: string) => {
    const { data: sections } = await supabase.from('sections')
        .select('*')
        .eq('page_id', pageId)
        .order('section_order');
    return sections || [];
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const page = await getPageData(slug);

    if (!page) return {};

    const title = page.meta_title || `${page.title} | Escape Stayz`;
    const description = page.meta_description || `View our ${page.title} details.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
        }
    };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const page = await getPageData(slug);

    // If page doesn't exist, return 404
    if (!page) {
        notFound();
    }

    const sections = await getSections(page.id);
    const getSection = (key: string) => sections.find(s => s.section_key === key)?.content || {};

    const hero = getSection('hero');
    const intro = getSection('intro');

    return (
        <Layout>
            <PageHero
                title={hero.title || page.title}
                subtitle={hero.subtitle || ''}
                image={hero.image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2940'}
            />

            <section className="bg-white py-24 px-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="prose prose-lg max-w-none text-charcoal/70 font-light leading-relaxed whitespace-pre-line">
                        {intro.text || 'Content coming soon...'}
                    </div>
                </div>
            </section>
        </Layout>
    );
}

export async function generateStaticParams() {
    const { data: pages } = await supabase.from('pages').select('slug');
    if (!pages) return [];

    // Filter out restricted slugs that have their own routes
    const restricted = ['home', 'hotels', 'destinations', 'blog', 'blogs', 'contact', 'gallery', 'about', 'plan-your-trip'];
    return pages
        .filter(p => !restricted.includes(p.slug))
        .map(p => ({
            slug: p.slug
        }));
}
