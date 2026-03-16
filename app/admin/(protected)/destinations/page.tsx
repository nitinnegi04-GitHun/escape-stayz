
'use client';

import React, { useEffect, useState } from 'react';
import { ImagePicker } from '../../../../components/Admin/ImagePicker';
import { GallerySelector } from '../../../../components/Admin/GallerySelector';
import { supabase } from '../../../../lib/supabase';
import { getDestinations } from '../../../../lib/queries';

interface DestinationEntry {
    id?: string;
    name: string;
    slug: string;
    description: string;
    long_description: string;
    image_url: string;
    hero_image: string;
    meta_title: string;
    meta_description: string;
    best_time_to_visit: { season: string; months: string; description: string }[];
    things_to_do: { title: string; description: string; imageUrl?: string; category?: string }[];
    faqs: { question: string; answer: string }[];
    travel_tips: string[];
    altitude: string;
    weather_info: string;
    distance_from_major_hub: string; // e.g. "250 km from Chandigarh"
    languages_spoken: string[];
    how_to_reach: { mode: string; hub: string; distance: string; time: string; details: string }[];
    local_cuisine: { intro: string; dishes: { name: string; description: string; image: string }[] };
    latitude: number;
    longitude: number;
    coordinates: { lat: number; lng: number };
}

interface DestinationImage {
    id?: string;
    destination_id?: string;
    image_url: string;
    alt_text?: string;
    display_order?: number;
    tags?: string;
}

