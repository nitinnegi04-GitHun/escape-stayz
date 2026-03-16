
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { Layout } from '../../../components/Layout';
import { TableOfContents } from '../../../components/TableOfContents';
import { Breadcrumbs } from '../../../components/Breadcrumbs';
import { Button } from '../../../components/ui/Button';
import { getBlogPostBySlug, getHotels, getBlogPosts } from '../../../lib/queries';
import { supabase } from '../../../lib/supabase';

// Revalidate every hour
export const revalidate = 3600;

const getPost = cache(async (slug: string) => {
    try {
        const post = await getBlogPostBySlug(slug);
        return post;
    } catch (e) {
        return null;
    }
});

const getFeaturedStays = cache(async () => {
    try {
        const hotels = await getHotels(2, true);
        return hotels || [];
    } catch (e) {
        return [];
    }
});

/**
 * Replaces the <div data-auto-toc> placeholder inserted by the editor
 * with a fully rendered, numbered table of contents built from the
 * H1 / H2 headings found in the article HTML.
 */
function processContent(html: string): string {
    if (!html.includes('data-auto-toc')) return html;

    // We search for H1/H2 tags. They might or might not have existing IDs.
    const headingRegex = /<h([12])([^>]*)>([\s\S]*?)<\/h[12]>/gi;
    const headings: { level: number; id: string; text: string; fullMatch: string; tagBody: string }[] = [];
    let m;

    while ((m = headingRegex.exec(html)) !== null) {
        const level = parseInt(m[1]);
        const tagAttributes = m[2];
        const content = m[3].replace(/<[^>]*>?/gm, '').trim(); // Strip internal tags for ID gen

        // Generate a stable ID from the text content
        const id = content.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        if (id) {
            headings.push({
                level,
                id,
                text: content,
                fullMatch: m[0],
                tagBody: tagAttributes
            });
        }
    }

    if (headings.length === 0) {
        return html.replace(/<div[^>]*data-auto-toc="true"[\s\S]*?<\/div>/gi, '');
    }

    // Replace the headings in the HTML to ensure they HAVE the IDs we just generated
    let processedHtml = html;
    headings.forEach(h => {
        // If the heading already has an ID, we potentially replace it, but for simplicity
        // we just ensure the tag we found now has the ID attribute we expect.
        // We use a safe replacement that doesn't duplicate IDs.
        const newTag = `<h${h.level} id="${h.id}"${h.tagBody.replace(/id="[^"]*"/gi, '')}>${h.text}</h${h.level}>`;
        processedHtml = processedHtml.replace(h.fullMatch, newTag);
    });

    let h1Count = 0;
    const tocItems = headings.map((h) => {
        if (h.level === 1) h1Count++;
        const indent = h.level === 2 ? ' style="margin-left:1.25rem"' : '';
        const prefix = h.level === 1
            ? `<span class="inline-toc-num">${h1Count}.</span>`
            : `<span class="inline-toc-sub">&#8627;</span>`;
        return `<li${indent}><a href="#${h.id}" class="inline-toc-link">${prefix} ${h.text}</a></li>`;
    }).join('\n');

    const tocHtml = `<div class="inline-toc"><div class="inline-toc-header"><span class="inline-toc-header-icon">&#9776;</span><span class="inline-toc-header-title">Table of Contents</span></div><ol class="inline-toc-list">${tocItems}</ol></div>`;

    return processedHtml.replace(/<div[^>]*data-auto-toc="true"[^>]*>[\s\S]*?<\/div>/gi, tocHtml);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    const title = post.meta_title || post.title;
    const description = post.meta_description || post.excerpt;
    const image = post.featured_image;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
            images: [image],
            authors: ['Elena Rossi'], // Hardcoded as per original
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
        alternates: {
            canonical: `https://escapestayz.com/blog/${post.slug}`,
        }
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    const featuredStays = await getFeaturedStays();
    const allPosts = await getBlogPosts();
    const processedContent = processContent(post.content || '');

    // Grouping posts by category for the sidebar
    const categories = Array.from(new Set(allPosts.map(p => p.category).filter(Boolean)));
    const groupedPosts = categories.map(cat => ({
        name: cat,
        posts: allPosts.filter(p => p.category === cat && p.published)
    })).filter(g => g.posts.length > 0);

    // Fetching WhatsApp contact info
    const { data: settingsData } = await supabase.from('site_settings').select('*');
    const contactInfo = settingsData?.find(s => s.key === 'contact_info')?.value;
    const whatsappNumber = contactInfo?.phone?.replace(/\D/g, '') || '919876543210';

    // Helper to generate encoded WhatsApp link with message
    const getWhatsAppLink = (message: string) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;


    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "image": [post.featured_image],
        "datePublished": post.created_at,
        "author": [{
            "@type": "Person",
            "name": "Elena Rossi",
            "url": "https://escapestayz.com/about"
        }],
        "description": post.excerpt,
        "publisher": {
            "@type": "Organization",
            "name": "Escape Stayz Luxury Group",
            "logo": {
                "@type": "ImageObject",
                "url": "https://escapestayz.com/logo.png"
            }
        }
    };

    return (
        <Layout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

            <section className="relative h-[70vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-charcoal">
                {post.featured_image ? (
                    <img src={post.featured_image} className="absolute inset-0 w-full h-full object-cover" alt={post.title} />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-forest to-charcoal" />
                )}
                <div className="absolute inset-0 bg-black/40"></div>

                <div className="relative z-10 text-center max-w-5xl px-6 mt-20">
                    <span className="inline-block px-4 py-2 border border-white/30 rounded-full text-white/90 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-sm bg-white/10">
                        Journal
                    </span>
                    <h1 className="text-4xl md:text-8xl font-heading text-white mb-6 text-shadow-lg leading-tight uppercase">
                        {post.title}
                    </h1>
                </div>
            </section>

            <Breadcrumbs items={[{ label: 'Journal', path: '/blog' }, { label: post.title }]} />

            <section className="bg-cream min-h-screen pb-32 pt-16">
                <div className="container mx-auto px-6">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 max-w-7xl mx-auto">
                        {/* Main Content Column */}
                        <div className="lg:col-span-8">
                            <article className="prose prose-slate max-w-none
                                prose-headings:font-heading prose-headings:text-charcoal prose-headings:font-bold prose-headings:not-italic
                                prose-h1:text-4xl md:prose-h1:text-5xl prose-h1:mb-8
                                prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-12 prose-h2:mb-6
                                prose-h3:text-2xl md:prose-h3:text-3xl prose-h3:mt-10 prose-h3:mb-4
                                prose-p:text-charcoal/80 prose-p:leading-relaxed prose-p:text-base md:prose-p:text-lg
                                prose-a:text-forest prose-strong:text-charcoal prose-strong:font-bold
                                text-charcoal/70 leading-[1.8] font-light">
                                <p className="text-xl md:text-2xl italic font-heading text-charcoal/90 mb-10 leading-relaxed opacity-80">
                                    {post.excerpt}
                                </p>

                                {/* In-Article Callout */}
                                <div className="mb-14 not-prose">
                                    <div className="p-10 bg-forest/5 border border-forest/10 rounded-3xl flex flex-col md:flex-row items-center gap-8 group">
                                        <div className="flex-grow text-center md:text-left">
                                            <h3 className="text-2xl font-heading font-bold text-forest mb-2">Curated Itineraries</h3>
                                            <p className="text-sm text-charcoal/60 leading-relaxed">
                                                Inspired by {post.title}? Let us craft a bespoke travel plan for your visit.
                                            </p>
                                        </div>
                                        <Button
                                            href={getWhatsAppLink(`Hi! I'd like to get a curated itinerary for ${post.title}. Can you help?`)}
                                            variant="primary"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Inquire Now
                                        </Button>
                                    </div>
                                </div>

                                <div dangerouslySetInnerHTML={{ __html: processedContent }} />
                            </article>

                            {/* End of Post Banner */}
                            <div className="mt-20 p-1 bg-gradient-to-r from-forest/10 via-terracotta/10 to-forest/10 rounded-[50px]">
                                <div className="bg-white rounded-[49px] p-12 text-center shadow-sm">
                                    <span className="inline-block px-4 py-1.5 bg-forest/5 rounded-full text-forest text-[9px] font-bold uppercase tracking-[0.2em] mb-6">Start Your Journey</span>
                                    <h4 className="text-4xl md:text-5xl font-heading font-bold text-charcoal mb-8 leading-[1.1]">The mountains are calling. <br /><span className="text-forest">Will you answer?</span></h4>
                                    <p className="text-charcoal/50 text-base max-w-xl mx-auto mb-10 leading-relaxed">
                                        Experience silent luxury at its finest. Chat with us on WhatsApp to begin planning your next secluded escape.
                                    </p>
                                    <div className="mt-10 not-prose">
                                        <Button
                                            href={getWhatsAppLink(`Hello! I'm ready to start my journey to ${post.title}. What are the next steps?`)}
                                            variant="primary"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Connect on WhatsApp
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Callout block + Inline TOC + heading anchor styles */}
                            <style>{`
                                /* ── Inline TOC ── */
                                .inline-toc {
                                    background: #f5f2ed;
                                    border: 1px solid rgba(33,62,33,0.10);
                                    border-radius: 20px;
                                    padding: 22px 28px 20px;
                                    margin: 0 0 36px 0;
                                    display: inline-block;
                                    min-width: 260px;
                                    max-width: 100%;
                                }
                                .inline-toc-header {
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                    margin-bottom: 14px;
                                    padding-bottom: 10px;
                                    border-bottom: 1px solid rgba(33,62,33,0.08);
                                }
                                .inline-toc-header-icon { color: #216e39; font-size: 13px; }
                                .inline-toc-header-title {
                                    font-size: 11px;
                                    font-weight: 800;
                                    text-transform: uppercase;
                                    letter-spacing: 0.18em;
                                    color: #216e39;
                                }
                                .inline-toc-list {
                                    list-style: none;
                                    padding: 0;
                                    margin: 0;
                                    display: flex;
                                    flex-direction: column;
                                    gap: 5px;
                                }
                                .inline-toc-list li { margin: 0; padding: 0; }
                                .inline-toc-link {
                                    display: inline-flex;
                                    align-items: baseline;
                                    gap: 7px;
                                    font-size: 0.88rem;
                                    color: #3a3a3a;
                                    text-decoration: none;
                                    font-weight: 500;
                                    line-height: 1.5;
                                    transition: color 0.15s;
                                }
                                .inline-toc-link:hover { color: #216e39; text-decoration: underline; }
                                .inline-toc-num {
                                    font-weight: 700;
                                    color: #c84b31;
                                    font-size: 0.82rem;
                                    flex-shrink: 0;
                                    min-width: 18px;
                                }
                                .inline-toc-sub { color: #aaa49d; font-size: 0.85rem; flex-shrink: 0; }

                                /* ── Callout Block ── */
                                .callout-block {
                                    background: #f8f4ee;
                                    border-left: 4px solid #c84b31;
                                    border-radius: 16px;
                                    padding: 20px 24px;
                                    margin: 28px 0;
                                    font-size: 0.95rem;
                                    line-height: 1.75;
                                    color: #2a2a2a;
                                    font-weight: 400;
                                }
                                .callout-block strong, .callout-block b {
                                    color: #c84b31;
                                    font-weight: 700;
                                }
                                .callout-block a {
                                    color: #c84b31;
                                    font-weight: 600;
                                    text-decoration: underline;
                                }
                                /* Heading scroll offset so sticky nav doesn't obscure */
                                h1[id], h2[id], h3[id], h4[id] {
                                    scroll-margin-top: 100px;
                                }
                            `}</style>

                            {/* Recommended Stays Section */}
                            <div className="mt-32 pt-32 border-t border-forest/10">
                                <h3 className="text-4xl font-heading italic mb-16">Recommended Hotels</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                    {featuredStays.map((hotel: any) => {
                                        // Robust image selection: hero_image -> first gallery image -> fallback
                                        const hotelImage = hotel.hero_image ||
                                            (hotel.images && hotel.images.length > 0 ? hotel.images[0].image_url : null);

                                        const optimizedImage = hotelImage
                                            ? `${hotelImage}${hotelImage.includes('?') ? '&' : '?'}fm=webp&w=800&q=80`
                                            : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'; // Fallback if still null

                                        return (
                                            <Link href={`/hotels/${hotel.slug}`} key={hotel.id} className="group">
                                                <div className="aspect-video rounded-3xl overflow-hidden mb-8 shadow-2xl">
                                                    <img
                                                        src={optimizedImage}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                                                        alt={hotel.name}
                                                    />
                                                </div>
                                                <h4 className="text-3xl font-heading italic group-hover:text-forest transition-colors">{hotel.name}</h4>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30">{hotel.location_name}</p>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <aside className="lg:col-span-4 hidden lg:block">
                            <div className="sticky top-32 space-y-12">
                                <div className="space-y-6">
                                    <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-forest/30 mb-8 pb-4 border-b border-forest/5 font-heading">Journal Index</h3>
                                    <div className="space-y-10">
                                        {groupedPosts.map((group, idx) => (
                                            <div key={idx} className="space-y-5">
                                                <p className="text-[11px] font-heading font-bold uppercase tracking-widest text-terracotta/80">{group.name}</p>
                                                <ul className="space-y-4">
                                                    {group.posts.map(p => (
                                                        <li key={p.id}>
                                                            <Link
                                                                href={`/blog/${p.slug}`}
                                                                className={`text-sm leading-relaxed block transition-all hover:text-forest hover:translate-x-1 ${p.slug === slug ? 'font-bold text-forest underline underline-offset-8 decoration-forest/20' : 'text-charcoal/70'}`}
                                                            >
                                                                {p.title}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-forest/5">
                                    <TableOfContents content={post.content} />
                                </div>

                                {/* Sidebar Consultation CTA */}
                                <div className="pt-8 border-t border-forest/5">
                                    <div className="bg-forest rounded-3xl p-8 text-white shadow-xl shadow-forest/10">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-4">Consultation</p>
                                        <h4 className="text-xl font-heading font-bold mb-4 leading-tight">Plan Your Tailored Escape</h4>
                                        <p className="text-xs text-white/70 mb-6 leading-loose font-light">
                                            Chat with our mountain concierges for a personalized itinerary that matches your rhythm.
                                        </p>
                                        <Button
                                            href={getWhatsAppLink(`Hi! I'm interested in booking a stay. I'm currently looking at: ${post.title}`)}
                                            variant="primary"
                                            className="w-full"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Book Now
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
