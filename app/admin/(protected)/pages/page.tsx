
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { ImagePicker } from '../../../../components/Admin/ImagePicker';

interface Page {
    id: string;
    slug: string;
    title: string;
    meta_title: string;
    meta_description: string;
}

interface Section {
    id: string;
    page_id: string;
    section_key: string;
    type: string;
    content: any;
    section_order: number;
}

export default function AdminPagesPage() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPage, setEditingPage] = useState<Page | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [loadingSections, setLoadingSections] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'sections'>('general');
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newPage, setNewPage] = useState({ title: '', slug: '' });

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        const { data, error } = await supabase.from('pages').select('*').order('slug');
        if (data) setPages(data);
        setLoading(false);
    };

    const handleCreatePage = async () => {
        if (!newPage.title || !newPage.slug) return alert('Fill all fields');
        const { data, error } = await supabase.from('pages').insert([newPage]).select().single();
        if (error) return alert(error.message);

        // Add default sections
        await supabase.from('sections').insert([
            { page_id: data.id, section_key: 'hero', type: 'hero', content: { title: newPage.title, subtitle: '', image: '' }, section_order: 0 },
            { page_id: data.id, section_key: 'intro', type: 'intro', content: { heading: '', subheading: '', text: '' }, section_order: 1 }
        ]);

        fetchPages();
        setIsCreating(false);
        setNewPage({ title: '', slug: '' });
    };

    const handleEdit = async (page: Page) => {
        setEditingPage(page);
        setActiveTab('general');
        fetchSections(page.id);
    };

    const fetchSections = async (pageId: string) => {
        setLoadingSections(true);
        const { data } = await supabase.from('sections').select('*').eq('page_id', pageId).order('section_order');
        if (data) setSections(data);
        setLoadingSections(false);
    };

    const savePage = async () => {
        if (!editingPage) return;
        const { error } = await supabase
            .from('pages')
            .update({
                title: editingPage.title,
                meta_title: editingPage.meta_title,
                meta_description: editingPage.meta_description
            })
            .eq('id', editingPage.id);

        if (!error) {
            alert('Page settings saved!');
            fetchPages();
        }
    };

    const saveSection = async () => {
        if (!editingSection) return;

        // Parse JSON content if it's currently a string from the fallback text editor
        let parsedContent = editingSection.content;
        const formTypes = ['hero', 'intro', 'story', 'properties', 'destinations', 'cta'];
        const isFormSection = formTypes.includes(editingSection.type) || formTypes.includes(editingSection.section_key);

        if (typeof editingSection.content === 'string' && !isFormSection) {
            try {
                parsedContent = JSON.parse(editingSection.content);
            } catch (e) {
                alert('Invalid JSON');
                return;
            }
        }

        const { error } = await supabase
            .from('sections')
            .update({
                content: parsedContent
            })
            .eq('id', editingSection.id);

        if (!error) {
            alert('Section saved!');
            setEditingSection(null);
            if (editingPage) fetchSections(editingPage.id);
        } else {
            alert('Error saving section');
        }
    };

    const initializeSystemPages = async () => {
        const systemPages = [
            { title: 'Home', slug: 'home' },
            { title: 'Destinations', slug: 'destinations' },
            { title: 'Hotels', slug: 'hotels' }
        ];

        for (const p of systemPages) {
            let pageId = pages.find(page => page.slug === p.slug)?.id;

            if (!pageId) {
                const { data, error } = await supabase.from('pages').insert([p]).select().single();
                if (data) pageId = data.id;
            }

            if (pageId) {
                // Check and add sections if missing
                const { data: existingSections } = await supabase.from('sections').select('section_key').eq('page_id', pageId);
                const keys = existingSections?.map(s => s.section_key) || [];

                const defaultSections = [];
                if (!keys.includes('hero')) defaultSections.push({ page_id: pageId, section_key: 'hero', type: 'hero', content: { title: p.title, subtitle: '', image: '', cta_text: 'Discover More', cta_link: '#' }, section_order: 0 });

                if (p.slug === 'home') {
                    if (!keys.includes('story')) defaultSections.push({ page_id: pageId, section_key: 'story', type: 'story', content: { headline: 'Our Story', heading: 'Refined Mountain Hospitality', badge: 'EST. 1994', content: 'Crafting silent luxury...', image: '', cta_text: 'Read More', cta_link: '/about' }, section_order: 1 });
                    if (!keys.includes('properties')) defaultSections.push({ page_id: pageId, section_key: 'properties', type: 'properties', content: { heading: 'Our Properties', sub_heading: 'Luxury Stays', description: 'Explore our hand-picked selection...' }, section_order: 2 });
                    if (!keys.includes('destinations')) defaultSections.push({ page_id: pageId, section_key: 'destinations', type: 'destinations', content: { heading: 'Featured Destinations', sub_heading: 'World Exploration', description: 'Discover the world with us.', link_text: 'View All Destinations', link_url: '/destinations' }, section_order: 3 });
                    if (!keys.includes('cta')) defaultSections.push({ page_id: pageId, section_key: 'cta', type: 'cta', content: { heading: 'Ready for your next adventure?', subtitle: 'Book your stay today', button_text: 'Book Now', button_link: '/contact' }, section_order: 4 });
                } else {
                    if (!keys.includes('intro')) defaultSections.push({ page_id: pageId, section_key: 'intro', type: 'intro', content: { heading: '', subheading: '', text: '' }, section_order: 1 });
                }

                if (defaultSections.length > 0) {
                    await supabase.from('sections').insert(defaultSections);
                }
            }
        }
        fetchPages();
        alert('System pages and sections checked and initialized where missing.');
    };

    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-heading text-charcoal">Pages Manager</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-charcoal/40 mt-2">Manage Site Content & SEO</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={initializeSystemPages} className="px-6 py-3 bg-forest/5 text-forest border border-forest/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-forest/10 transition-all">
                        Initialize Main Pages
                    </button>
                    <button onClick={() => setIsCreating(true)} className="px-6 py-3 bg-charcoal text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-forest transition-all shadow-lg">
                        Add New Page
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-charcoal/40 uppercase tracking-widest text-[10px] font-bold">Loading Pages...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pages.map((page) => (
                        <div key={page.id} onClick={() => handleEdit(page)} className="bg-white p-8 rounded-3xl shadow-sm border border-charcoal/5 group hover:shadow-xl transition-all duration-500 cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-forest/5 rounded-bl-[40px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 bg-charcoal/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-charcoal/60 mb-4">/{page.slug}</span>
                                <h3 className="text-xl font-bold text-charcoal mb-2">{page.title}</h3>
                                <p className="text-xs text-charcoal/50 line-clamp-2">{page.meta_description || 'No description set'}</p>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-forest opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                <span>Edit Page</span>
                                <i className="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Page Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6 text-charcoal">
                    <div className="bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                        <h3 className="text-2xl font-heading mb-8">Add New Page</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-charcoal/40">Page Title</label>
                                <input
                                    type="text"
                                    value={newPage.title}
                                    onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                                    className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:ring-2 ring-forest/20 transition-all"
                                    placeholder="e.g. Destinations"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-charcoal/40">Page Slug (URL)</label>
                                <input
                                    type="text"
                                    value={newPage.slug}
                                    onChange={(e) => setNewPage({ ...newPage, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:ring-2 ring-forest/20 transition-all"
                                    placeholder="e.g. destinations"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setIsCreating(false)} className="flex-1 py-4 text-xs font-bold uppercase tracking-widest">Cancel</button>
                                <button onClick={handleCreatePage} className="flex-1 bg-charcoal text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-forest transition-colors shadow-lg">Create Page</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editingPage && (
                <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 text-charcoal">
                    <div className="bg-[#f1f3f5] w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="bg-white px-8 py-6 border-b border-charcoal/5 flex justify-between items-center">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">Editing Page</span>
                                <h3 className="text-2xl font-heading text-charcoal">/{editingPage.slug}</h3>
                            </div>
                            <button
                                onClick={() => setEditingPage(null)}
                                className="w-10 h-10 rounded-full bg-charcoal/5 flex items-center justify-center text-charcoal hover:bg-charcoal hover:text-white transition-all"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="px-8 pt-6 flex gap-6 border-b border-charcoal/5 bg-white/50">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'general' ? 'text-forest border-b-2 border-forest' : 'text-charcoal/40 hover:text-charcoal'
                                    }`}
                            >
                                General & SEO
                            </button>
                            <button
                                onClick={() => setActiveTab('sections')}
                                className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'sections' ? 'text-forest border-b-2 border-forest' : 'text-charcoal/40 hover:text-charcoal'
                                    }`}
                            >
                                Content Sections ({sections.length})
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-grow overflow-y-auto p-8">
                            {activeTab === 'general' ? (
                                <div className="space-y-6 max-w-2xl mx-auto">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-charcoal/40">Page Title</label>
                                        <input
                                            type="text"
                                            value={editingPage.title}
                                            onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                                            className="w-full bg-white border border-charcoal/5 rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:border-forest/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-charcoal/40">Meta Title</label>
                                        <input
                                            type="text"
                                            value={editingPage.meta_title || ''}
                                            onChange={(e) => setEditingPage({ ...editingPage, meta_title: e.target.value })}
                                            className="w-full bg-white border border-charcoal/5 rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:border-forest/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-charcoal/40">Meta Description</label>
                                        <textarea
                                            rows={4}
                                            value={editingPage.meta_description || ''}
                                            onChange={(e) => setEditingPage({ ...editingPage, meta_description: e.target.value })}
                                            className="w-full bg-white border border-charcoal/5 rounded-2xl px-6 py-4 outline-none text-sm focus:border-forest/20 transition-all resize-none"
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <button onClick={savePage} className="w-full bg-charcoal text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-forest transition-colors shadow-lg">
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {loadingSections ? (
                                        <p className="py-20 text-center uppercase tracking-[0.2em] text-[10px] opacity-20 font-bold">Loading sections...</p>
                                    ) : (
                                        sections.map(section => (
                                            <div key={section.id} className="bg-white p-6 rounded-2xl shadow-sm border border-charcoal/5 flex justify-between items-center group">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="px-2 py-1 bg-forest/10 text-forest text-[9px] font-bold uppercase rounded-md">{section.type}</span>
                                                        <h4 className="font-bold text-charcoal text-sm uppercase">{section.section_key}</h4>
                                                    </div>
                                                    <p className="text-xs text-charcoal/40 font-mono truncate max-w-md">{JSON.stringify(section.content)}</p>
                                                </div>
                                                <button
                                                    onClick={() => setEditingSection(section)}
                                                    className="px-4 py-2 bg-charcoal/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-charcoal hover:text-white transition-all shadow-sm"
                                                >
                                                    Edit Content
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}

            {/* Specialized Editor Modal */}
            {editingSection && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-6 text-charcoal">
                    <div className="bg-white w-full max-w-2xl rounded-3xl p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-forest">Editing Segment</span>
                                <h3 className="text-2xl font-heading uppercase tracking-tighter">{editingSection.section_key}</h3>
                            </div>
                            <button onClick={() => setEditingSection(null)} className="w-10 h-10 rounded-full bg-charcoal/5 flex items-center justify-center"><i className="fas fa-times"></i></button>
                        </div>

                        <div className="mb-8 h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                            {editingSection.type === 'hero' ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-charcoal/40">Display Title</label>
                                        <input
                                            type="text"
                                            className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:ring-2 ring-forest/20 transition-all"
                                            value={editingSection.content.title || ''}
                                            onChange={(e) => setEditingSection({
                                                ...editingSection,
                                                content: { ...editingSection.content, title: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-charcoal/40">Subtitle</label>
                                        <input
                                            type="text"
                                            className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:ring-2 ring-forest/20 transition-all"
                                            value={editingSection.content.subtitle || ''}
                                            onChange={(e) => setEditingSection({
                                                ...editingSection,
                                                content: { ...editingSection.content, subtitle: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-charcoal/40">Button Text</label>
                                            <input
                                                type="text"
                                                className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:ring-2 ring-forest/20 transition-all"
                                                value={editingSection.content.cta_text || ''}
                                                onChange={(e) => setEditingSection({
                                                    ...editingSection,
                                                    content: { ...editingSection.content, cta_text: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-charcoal/40">Button Link</label>
                                            <input
                                                type="text"
                                                className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:ring-2 ring-forest/20 transition-all"
                                                value={editingSection.content.cta_link || ''}
                                                onChange={(e) => setEditingSection({
                                                    ...editingSection,
                                                    content: { ...editingSection.content, cta_link: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                    <ImagePicker
                                        label="Background Image"
                                        value={editingSection.content.image || ''}
                                        onChange={(url) => setEditingSection({
                                            ...editingSection,
                                            content: { ...editingSection.content, image: url }
                                        })}
                                    />
                                </div>
                            ) : (editingSection.type === 'intro' || editingSection.section_key === 'intro') ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-charcoal/40">Main Heading</label>
                                        <input
                                            type="text"
                                            className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:ring-2 ring-forest/20 transition-all"
                                            value={editingSection.content.heading || ''}
                                            onChange={(e) => setEditingSection({
                                                ...editingSection,
                                                content: { ...editingSection.content, heading: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-charcoal/40">Subheading / Badge</label>
                                        <input
                                            type="text"
                                            className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:ring-2 ring-forest/20 transition-all"
                                            value={editingSection.content.subheading || ''}
                                            onChange={(e) => setEditingSection({
                                                ...editingSection,
                                                content: { ...editingSection.content, subheading: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-charcoal/40">Intro Paragraph</label>
                                        <textarea
                                            rows={6}
                                            className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm focus:ring-2 ring-forest/20 transition-all resize-none"
                                            value={editingSection.content.text || ''}
                                            onChange={(e) => setEditingSection({
                                                ...editingSection,
                                                content: { ...editingSection.content, text: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            ) : (editingSection.type === 'story' || editingSection.section_key === 'story') ? (
                                <div className="space-y-4">
                                    <div className="mb-4">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40 block mb-2">Main Section Headline</label>
                                        <input
                                            type="text"
                                            className="w-full bg-charcoal/5 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-forest/10"
                                            value={editingSection.content.headline || ''}
                                            onChange={(e) => setEditingSection({
                                                ...editingSection,
                                                content: { ...editingSection.content, headline: e.target.value }
                                            })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40 block mb-2">Column Heading</label>
                                            <input
                                                type="text"
                                                className="w-full bg-charcoal/5 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-forest/10"
                                                value={editingSection.content.heading || ''}
                                                onChange={(e) => setEditingSection({
                                                    ...editingSection,
                                                    content: { ...editingSection.content, heading: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40 block mb-2">Badge</label>
                                            <input
                                                type="text"
                                                className="w-full bg-charcoal/5 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-forest/10"
                                                value={editingSection.content.badge || ''}
                                                onChange={(e) => setEditingSection({
                                                    ...editingSection,
                                                    content: { ...editingSection.content, badge: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40 block mb-2">Content (HTML Supported)</label>
                                        <textarea
                                            rows={6}
                                            className="w-full bg-charcoal/5 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-forest/10 resize-none"
                                            value={editingSection.content.content || ''}
                                            onChange={(e) => setEditingSection({
                                                ...editingSection,
                                                content: { ...editingSection.content, content: e.target.value }
                                            })}
                                        />
                                    </div>

                                    <ImagePicker
                                        label="Featured Image"
                                        value={editingSection.content.image || ''}
                                        onChange={(url) => setEditingSection({
                                            ...editingSection,
                                            content: { ...editingSection.content, image: url }
                                        })}
                                    />

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <input type="text" placeholder="CTA Text" className="bg-charcoal/5 p-3 rounded-xl text-xs" value={editingSection.content.cta_text || ''} onChange={(e) => setEditingSection({ ...editingSection, content: { ...editingSection.content, cta_text: e.target.value } })} />
                                        <input type="text" placeholder="CTA Link" className="bg-charcoal/5 p-3 rounded-xl text-xs" value={editingSection.content.cta_link || ''} onChange={(e) => setEditingSection({ ...editingSection, content: { ...editingSection.content, cta_link: e.target.value } })} />
                                    </div>
                                </div>
                            ) : (editingSection.type === 'properties' || editingSection.section_key === 'properties') ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-charcoal/40">Main Heading</label>
                                        <input
                                            type="text"
                                            className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:ring-2 ring-forest/20 transition-all"
                                            value={editingSection.content.heading || ''}
                                            onChange={(e) => setEditingSection({
                                                ...editingSection,
                                                content: { ...editingSection.content, heading: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-charcoal/40">Subheading / Badge</label>
                                        <input
                                            type="text"
                                            className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:ring-2 ring-forest/20 transition-all"
                                            value={editingSection.content.sub_heading || ''}
                                            onChange={(e) => setEditingSection({
                                                ...editingSection,
                                                content: { ...editingSection.content, sub_heading: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-charcoal/40">Description</label>
                                        <textarea
                                            rows={4}
                                            className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm focus:ring-2 ring-forest/20 transition-all resize-none"
                                            value={editingSection.content.description || ''}
                                            onChange={(e) => setEditingSection({
                                                ...editingSection,
                                                content: { ...editingSection.content, description: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            ) : (editingSection.type === 'destinations' || editingSection.section_key === 'destinations') ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-charcoal/40">Main Heading</label>
                                        <input
                                            type="text"
                                            className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:ring-2 ring-forest/20 transition-all"
                                            value={editingSection.content.heading || ''}
                                            onChange={(e) => setEditingSection({
                                                ...editingSection,
                                                content: { ...editingSection.content, heading: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-charcoal/40">Subheading / Badge</label>
                                        <input
                                            type="text"
                                            className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:ring-2 ring-forest/20 transition-all"
                                            value={editingSection.content.sub_heading || ''}
                                            onChange={(e) => setEditingSection({
                                                ...editingSection,
                                                content: { ...editingSection.content, sub_heading: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-charcoal/40">Description</label>
                                        <textarea
                                            rows={4}
                                            className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm focus:ring-2 ring-forest/20 transition-all resize-none"
                                            value={editingSection.content.description || ''}
                                            onChange={(e) => setEditingSection({
                                                ...editingSection,
                                                content: { ...editingSection.content, description: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-charcoal/40">Footer Link Text</label>
                                            <input
                                                type="text"
                                                className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:ring-2 ring-forest/20 transition-all"
                                                value={editingSection.content.link_text || ''}
                                                onChange={(e) => setEditingSection({
                                                    ...editingSection,
                                                    content: { ...editingSection.content, link_text: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-charcoal/40">Footer Link URL</label>
                                            <input
                                                type="text"
                                                className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:ring-2 ring-forest/20 transition-all"
                                                value={editingSection.content.link_url || ''}
                                                onChange={(e) => setEditingSection({
                                                    ...editingSection,
                                                    content: { ...editingSection.content, link_url: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (editingSection.type === 'cta' || editingSection.section_key === 'cta') ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-charcoal/40">Main Heading</label>
                                        <input
                                            type="text"
                                            className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:ring-2 ring-forest/20 transition-all"
                                            value={editingSection.content.heading || ''}
                                            onChange={(e) => setEditingSection({
                                                ...editingSection,
                                                content: { ...editingSection.content, heading: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-charcoal/40">Subtitle</label>
                                        <textarea
                                            rows={4}
                                            className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm focus:ring-2 ring-forest/20 transition-all resize-none"
                                            value={editingSection.content.subtitle || ''}
                                            onChange={(e) => setEditingSection({
                                                ...editingSection,
                                                content: { ...editingSection.content, subtitle: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-charcoal/40">Button Text</label>
                                            <input
                                                type="text"
                                                className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:ring-2 ring-forest/20 transition-all"
                                                value={editingSection.content.button_text || ''}
                                                onChange={(e) => setEditingSection({
                                                    ...editingSection,
                                                    content: { ...editingSection.content, button_text: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-charcoal/40">Button Link</label>
                                            <input
                                                type="text"
                                                className="w-full bg-charcoal/5 border-none rounded-2xl px-6 py-4 outline-none text-sm font-bold focus:ring-2 ring-forest/20 transition-all"
                                                value={editingSection.content.button_link || ''}
                                                onChange={(e) => setEditingSection({
                                                    ...editingSection,
                                                    content: { ...editingSection.content, button_link: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-terracotta border-l-2 border-terracotta pl-3">Advanced: Raw JSON Editor</p>
                                    <textarea
                                        className="w-full h-80 font-mono text-xs bg-charcoal/5 p-6 rounded-2xl outline-none focus:ring-2 ring-forest/20"
                                        value={typeof editingSection.content === 'string' ? editingSection.content : JSON.stringify(editingSection.content, null, 2)}
                                        onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setEditingSection(null)} className="px-6 py-3 text-xs font-bold uppercase tracking-widest">Cancel</button>
                            <button onClick={saveSection} className="px-8 py-4 bg-charcoal text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-forest transition-colors shadow-lg">Confirm & Save</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