export default function AdminDestinationsPage() {
    const [destinations, setDestinations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentDestination, setCurrentDestination] = useState<DestinationEntry | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Tabs & Linked Data
    const [activeTab, setActiveTab] = useState<'general' | 'content' | 'facts' | 'gallery' | 'guide' | 'transport' | 'hotels' | 'faqs' | 'seo'>('general');
    const [linkedHotels, setLinkedHotels] = useState<any[]>([]);
    const [allHotels, setAllHotels] = useState<any[]>([]);
    const [loadingAllHotels, setLoadingAllHotels] = useState(false);
    const [hotelSearchQuery, setHotelSearchQuery] = useState('');

    // Gallery State
    const [destinationImages, setDestinationImages] = useState<DestinationImage[]>([]);
    const [showGallerySelector, setShowGallerySelector] = useState(false);

    const fetchDestinationsData = async () => {
        setLoading(true);
        try {
            const data = await getDestinations();
            setDestinations(data || []);
        } catch (err) {
            console.error("Fetch Destinations Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDestinationsData();
    }, []);

    const fetchLinkedHotelsData = async (slug: string) => {
        if (!slug) return;
        const { data } = await supabase.from('hotels').select('*').eq('destination_slug', slug);
        setLinkedHotels(data || []);
    };

    const fetchAllHotels = async () => {
        setLoadingAllHotels(true);
        const { data } = await supabase.from('hotels').select('id, name, slug, location_name, hero_image, destination_slug').order('name');
        setAllHotels(data || []);
        setLoadingAllHotels(false);
    };

    const fetchDestinationImages = async (destinationId: string) => {
        const { data } = await supabase
            .from('destination_images')
            .select('*')
            .eq('destination_id', destinationId)
            .order('display_order');
        setDestinationImages(data || []);
    };

    const linkHotel = async (hotelId: string) => {
        if (!currentDestination?.slug) return;
        const { error } = await supabase.from('hotels').update({ destination_slug: currentDestination.slug }).eq('id', hotelId);
        if (error) { alert(`Failed to link hotel: ${error.message}`); return; }
        await fetchLinkedHotelsData(currentDestination.slug);
        await fetchAllHotels();
    };

    const unlinkHotel = async (hotelId: string) => {
        if (!currentDestination?.slug) return;
        if (!confirm('Remove this hotel from the destination?')) return;
        const { error } = await supabase.from('hotels').update({ destination_slug: null }).eq('id', hotelId);
        if (error) { alert(`Failed to unlink hotel: ${error.message}`); return; }
        await fetchLinkedHotelsData(currentDestination.slug);
        await fetchAllHotels();
    };

    const handleEdit = (destination: any, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const dbColumns = [
            'id', 'name', 'slug', 'description', 'long_description', 'image_url',
            'hero_image', 'meta_title', 'meta_description',
            'best_time_to_visit', 'things_to_do', 'faqs', 'travel_tips',
            'altitude', 'weather_info', 'distance_from_major_hub', 'languages_spoken',
            'how_to_reach', 'local_cuisine', 'latitude', 'longitude', 'coordinates'
        ];

        const sanitized = Object.fromEntries(
            Object.entries(destination).filter(([key]) => dbColumns.includes(key))
        ) as unknown as DestinationEntry;

        // Ensure defaults for JSON fields if null
        if (!sanitized.best_time_to_visit) sanitized.best_time_to_visit = [];
        if (!sanitized.things_to_do) sanitized.things_to_do = [];
        if (!sanitized.faqs) sanitized.faqs = [];
        if (!sanitized.travel_tips) sanitized.travel_tips = [];
        if (!sanitized.how_to_reach) sanitized.how_to_reach = [];
        if (!sanitized.local_cuisine) sanitized.local_cuisine = { intro: '', dishes: [] };
        if (!sanitized.coordinates) sanitized.coordinates = { lat: 0, lng: 0 };
        if (!sanitized.languages_spoken) sanitized.languages_spoken = [];

        setCurrentDestination(sanitized);
        if (sanitized.id) fetchDestinationImages(sanitized.id);
        if (sanitized.slug) fetchLinkedHotelsData(sanitized.slug);
        fetchAllHotels();
        setHotelSearchQuery('');
        setDestinationImages([]);
        setActiveTab('general');
        setIsEditorOpen(true);
    };

    const handleNew = () => {
        setCurrentDestination({
            name: '',
            slug: '',
            description: '',
            long_description: '',
            image_url: '',
            hero_image: '',
            meta_title: '',
            meta_description: '',
            best_time_to_visit: [],
            things_to_do: [],
            faqs: [],
            travel_tips: [],
            altitude: '',
            weather_info: '',
            distance_from_major_hub: '',
            languages_spoken: [],
            how_to_reach: [],
            local_cuisine: { intro: '', dishes: [] },
            latitude: 31.1048,
            longitude: 77.1734,
            coordinates: { lat: 31.1048, lng: 77.1734 } // Default to Shimla ish
        });
        setLinkedHotels([]);
        setDestinationImages([]);
        fetchAllHotels();
        setHotelSearchQuery('');
        setActiveTab('general');
        setIsEditorOpen(true);
    };

    const saveDestination = async () => {
        if (!currentDestination) return;
        setIsSaving(true);

        try {
            const dbColumns = [
                'id', 'name', 'slug', 'description', 'long_description', 'image_url',
                'hero_image', 'meta_title', 'meta_description',
                'best_time_to_visit', 'things_to_do', 'faqs', 'travel_tips',
                'altitude', 'weather_info', 'distance_from_major_hub', 'languages_spoken',
                'how_to_reach', 'local_cuisine', 'latitude', 'longitude', 'coordinates'
            ];

            const savePayload = Object.fromEntries(
                Object.entries(currentDestination).filter(([key, val]) => dbColumns.includes(key) && val !== undefined)
            );

            if (!savePayload.id) delete savePayload.id;

            const { error } = await supabase
                .from('destinations')
                .upsert(savePayload, { onConflict: 'id' });

            if (error) throw error;

            // Sync Destination Images
            const destinationId = savePayload.id || (await supabase.from('destinations').select('id').eq('slug', savePayload.slug).single()).data?.id;

            if (destinationId) {
                // Delete existing images
                await supabase.from('destination_images').delete().eq('destination_id', destinationId);

                // Insert new images
                if (destinationImages.length > 0) {
                    const imageInserts = destinationImages.map((img, index) => ({
                        destination_id: destinationId,
                        image_url: img.image_url,
                        alt_text: img.alt_text || '',
                        display_order: index,
                        tags: img.tags || null
                    }));
                    const { error: imgError } = await supabase.from('destination_images').insert(imageInserts);
                    if (imgError) console.warn("Gallery sync failed:", imgError.message);
                }
            }

            setIsEditorOpen(false);
            fetchDestinationsData();
        } catch (err: any) {
            console.error("Save Error:", err);
            alert(`Database Error: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const deleteDestination = async (id: string, name: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm(`Permanently remove "${name}"? This may affect hotels linked to this destination.`)) return;

        setLoading(true);
        try {
            // Delete associated images first (cascade should handle this if defined, but being explicit)
            await supabase.from('destination_images').delete().eq('destination_id', id);

            const { error } = await supabase.from('destinations').delete().eq('id', id);

            if (error) {
                throw new Error(`[DB ERROR ${error.code}] ${error.message}`);
            }

            fetchDestinationsData();
            alert(`"${name}" successfully deleted.`);
        } catch (err: any) {
            console.error("Delete Failure:", err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-3xl shadow-sm border border-charcoal/5 overflow-hidden">
                <div className="p-6 border-b border-charcoal/5 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h3 className="text-lg font-serif italic">Territory Registry</h3>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/30 mt-1">{destinations.length} Destinations Active</p>
                    </div>
                    <button onClick={handleNew} className="bg-forest text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-forest/20 hover:scale-105 transition-all">
                        + Add Territory
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#f8f9fa] border-b border-charcoal/5">
                                <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-charcoal/40">Destination</th>
                                <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-charcoal/40">Slug</th>
                                <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-charcoal/40 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal/5">
                            {loading ? (
                                [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan={3} className="px-6 py-8 h-20 bg-white"></td></tr>)
                            ) : destinations.map((dest) => (
                                <tr key={dest.id} className="hover:bg-[#f8f9fa] transition-colors group">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-charcoal/5 flex-shrink-0">
                                                <img src={dest.image_url || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=100'} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <span className="text-sm font-bold text-charcoal">{dest.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3"><span className="text-[10px] font-mono text-charcoal/50">{dest.slug}</span></td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2 pointer-events-auto">
                                            <button onClick={(e) => handleEdit(dest, e)} className="w-8 h-8 rounded-lg border border-charcoal/5 flex items-center justify-center text-charcoal/20 hover:text-forest hover:bg-forest/5 transition-all"><i className="fas fa-pen-nib text-[10px]"></i></button>
                                            <button onClick={(e) => deleteDestination(dest.id, dest.name, e)} className="w-8 h-8 rounded-lg border border-charcoal/5 flex items-center justify-center text-charcoal/20 hover:text-red-500 hover:bg-red-50 transition-all"><i className="fas fa-trash-can text-[10px]"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isEditorOpen && currentDestination && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-md" onClick={() => setIsEditorOpen(false)}></div>
                    <div className="bg-white w-full max-w-5xl h-[90vh] rounded-xl relative z-10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-charcoal/10 flex justify-between items-center bg-white sticky top-0 z-20">
                            <div>
                                <h3 className="text-xl font-serif font-bold text-charcoal">{currentDestination.name || 'New Territory'}</h3>
                                <div className="flex gap-4 mt-4">
                                    {['general', 'content', 'facts', 'gallery', 'guide', 'transport', 'hotels', 'faqs', 'seo'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab as any)}
                                            className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-all ${activeTab === tab ? 'border-forest text-forest' : 'border-transparent text-charcoal/40 hover:text-charcoal'
                                                }`}
                                        >
                                            {tab === 'facts' ? 'Key Facts' : tab === 'guide' ? 'Things to Do' : tab === 'transport' ? 'Getting There' : tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setIsEditorOpen(false)} className="px-4 py-2 rounded-lg text-xs font-bold uppercase text-charcoal/60 hover:bg-gray-100 transition-colors">Discard</button>
                                <button onClick={saveDestination} disabled={isSaving} className="bg-forest text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-forest/90 transition-all">{isSaving ? 'Saving...' : 'Save Territory'}</button>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar bg-gray-50/50">

                            {/* General Tab */}
                            {activeTab === 'general' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-charcoal/60">Name</label>
                                            <input type="text" value={currentDestination.name} onChange={(e) => {
                                                const name = e.target.value;
                                                const updates: any = { name };
                                                if (!currentDestination.id) updates.slug = name.toLowerCase().replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-');
                                                setCurrentDestination({ ...currentDestination, ...updates });
                                            }} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm font-medium focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-charcoal/60">Slug</label>
                                            <input type="text" value={currentDestination.slug} onChange={(e) => setCurrentDestination({ ...currentDestination, slug: e.target.value })} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm font-mono text-charcoal/80 focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-charcoal/60">Latitude</label>
                                            <input type="number" step="0.0001" value={currentDestination.latitude || 0} onChange={(e) => {
                                                const lat = parseFloat(e.target.value);
                                                setCurrentDestination({
                                                    ...currentDestination,
                                                    latitude: lat,
                                                    coordinates: { ...(currentDestination.coordinates || { lat: 0, lng: 0 }), lat }
                                                });
                                            }} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-charcoal/60">Longitude</label>
                                            <input type="number" step="0.0001" value={currentDestination.longitude || 0} onChange={(e) => {
                                                const lng = parseFloat(e.target.value);
                                                setCurrentDestination({
                                                    ...currentDestination,
                                                    longitude: lng,
                                                    coordinates: { ...(currentDestination.coordinates || { lat: 0, lng: 0 }), lng }
                                                });
                                            }} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <ImagePicker
                                                label="Card Thumbnail"
                                                value={currentDestination.image_url}
                                                onChange={(url) => setCurrentDestination({ ...currentDestination, image_url: url })}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <ImagePicker
                                                label="Hero Banner"
                                                value={currentDestination.hero_image}
                                                onChange={(url) => setCurrentDestination({ ...currentDestination, hero_image: url })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Content Tab */}
                            {activeTab === 'content' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-charcoal/60">Short Description</label>
                                        <textarea rows={4} value={currentDestination.description} onChange={(e) => setCurrentDestination({ ...currentDestination, description: e.target.value })} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-charcoal/60">Full Narrative (Long Description)</label>
                                        <textarea rows={12} value={currentDestination.long_description || ''} onChange={(e) => setCurrentDestination({ ...currentDestination, long_description: e.target.value })} className="w-full bg-white border border-charcoal/10 rounded-lg px-6 py-4 outline-none text-sm focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all" />
                                    </div>
                                </div>
                            )}

                            {/* Facts Tab */}
                            {activeTab === 'facts' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-charcoal/60">Altitude</label>
                                            <input type="text" value={currentDestination.altitude || ''} onChange={(e) => setCurrentDestination({ ...currentDestination, altitude: e.target.value })} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all" placeholder="e.g. 2,700m" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-charcoal/60">Distance from Major Hub</label>
                                            <input type="text" value={currentDestination.distance_from_major_hub || ''} onChange={(e) => setCurrentDestination({ ...currentDestination, distance_from_major_hub: e.target.value })} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all" placeholder="e.g. 230 km from Chandigarh" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Transport Tab */}
                            {activeTab === 'transport' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-lg font-serif font-bold text-charcoal">How to Reach</h4>
                                        <button
                                            onClick={() => setCurrentDestination({
                                                ...currentDestination,
                                                how_to_reach: [...(currentDestination.how_to_reach || []), { mode: 'Road', hub: '', distance: '', time: '', details: '' }]
                                            })}
                                            className="bg-forest text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-forest/90 transition-all shadow-md flex items-center gap-2"
                                        >
                                            <i className="fas fa-plus"></i> Add Mode
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {(currentDestination.how_to_reach || []).map((mode: any, idx: number) => (
                                            <div key={idx} className="bg-white p-6 rounded-xl border border-charcoal/10 shadow-sm">
                                                <div className="flex justify-between items-start mb-4">
                                                    <select
                                                        value={mode.mode}
                                                        onChange={(e) => {
                                                            const newModes = [...currentDestination.how_to_reach];
                                                            newModes[idx].mode = e.target.value;
                                                            setCurrentDestination({ ...currentDestination, how_to_reach: newModes });
                                                        }}
                                                        className="bg-charcoal/5 font-bold text-xs uppercase px-3 py-1.5 rounded-lg outline-none cursor-pointer"
                                                    >
                                                        <option value="Road">By Road</option>
                                                        <option value="Air">By Air</option>
                                                        <option value="Train">By Train</option>
                                                    </select>
                                                    <button onClick={() => setCurrentDestination({ ...currentDestination, how_to_reach: currentDestination.how_to_reach.filter((_: any, i: number) => i !== idx) })} className="text-red-400 hover:text-red-600 transition-colors"><i className="fas fa-trash"></i></button>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 mb-4">
                                                    <input type="text" placeholder="Hub (e.g. Chandigarh Airport)" value={mode.hub} onChange={(e) => { const n = [...currentDestination.how_to_reach]; n[idx].hub = e.target.value; setCurrentDestination({ ...currentDestination, how_to_reach: n }); }} className="bg-white border border-charcoal/10 rounded-lg px-4 py-2 text-xs outline-none focus:border-forest/30" />
                                                    <input type="text" placeholder="Distance (e.g. 250 km)" value={mode.distance} onChange={(e) => { const n = [...currentDestination.how_to_reach]; n[idx].distance = e.target.value; setCurrentDestination({ ...currentDestination, how_to_reach: n }); }} className="bg-white border border-charcoal/10 rounded-lg px-4 py-2 text-xs outline-none focus:border-forest/30" />
                                                    <input type="text" placeholder="Time (e.g. 7-8 hours)" value={mode.time} onChange={(e) => { const n = [...currentDestination.how_to_reach]; n[idx].time = e.target.value; setCurrentDestination({ ...currentDestination, how_to_reach: n }); }} className="bg-white border border-charcoal/10 rounded-lg px-4 py-2 text-xs outline-none focus:border-forest/30" />
                                                </div>
                                                <textarea placeholder="Route Details..." value={mode.details} onChange={(e) => { const n = [...currentDestination.how_to_reach]; n[idx].details = e.target.value; setCurrentDestination({ ...currentDestination, how_to_reach: n }); }} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 text-xs outline-none focus:border-forest/30" rows={2} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Guide Info Tab (Structured Editors) */}
                            {activeTab === 'guide' && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">

                                    {/* Best Time to Visit */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold uppercase text-charcoal/60">Seasonal Guides</label>
                                            <button
                                                onClick={() => setCurrentDestination({
                                                    ...currentDestination,
                                                    best_time_to_visit: [...(currentDestination.best_time_to_visit || []), { season: '', months: '', description: '' }]
                                                })}
                                                className="text-xs font-bold uppercase text-forest hover:bg-forest/10 px-3 py-1.5 rounded-lg transition-colors border border-forest/20"
                                            >
                                                + Add Season
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {(currentDestination.best_time_to_visit || []).map((item: any, idx: number) => (
                                                <div key={idx} className="bg-white p-5 rounded-xl border border-charcoal/10 flex gap-4 items-start shadow-sm">
                                                    <div className="flex-grow grid grid-cols-2 gap-4">
                                                        <input
                                                            type="text"
                                                            placeholder="Season (e.g. Summer)"
                                                            value={item.season}
                                                            onChange={(e) => {
                                                                const newItems = [...currentDestination.best_time_to_visit];
                                                                newItems[idx].season = e.target.value;
                                                                setCurrentDestination({ ...currentDestination, best_time_to_visit: newItems });
                                                            }}
                                                            className="bg-gray-50 border border-charcoal/10 rounded-lg px-4 py-2 text-xs font-bold outline-none focus:border-forest/30"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Months (e.g. Apr - Jun)"
                                                            value={item.months}
                                                            onChange={(e) => {
                                                                const newItems = [...currentDestination.best_time_to_visit];
                                                                newItems[idx].months = e.target.value;
                                                                setCurrentDestination({ ...currentDestination, best_time_to_visit: newItems });
                                                            }}
                                                            className="bg-gray-50 border border-charcoal/10 rounded-lg px-4 py-2 text-xs outline-none focus:border-forest/30"
                                                        />
                                                        <textarea
                                                            placeholder="Description of the season..."
                                                            value={item.description}
                                                            rows={2}
                                                            onChange={(e) => {
                                                                const newItems = [...currentDestination.best_time_to_visit];
                                                                newItems[idx].description = e.target.value;
                                                                setCurrentDestination({ ...currentDestination, best_time_to_visit: newItems });
                                                            }}
                                                            className="col-span-2 bg-gray-50 border border-charcoal/10 rounded-lg px-4 py-3 text-xs outline-none focus:border-forest/30"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newItems = currentDestination.best_time_to_visit.filter((_: any, i: number) => i !== idx);
                                                            setCurrentDestination({ ...currentDestination, best_time_to_visit: newItems });
                                                        }}
                                                        className="text-charcoal/20 hover:text-red-500 transition-colors p-2"
                                                    >
                                                        <i className="fas fa-trash-alt text-xs"></i>
                                                    </button>
                                                </div>
                                            ))}
                                            {(!currentDestination.best_time_to_visit || currentDestination.best_time_to_visit.length === 0) && (
                                                <div className="text-center py-8 bg-charcoal/5 rounded-xl text-xs text-charcoal/40 italic">No seasonal guides added.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Things To Do */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold uppercase text-charcoal/60">Experiences (Things to Do)</label>
                                            <button
                                                onClick={() => setCurrentDestination({
                                                    ...currentDestination,
                                                    things_to_do: [...(currentDestination.things_to_do || []), { title: '', description: '', imageUrl: '', category: '' }]
                                                })}
                                                className="text-xs font-bold uppercase text-forest hover:bg-forest/10 px-3 py-1.5 rounded-lg transition-colors border border-forest/20"
                                            >
                                                + Add Experience
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {(currentDestination.things_to_do || []).map((item: any, idx: number) => (
                                                <div key={idx} className="bg-white p-5 rounded-xl border border-charcoal/10 flex gap-4 items-start shadow-sm">
                                                    <div className="flex-grow space-y-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Experience Title"
                                                            value={item.title}
                                                            onChange={(e) => {
                                                                const newItems = [...currentDestination.things_to_do];
                                                                newItems[idx].title = e.target.value;
                                                                setCurrentDestination({ ...currentDestination, things_to_do: newItems });
                                                            }}
                                                            className="w-full bg-gray-50 border border-charcoal/10 rounded-lg px-4 py-2 text-xs font-bold outline-none focus:border-forest/30"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Category Tag (e.g. Adventure, Local Tour, Wellness)"
                                                            value={item.category || ''}
                                                            onChange={(e) => {
                                                                const newItems = [...currentDestination.things_to_do];
                                                                newItems[idx].category = e.target.value;
                                                                setCurrentDestination({ ...currentDestination, things_to_do: newItems });
                                                            }}
                                                            className="w-full bg-forest/5 border border-forest/10 rounded-lg px-4 py-2 text-xs outline-none text-forest placeholder:text-forest/40"
                                                        />
                                                        <textarea
                                                            placeholder="Description..."
                                                            value={item.description}
                                                            rows={2}
                                                            onChange={(e) => {
                                                                const newItems = [...currentDestination.things_to_do];
                                                                newItems[idx].description = e.target.value;
                                                                setCurrentDestination({ ...currentDestination, things_to_do: newItems });
                                                            }}
                                                            className="w-full bg-gray-50 border border-charcoal/10 rounded-lg px-4 py-3 text-xs outline-none focus:border-forest/30"
                                                        />
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-grow">
                                                                <ImagePicker
                                                                    label="Experience Image"
                                                                    value={item.imageUrl}
                                                                    onChange={(url) => {
                                                                        const newItems = [...currentDestination.things_to_do];
                                                                        newItems[idx].imageUrl = url;
                                                                        setCurrentDestination({ ...currentDestination, things_to_do: newItems });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newItems = currentDestination.things_to_do.filter((_: any, i: number) => i !== idx);
                                                            setCurrentDestination({ ...currentDestination, things_to_do: newItems });
                                                        }}
                                                        className="text-charcoal/20 hover:text-red-500 transition-colors p-2"
                                                    >
                                                        <i className="fas fa-trash-alt text-xs"></i>
                                                    </button>
                                                </div>
                                            ))}
                                            {(!currentDestination.things_to_do || currentDestination.things_to_do.length === 0) && (
                                                <div className="text-center py-8 bg-charcoal/5 rounded-xl text-xs text-charcoal/40 italic">No experiences added.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Travel Tips */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold uppercase text-charcoal/60">Travel Tips</label>
                                            <button
                                                onClick={() => setCurrentDestination({
                                                    ...currentDestination,
                                                    travel_tips: [...(currentDestination.travel_tips || []), '']
                                                })}
                                                className="text-xs font-bold uppercase text-forest hover:bg-forest/10 px-3 py-1.5 rounded-lg transition-colors border border-forest/20"
                                            >
                                                + Add Tip
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {(currentDestination.travel_tips || []).map((tip: string, idx: number) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <span className="text-xs font-bold text-charcoal/30 w-6 text-center">{idx + 1}.</span>
                                                    <input
                                                        type="text"
                                                        value={tip}
                                                        onChange={(e) => {
                                                            const newTips = [...currentDestination.travel_tips];
                                                            newTips[idx] = e.target.value;
                                                            setCurrentDestination({ ...currentDestination, travel_tips: newTips });
                                                        }}
                                                        className="flex-grow bg-white border border-charcoal/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-forest/20 transition-all font-medium"
                                                        placeholder="Enter travel tip..."
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newTips = currentDestination.travel_tips.filter((_: any, i: number) => i !== idx);
                                                            setCurrentDestination({ ...currentDestination, travel_tips: newTips });
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center text-charcoal/20 hover:text-red-500 transition-colors"
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            ))}
                                            {(!currentDestination.travel_tips || currentDestination.travel_tips.length === 0) && (
                                                <div className="text-center py-8 bg-charcoal/5 rounded-xl text-xs text-charcoal/40 italic">No travel tips added.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FAQs Tab */}
                            {activeTab === 'faqs' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-lg font-serif font-bold text-charcoal">Frequently Asked Questions</h4>
                                        <button
                                            onClick={() => setCurrentDestination({
                                                ...currentDestination,
                                                faqs: [...(currentDestination.faqs || []), { question: '', answer: '' }]
                                            })}
                                            className="bg-forest text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-forest/90 transition-all shadow-md flex items-center gap-2"
                                        >
                                            <i className="fas fa-plus"></i> Add Question
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {(currentDestination.faqs || []).map((faq: any, idx: number) => (
                                            <div key={idx} className="bg-white p-6 rounded-xl border border-charcoal/10 shadow-sm group hover:border-forest/20 transition-all">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal/30">Q.{idx + 1}</span>
                                                    <button
                                                        onClick={() => {
                                                            const newFaqs = currentDestination.faqs.filter((_: any, i: number) => i !== idx);
                                                            setCurrentDestination({ ...currentDestination, faqs: newFaqs });
                                                        }}
                                                        className="text-charcoal/20 hover:text-red-500 transition-colors"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Question?"
                                                        value={faq.question}
                                                        onChange={(e) => {
                                                            const newFaqs = [...currentDestination.faqs];
                                                            newFaqs[idx].question = e.target.value;
                                                            setCurrentDestination({ ...currentDestination, faqs: newFaqs });
                                                        }}
                                                        className="w-full text-base font-serif font-bold text-charcoal border-b border-dashed border-charcoal/20 pb-2 outline-none focus:border-forest transition-colors bg-transparent placeholder:text-charcoal/20"
                                                    />
                                                    <textarea
                                                        rows={3}
                                                        placeholder="Answer..."
                                                        value={faq.answer}
                                                        onChange={(e) => {
                                                            const newFaqs = [...currentDestination.faqs];
                                                            newFaqs[idx].answer = e.target.value;
                                                            setCurrentDestination({ ...currentDestination, faqs: newFaqs });
                                                        }}
                                                        className="w-full text-sm text-charcoal/80 bg-gray-50 rounded-lg p-4 outline-none focus:ring-1 focus:ring-forest/20 focus:border-forest transition-all"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {(!currentDestination.faqs || currentDestination.faqs.length === 0) && (
                                            <div className="text-center py-16 border-2 border-dashed border-charcoal/10 rounded-xl bg-gray-50/50">
                                                <div className="text-4xl text-charcoal/10 mb-4"><i className="fas fa-question-circle"></i></div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-charcoal/40">No FAQs yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Hotels Tab */}
                            {activeTab === 'hotels' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">

                                    {/* Section 1: Linked Hotels */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-serif font-bold text-charcoal">Linked Properties</h4>
                                            <span className="text-xs font-bold uppercase tracking-wider text-charcoal/40 bg-charcoal/5 px-3 py-1 rounded-full">{linkedHotels.length} hotel{linkedHotels.length !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="space-y-3">
                                            {linkedHotels.map(hotel => (
                                                <div key={hotel.id} className="bg-white p-5 rounded-xl border border-charcoal/10 flex items-center justify-between shadow-sm group hover:border-forest/20 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                            <img src={hotel.hero_image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=100'} className="w-full h-full object-cover" alt="" />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold text-sm text-charcoal">{hotel.name}</h5>
                                                            <p className="text-xs text-charcoal/40 mt-0.5">{hotel.location_name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs uppercase font-bold text-forest bg-forest/5 px-3 py-1 rounded-full">Linked</span>
                                                        <button
                                                            onClick={() => unlinkHotel(hotel.id)}
                                                            title="Unlink hotel"
                                                            className="w-7 h-7 rounded-full border border-red-100 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <i className="fas fa-times text-[10px]"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {linkedHotels.length === 0 && (
                                                <div className="text-center py-8 border-2 border-dashed border-charcoal/10 rounded-xl">
                                                    <div className="text-3xl text-charcoal/10 mb-2"><i className="fas fa-hotel"></i></div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-charcoal/30">No hotels linked yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Section 2: Link a Hotel */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-serif font-bold text-charcoal">Link a Hotel</h4>
                                        </div>
                                        <div className="relative mb-4">
                                            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/20 text-xs"></i>
                                            <input
                                                type="text"
                                                placeholder="Search hotels by name or location..."
                                                value={hotelSearchQuery}
                                                onChange={(e) => setHotelSearchQuery(e.target.value)}
                                                className="w-full bg-white border border-charcoal/10 rounded-lg pl-10 pr-4 py-2.5 outline-none text-xs focus:border-forest/30 transition-all"
                                            />
                                        </div>
                                        {loadingAllHotels ? (
                                            <div className="space-y-3">
                                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-charcoal/5" />)}
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                                                {allHotels
                                                    .filter(h =>
                                                        h.destination_slug !== currentDestination.slug &&
                                                        (hotelSearchQuery === '' ||
                                                            h.name.toLowerCase().includes(hotelSearchQuery.toLowerCase()) ||
                                                            (h.location_name || '').toLowerCase().includes(hotelSearchQuery.toLowerCase())
                                                        )
                                                    )
                                                    .map(hotel => (
                                                        <div key={hotel.id} className="bg-white p-4 rounded-2xl border border-charcoal/5 flex items-center justify-between hover:border-forest/20 hover:shadow-sm transition-all group">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                                    <img src={hotel.hero_image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=100'} className="w-full h-full object-cover" alt="" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-sm text-charcoal">{hotel.name}</p>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <p className="text-[9px] text-charcoal/40">{hotel.location_name}</p>
                                                                        {hotel.destination_slug && (
                                                                            <span className="text-[8px] font-bold uppercase bg-amber-50 text-amber-500 border border-amber-100 px-1.5 py-0.5 rounded-full">
                                                                                in {hotel.destination_slug}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => linkHotel(hotel.id)}
                                                                className="text-[9px] font-bold uppercase tracking-widest text-forest border border-forest/20 bg-forest/5 hover:bg-forest hover:text-white px-4 py-2 rounded-full transition-all"
                                                            >
                                                                + Link
                                                            </button>
                                                        </div>
                                                    ))
                                                }
                                                {allHotels.filter(h =>
                                                    h.destination_slug !== currentDestination.slug &&
                                                    (hotelSearchQuery === '' ||
                                                        h.name.toLowerCase().includes(hotelSearchQuery.toLowerCase()) ||
                                                        (h.location_name || '').toLowerCase().includes(hotelSearchQuery.toLowerCase())
                                                    )
                                                ).length === 0 && (
                                                        <div className="text-center py-8 text-[10px] text-charcoal/30 italic">
                                                            {hotelSearchQuery ? `No hotels matching "${hotelSearchQuery}"` : 'All hotels are already linked to a destination.'}
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            )}

                            {/* Gallery Tab */}
                            {activeTab === 'gallery' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-lg font-serif font-bold text-charcoal">Destination Photos</h4>
                                        <button
                                            onClick={() => setShowGallerySelector(true)}
                                            className="bg-forest text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-forest/90 transition-all shadow-md flex items-center gap-2"
                                        >
                                            <i className="fas fa-plus"></i> Add Photos
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {destinationImages.map((img, idx) => (
                                            <div key={idx} className="group relative bg-white rounded-xl overflow-hidden border border-charcoal/10 shadow-sm hover:shadow-lg transition-all flex flex-col">
                                                <div className="relative aspect-square overflow-hidden">
                                                    <img src={img.image_url} className="w-full h-full object-cover" alt="" />
                                                    <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => {
                                                                const newImages = [...destinationImages];
                                                                if (idx > 0) {
                                                                    [newImages[idx], newImages[idx - 1]] = [newImages[idx - 1], newImages[idx]];
                                                                    setDestinationImages(newImages);
                                                                }
                                                            }}
                                                            className="w-8 h-8 rounded-full bg-white text-charcoal hover:bg-forest hover:text-white transition-all flex items-center justify-center shadow-lg"
                                                        >
                                                            <i className="fas fa-chevron-left"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => setDestinationImages(destinationImages.filter((_, i) => i !== idx))}
                                                            className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-lg"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const newImages = [...destinationImages];
                                                                if (idx < destinationImages.length - 1) {
                                                                    [newImages[idx], newImages[idx + 1]] = [newImages[idx + 1], newImages[idx]];
                                                                    setDestinationImages(newImages);
                                                                }
                                                            }}
                                                            className="w-8 h-8 rounded-full bg-white text-charcoal hover:bg-forest hover:text-white transition-all flex items-center justify-center shadow-lg"
                                                        >
                                                            <i className="fas fa-chevron-right"></i>
                                                        </button>
                                                    </div>
                                                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-charcoal shadow-sm">
                                                        #{idx + 1}
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-white border-t border-charcoal/10">
                                                    <input
                                                        type="text"
                                                        placeholder="Add Tag (e.g. Landscape)"
                                                        value={img.tags || ''}
                                                        onChange={(e) => {
                                                            const newImages = [...destinationImages];
                                                            newImages[idx].tags = e.target.value;
                                                            setDestinationImages(newImages);
                                                        }}
                                                        className="w-full text-xs font-bold uppercase tracking-wider text-charcoal border-none outline-none bg-transparent placeholder:text-charcoal/20"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {destinationImages.length === 0 && (
                                            <div className="col-span-full py-20 bg-white rounded-xl border-2 border-dashed border-charcoal/10 flex flex-col items-center justify-center text-charcoal/20">
                                                <i className="fas fa-images text-5xl mb-4"></i>
                                                <p className="text-xs font-bold uppercase tracking-wider">No photos added yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* SEO Tab */}
                            {activeTab === 'seo' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-charcoal/60">Meta Title</label>
                                        <input
                                            type="text"
                                            value={currentDestination.meta_title || ''}
                                            onChange={(e) => setCurrentDestination({ ...currentDestination, meta_title: e.target.value })}
                                            className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm font-medium focus:border-forest/30 transition-all font-serif"
                                            placeholder="e.g. Visit Spiti Valley | Escape Stayz"
                                        />
                                        <p className="text-[10px] text-charcoal/40 text-right font-bold">{currentDestination.meta_title?.length || 0}/60 characters</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-charcoal/60">Meta Description</label>
                                        <textarea
                                            rows={4}
                                            value={currentDestination.meta_description || ''}
                                            onChange={(e) => setCurrentDestination({ ...currentDestination, meta_description: e.target.value })}
                                            className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm focus:border-forest/30 transition-all"
                                            placeholder="e.g. Plan your trip to Spiti..."
                                        />
                                        <p className="text-[10px] text-charcoal/40 text-right font-bold">{currentDestination.meta_description?.length || 0}/160 characters</p>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

            {showGallerySelector && (
                <GallerySelector
                    onClose={() => setShowGallerySelector(false)}
                    onSelect={(assets) => {
                        const newImages = assets.map(a => ({
                            image_url: a.public_url,
                            alt_text: a.alt_text || a.title || '',
                            display_order: destinationImages.length,
                            tags: '' // GalleryImage doesn't have tags in its interface
                        }));
                        setDestinationImages([...destinationImages, ...newImages]);
                        setShowGallerySelector(false);
                    }}
                />
            )}

            <style>{`
                .scale-in-center { animation: scale-in-center 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
                @keyframes scale-in-center { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
            `}</style>
        </>
    );
}
