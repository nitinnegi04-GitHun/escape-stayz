
import { Metadata } from 'next';
import { cache } from 'react';
import { Layout } from '../../components/Layout';
import { PageHero } from '../../components/PageHero';
import { supabase } from '../../lib/supabase';

// Revalidate every hour
export const revalidate = 3600;

const getPageData = cache(async () => {
    const { data: page } = await supabase.from('pages').select('*').eq('slug', 'about').single();
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
            title: 'Our Story | Escape Stayz',
            description: 'Learn about the vision and legacy of Escape Stayz - redefined luxury.',
        };
    }

    const title = page.meta_title || "Our Story | Escape Stayz";
    const description = page.meta_description || "Learn about the vision and legacy of Escape Stayz - redefined luxury.";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            url: 'https://escapestayz.com/about',
        },
        alternates: {
            canonical: 'https://escapestayz.com/about',
        }
    };
}

export default async function AboutPage() {
    const page = await getPageData();

    let heroContent = {
        title: "Our Story",
        subtitle: "Redefining Himalayan Luxury",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2940"
    };

    let visionContent = {
        badge: "Our Vision",
        subheading: "Our Vision",
        heading: "Beyond <br /><span class='font-serif italic text-gray-400'>Expectations</span>",
        content: "Founded in 2018, Escape Stayz was born from a simple desire: to make extraordinary travel effortless.",
        text: "Founded in 2018, Escape Stayz was born from a simple desire: to make extraordinary travel effortless.",
        image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=1200",
        quote: "Travel is the only thing you buy that makes you richer. We ensure that wealth is measured in memories.",
        founder_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        founder_name: "Julian Vance",
        founder_role: "Founder & CEO"
    };

    if (page) {
        const sections = await getSections(page.id);
        const getSection = (key: string) => sections.find(s => s.section_key === key)?.content || {};

        const fetchedHero = getSection('hero');
        if (fetchedHero.title) heroContent = fetchedHero;

        const fetchedVision = getSection('vision');
        if (fetchedVision.heading) visionContent = fetchedVision;
    }

    const aboutSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://escapestayz.com/" },
            { "@type": "ListItem", "position": 2, "name": "About Us", "item": "https://escapestayz.com/about" }
        ]
    };

    return (
        <Layout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
            />

            <PageHero
                title={heroContent.title}
                subtitle={heroContent.subtitle}
                image={heroContent.image}
            />

            <section className="bg-white min-h-screen py-24">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                        <div>
                            <span className="text-terracotta font-bold uppercase tracking-[0.2em] text-xs mb-6 block">{visionContent.badge || visionContent.subheading}</span>
                            <h2 className="text-5xl md:text-6xl font-heading font-bold text-forest mb-8 leading-tight" dangerouslySetInnerHTML={{ __html: (visionContent.heading).replace('Expectations', "<span class='font-serif italic text-gray-400'>Expectations</span>") }}>
                            </h2>
                            <p className="text-gray-500 text-lg mb-8 leading-relaxed font-light">
                                {visionContent.content || visionContent.text}
                            </p>
                            <p className="text-gray-500 text-lg mb-12 leading-relaxed font-light">
                                Our curated collection of properties is selected through a rigorous 100-point inspection, ensuring that every "Escape" lives up to our promise of perfection.
                            </p>

                            <div className="flex gap-16 border-t border-gray-100 pt-12">
                                <div>
                                    <h4 className="text-4xl font-serif italic text-forest mb-2">24+</h4>
                                    <p className="text-terracotta text-xs font-bold uppercase tracking-widest">Villages</p>
                                </div>
                                <div>
                                    <h4 className="text-4xl font-serif italic text-forest mb-2">120+</h4>
                                    <p className="text-terracotta text-xs font-bold uppercase tracking-widest">Curated Stays</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-[4/5] rounded-[60px] overflow-hidden shadow-2xl">
                                <img
                                    src={visionContent.image}
                                    className="w-full h-full object-cover"
                                    alt="Our story"
                                />
                            </div>
                            <div className="absolute -bottom-10 -left-10 bg-white p-10 rounded-3xl shadow-2xl hidden lg:block max-w-md">
                                <i className="fas fa-quote-left text-terracotta text-2xl mb-4"></i>
                                <p className="text-forest font-serif italic text-xl mb-6 leading-relaxed">
                                    "{visionContent.quote}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                        <img src={visionContent.founder_image} alt="CEO" />
                                    </div>
                                    <div>
                                        <p className="text-forest font-bold text-xs uppercase tracking-widest">{visionContent.founder_name}</p>
                                        <p className="text-gray-400 text-[10px] uppercase tracking-widest">{visionContent.founder_role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
                        <div className="p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-500">
                            <div className="w-16 h-16 bg-terracotta/10 text-terracotta rounded-full flex items-center justify-center text-2xl mb-6">
                                <i className="fas fa-heart"></i>
                            </div>
                            <h3 className="font-heading font-bold text-xl text-forest mb-4">Curated With Love</h3>
                            <p className="text-gray-500 font-light text-sm">Every property is hand-picked and verified by our team.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-500">
                            <div className="w-16 h-16 bg-terracotta/10 text-terracotta rounded-full flex items-center justify-center text-2xl mb-6">
                                <i className="fas fa-globe"></i>
                            </div>
                            <h3 className="font-heading font-bold text-xl text-forest mb-4">Sustainable Travel</h3>
                            <p className="text-gray-500 font-light text-sm">We prioritize eco-friendly stays that give back to locals.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-500">
                            <div className="w-16 h-16 bg-terracotta/10 text-terracotta rounded-full flex items-center justify-center text-2xl mb-6">
                                <i className="fas fa-star"></i>
                            </div>
                            <h3 className="font-heading font-bold text-xl text-forest mb-4">Luxury Defined</h3>
                            <p className="text-gray-500 font-light text-sm">Comfort and elegance in the most remote corners of the world.</p>
                        </div>
                    </div>

                </div>
            </section>
        </Layout>
    );
}
