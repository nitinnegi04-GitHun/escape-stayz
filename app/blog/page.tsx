
import { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { Layout } from '../../components/Layout';
import { PageHero } from '../../components/PageHero';
import { getBlogPosts } from '../../lib/queries';
import { supabase } from '../../lib/supabase';
import { SITE_URL, SITE_NAME, SITE_OG_IMAGE } from '../../lib/constants';

// Revalidate every hour
export const revalidate = 3600;

const getPageData = cache(async () => {
    const { data: page } = await supabase.from('pages').select('*').eq('slug', 'blog').single();
    if (!page) {
        const { data: blogsPage } = await supabase.from('pages').select('*').eq('slug', 'blogs').single();
        return blogsPage;
    }
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
            title: 'The Journal | Himalayan Travel Narratives',
            description: 'Explore curated stories of high-altitude luxury, culinary traditions, and silent retreats in Kinnaur and Spiti.',
        };
    }

    const title = page.meta_title || "The Journal | Himalayan Travel Narratives";
    const description = page.meta_description || "Explore curated stories of high-altitude luxury, culinary traditions, and silent retreats in Kinnaur and Spiti.";

    return {
        title,
        description,
        alternates: {
            canonical: `${SITE_URL}/blog`,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${SITE_URL}/blog`,
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

const getPosts = cache(async () => {
    try {
        const posts = await getBlogPosts();
        return posts || [];
    } catch (e) {
        return [];
    }
});

export default async function BlogPage() {
    const page = await getPageData();
    const posts = await getPosts();

    let heroContent = {
        title: "The Journal",
        subtitle: "Stories from the Himalayas",
        image: "https://images.unsplash.com/photo-1455620611406-966dd68cf423?q=80&w=2940&auto=format&fit=crop"
    };

    let introContent = {
        subheading: "Refined Perspectives",
        text: "\"Essays on the art of slow travel, deep culture, and the transformative power of the Himalayan wilderness.\""
    };

    if (page) {
        const sections = await getSections(page.id);
        const getSection = (key: string) => sections.find(s => s.section_key === key)?.content || {};

        const fetchedHero = getSection('hero');
        if (fetchedHero.title) heroContent = fetchedHero;

        const fetchedIntro = getSection('intro');
        if (fetchedIntro.text || fetchedIntro.heading) introContent = fetchedIntro;
    }

    const blogSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
            { "@type": "ListItem", "position": 2, "name": "Journal", "item": `${SITE_URL}/blog` }
        ]
    };

    return (
        <Layout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
            />

            <PageHero
                title={heroContent.title}
                subtitle={heroContent.subtitle}
                image={heroContent.image}
            />

            <section className="bg-white min-h-screen py-24">
                <div className="container mx-auto px-6 max-w-7xl">

                    <div className="max-w-3xl mb-20">
                        <span className="text-terracotta font-bold uppercase tracking-[0.2em] text-xs mb-4 block text-left">
                            {introContent.subheading}
                        </span>
                        <p className="text-2xl md:text-3xl font-heading italic text-forest leading-relaxed text-left">
                            {introContent.text}
                        </p>
                    </div>

                    {posts.length > 0 ? (
                        <div className="space-y-24">

                            {/* Featured Post */}
                            {posts.slice(0, 1).map((post: any, idx: number) => (
                                <article key={post.id || idx} className="group relative grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-3xl shadow-2xl bg-forest text-white">
                                    <div className="lg:col-span-8 h-[400px] lg:h-[600px] overflow-hidden relative">
                                        <img
                                            src={`${post.featured_image || post.imageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1200'}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] opacity-90 group-hover:opacity-100"
                                            alt={post.title}
                                        />
                                        <div className="absolute top-8 left-8">
                                            <span className="bg-terracotta text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                                                Latest Story
                                            </span>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-4 p-8 lg:p-12 flex flex-col justify-center relative">
                                        <div className="flex items-center gap-3 text-white/50 text-[10px] font-bold uppercase tracking-widest mb-6">
                                            <span>{new Date(post.created_at || post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <h2 className="text-3xl lg:text-4xl font-heading font-bold mb-6 leading-tight group-hover:text-terracotta transition-colors">{post.title}</h2>
                                        <p className="text-white/70 text-base lg:text-lg leading-relaxed mb-10 line-clamp-4 font-light">{post.excerpt}</p>
                                        <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-3 text-white font-bold uppercase tracking-widest text-xs group/link w-fit border-b border-transparent hover:border-white/30 pb-1 transition-all">
                                            Read Full Story <i className="fas fa-arrow-right group-hover/link:translate-x-1 transition-transform"></i>
                                        </Link>
                                    </div>
                                </article>
                            ))}

                            {/* Grid of Other Posts */}
                            {posts.length > 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                                    {posts.slice(1).map((post: any, idx: number) => (
                                        <article key={post.id || idx} className="group flex flex-col h-full">
                                            <Link href={`/blog/${post.slug}`} className="block overflow-hidden rounded-[30px] mb-6 aspect-[4/3] shadow-md relative">
                                                <img
                                                    src={`${post.featured_image || post.imageUrl || 'https://images.unsplash.com/photo-1548678912-41f2375830ff?auto=format&fit=crop&q=80&w=800'}`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
                                                    alt={post.title}
                                                />
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                            </Link>
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex items-center gap-3 text-terracotta text-[10px] font-bold uppercase tracking-widest mb-3">
                                                    <span>{new Date(post.created_at || post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                                <h3 className="text-2xl font-bold text-forest mb-3 group-hover:text-terracotta transition-colors font-heading leading-snug">
                                                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                                </h3>
                                                <p className="text-charcoal/60 text-sm leading-relaxed mb-6 line-clamp-3 font-light">
                                                    {post.excerpt}
                                                </p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-cream/50 rounded-3xl border border-dashed border-forest/10">
                            <i className="fas fa-feather text-4xl text-forest/20 mb-6"></i>
                            <h3 className="text-xl font-bold text-forest/30 mb-2">The Journal is quiet</h3>
                            <p className="text-forest/30 text-xs font-bold uppercase tracking-widest">Stories coming soon</p>
                        </div>
                    )}

                </div>
            </section>
        </Layout>
    );
}
