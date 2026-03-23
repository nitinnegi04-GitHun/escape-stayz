
import { Metadata } from 'next';
import { cache } from 'react';
import { SITE_URL, SITE_NAME, SITE_OG_IMAGE } from '../../lib/constants';
import { Layout } from '../../components/Layout';
import { PageHero } from '../../components/PageHero';
import { ContactForm } from '../../components/ContactForm';
import { supabase } from '../../lib/supabase';

// Revalidate every hour
export const revalidate = 3600;

const getPageData = cache(async () => {
    const { data: page } = await supabase.from('pages').select('*').eq('slug', 'contact').single();
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
            title: 'Contact Us | Escape Stayz',
            description: 'Get in touch with the Escape Stayz concierge for booking assistance and support.',
        };
    }

    const title = page.meta_title || "Contact Us | Escape Stayz";
    const description = page.meta_description || "Get in touch with the Escape Stayz concierge for booking assistance and support.";

    return {
        title,
        description,
        alternates: {
            canonical: `${SITE_URL}/contact`,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${SITE_URL}/contact`,
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

export default async function ContactPage() {
    const page = await getPageData();

    let heroContent = {
        title: "Contact Us",
        subtitle: "We're Here to Help",
        image: "https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&q=80&w=2940"
    };

    let introContent = {
        badge: "Get in Touch",
        subheading: "Get in Touch",
        heading: "Let's Connect",
        content: "Our travel experts are available 24/7 to assist with your inquiries, booking adjustments, or bespoke requests. We look forward to crafting your perfect escape.",
        text: "Our travel experts are available 24/7 to assist with your inquiries, booking adjustments, or bespoke requests. We look forward to crafting your perfect escape."
    };

    if (page) {
        const sections = await getSections(page.id);
        const getSection = (key: string) => sections.find(s => s.section_key === key)?.content || {};

        const fetchedHero = getSection('hero');
        if (fetchedHero.title) heroContent = fetchedHero;

        const fetchedIntro = getSection('intro');
        if (fetchedIntro.heading) introContent = fetchedIntro;
    }

    const contactSchema = [
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
                { "@type": "ListItem", "position": 2, "name": "Contact", "item": `${SITE_URL}/contact` }
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "url": `${SITE_URL}/contact`,
            "mainEntity": {
                "@type": "Organization",
                "name": SITE_NAME,
                "url": SITE_URL,
                "telephone": "+91-9999999999",
                "email": "concierge@escapestayz.in"
            }
        }
    ];

    return (
        <Layout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
            />

            <PageHero
                title={heroContent.title}
                subtitle={heroContent.subtitle}
                image={heroContent.image}
            />

            <section className="bg-white min-h-screen py-24">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

                        {/* Contact Info */}
                        <div>
                            <span className="text-[#D96C5B] font-bold uppercase tracking-[0.2em] text-xs mb-6 block">{introContent.badge || introContent.subheading}</span>
                            <h2 className="text-4xl font-bold text-forest mb-6 font-heading">{introContent.heading}</h2>
                            <p className="text-gray-500 text-lg mb-12 font-light leading-relaxed">
                                {introContent.content || introContent.text}
                            </p>

                            <div className="space-y-8">
                                <div className="flex gap-6 items-center group">
                                    <div className="w-16 h-16 bg-forest text-white rounded-[20px] flex items-center justify-center flex-shrink-0 group-hover:bg-terracotta transition-colors duration-300">
                                        <i className="fas fa-phone-alt text-xl"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-forest mb-1 font-heading">Global Support</h4>
                                        <p className="text-gray-500 font-light">+1 (800) ESCAPE-7</p>
                                    </div>
                                </div>

                                <div className="flex gap-6 items-center group">
                                    <div className="w-16 h-16 bg-forest text-white rounded-[20px] flex items-center justify-center flex-shrink-0 group-hover:bg-terracotta transition-colors duration-300">
                                        <i className="fas fa-envelope text-xl"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-forest mb-1 font-heading">Email Us</h4>
                                        <p className="text-gray-500 font-light">concierge@escapestayz.com</p>
                                    </div>
                                </div>

                                <div className="flex gap-6 items-center group">
                                    <div className="w-16 h-16 bg-forest text-white rounded-[20px] flex items-center justify-center flex-shrink-0 group-hover:bg-terracotta transition-colors duration-300">
                                        <i className="fas fa-map-marker-alt text-xl"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-forest mb-1 font-heading">Headquarters</h4>
                                        <p className="text-gray-500 font-light">123 Alpine Way, Kinnaur, HP</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <ContactForm />

                    </div>
                </div>
            </section>
        </Layout>
    );
}
