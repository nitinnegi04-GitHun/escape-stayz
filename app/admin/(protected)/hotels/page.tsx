
'use client';

import React, { useEffect, useState } from 'react';
import { GallerySelector } from '../../../../components/Admin/GallerySelector';
import { supabase } from '../../../../lib/supabase';
import { getHotels } from '../../../../lib/queries';
import { HOTEL_ICON_MAP } from '../../../../components/Admin/hotelIcons';
import { IconPicker } from '../../../../components/Admin/IconPicker';
import { ImagePicker } from '../../../../components/Admin/ImagePicker';

interface Highlight {
    icon: string;
    text: string;
}

interface HotelEntry {
    id?: string;
    name: string;
    slug: string;
    location_name: string;
    short_description: string;
    full_description: string;
    featured: boolean;
    latitude: number;
    longitude: number;
    meta_title: string;
    meta_description: string;
    destination_slug?: string;
    highlights?: Highlight[];
    google_maps_embed_url?: string;
    thumbnail_image?: string;
}

interface Room {
    id?: string;
    hotel_id?: string;
    name: string;
    slug: string;
    description: string;
    price_per_night: number;
    max_guests: string;
    room_size: string;
    sleeping_arrangements?: string[];
}

interface Amenity {
    id: string;
    name: string;
    icon: string;
}

interface GalleryAsset {
    id?: string;
    hotel_id?: string;
    image_url: string;
    title?: string;
    alt_text?: string;
    display_order?: number;
    tags?: string;
}

export default function AdminHotelsPage() {
    const [hotels, setHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentHotel, setCurrentHotel] = useState<HotelEntry | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Destinations State
    const [destinations, setDestinations] = useState<{ slug: string; name: string }[]>([]);

    // Amenities State
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [activeAmenities, setActiveAmenities] = useState<string[]>([]);
    const [loadingAmenities, setLoadingAmenities] = useState(false);

    // Rooms State
    const [activeTab, setActiveTab] = useState<'general' | 'content' | 'highlights' | 'amenities' | 'rooms' | 'gallery' | 'faqs' | 'seo'>('general');
    const [activeHighlightIdx, setActiveHighlightIdx] = useState<number | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    interface RoomImage {
        id?: string;
        room_id?: string;
        image_url: string;
        alt_text?: string;
        display_order?: number;
        tags?: string;
    }

    // Gallery State
    const [hotelImages, setHotelImages] = useState<GalleryAsset[]>([]);
    const [showGallerySelector, setShowGallerySelector] = useState(false);

    // Room Gallery State
    const [roomImages, setRoomImages] = useState<RoomImage[]>([]);
    const [showRoomGallerySelector, setShowRoomGallerySelector] = useState(false);
    const [activeRoomTab, setActiveRoomTab] = useState<'details' | 'amenities' | 'gallery'>('details');

    // Room Amenities
    const [activeRoomAmenities, setActiveRoomAmenities] = useState<string[]>([]);
    const [loadingRoomAmenities, setLoadingRoomAmenities] = useState(false);

    // FAQs State
    interface Faq {
        id?: string;
        question: string;
        answer: string;
    }
    const [faqs, setFaqs] = useState<Faq[]>([]);

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const data = await getHotels(100);
            setHotels(data || []);
        } catch (err) {
            console.error("Fetch Hotels Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHotels();
        fetchMasterAmenities();
        fetchDestinations();
    }, []);

    const fetchMasterAmenities = async () => {
        const { data } = await supabase.from('amenities').select('*').order('name');
        setAmenities(data || []);
    };

    const fetchDestinations = async () => {
        const { data } = await supabase.from('destinations').select('slug, name').order('name');
        setDestinations(data || []);
    };

    const fetchHotelAmenities = async (hotelId: string) => {
        setLoadingAmenities(true);
        const { data } = await supabase.from('hotel_amenities').select('amenity_id').eq('hotel_id', hotelId);
        if (data) {
            setActiveAmenities(data.map(a => a.amenity_id));
        } else {
            setActiveAmenities([]);
        }
        setLoadingAmenities(false);
    };

    const fetchRooms = async (hotelId: string) => {
        const { data } = await supabase.from('rooms').select('*').eq('hotel_id', hotelId).order('name');
        setRooms(data || []);
    };

    const fetchHotelImages = async (hotelId: string) => {
        const { data } = await supabase.from('hotel_images').select('*').eq('hotel_id', hotelId).order('display_order');
        // Map to GalleryAsset
        if (data) {
            setHotelImages(data.map(img => ({
                id: img.id,
                hotel_id: img.hotel_id,
                image_url: img.image_url,
                title: img.title || '',
                alt_text: img.alt_text,
                display_order: img.display_order,
                tags: img.tags || ''
            })));
        } else {
            setHotelImages([]);
        }
    };

    const fetchFaqs = async (hotelId: string) => {
        const { data } = await supabase.from('faqs').select('*').eq('hotel_id', hotelId).order('display_order');
        if (data) {
            setFaqs(data.map(f => ({
                id: f.id,
                question: f.question,
                answer: f.answer
            })));
        } else {
            setFaqs([]);
        }
    };

    const fetchRoomImages = async (roomId: string) => {
        const { data } = await supabase.from('room_images').select('*').eq('room_id', roomId).order('display_order');
        if (data) {
            setRoomImages(data.map(img => ({
                id: img.id,
                room_id: img.room_id,
                image_url: img.image_url,
                alt_text: img.alt_text,
                display_order: img.display_order,
                tags: img.tags || ''
            })));
        } else {
            setRoomImages([]);
        }
    };

    const fetchRoomAmenities = async (roomId: string) => {
        setLoadingRoomAmenities(true);
        const { data } = await supabase.from('room_amenities').select('amenity_id').eq('room_id', roomId);
        if (data) {
            setActiveRoomAmenities(data.map(a => a.amenity_id));
        } else {
            setActiveRoomAmenities([]);
        }
        setLoadingRoomAmenities(false);
    };

    const saveRoom = async () => {
        if (!editingRoom || !currentHotel?.id) return;
        try {
            // Strip out relational fields and non-column fields before upsert
            const { room_amenities, images, sleeping_arrangements, ...roomData } = editingRoom as any;
            const payload = { ...roomData, hotel_id: currentHotel.id };
            if (!payload.id) delete payload.id;

            const { data: savedRoom, error } = await supabase
                .from('rooms')
                .upsert(payload)
                .select()
                .single();

            if (error) throw error;

            // Save Room Images
            const roomId = savedRoom.id;

            // Delete existing images
            await supabase.from('room_images').delete().eq('room_id', roomId);

            // Insert new images
            if (roomImages.length > 0) {
                const imageInserts = roomImages.map((img, index) => ({
                    room_id: roomId,
                    image_url: img.image_url,
                    alt_text: img.alt_text || '',
                    display_order: index,
                    tags: img.tags || null
                }));
                const { error: imgError } = await supabase.from('room_images').insert(imageInserts);
                if (imgError) {
                    console.error("Room Gallery sync failed:", imgError);
                    alert(`Room saved, but image sync failed: ${imgError.message}`);
                }
            }

            // Sync Room Amenities
            // 1. Delete existing
            await supabase.from('room_amenities').delete().eq('room_id', roomId);

            // 2. Insert new
            if (activeRoomAmenities.length > 0) {
                const amenityInserts = activeRoomAmenities.map(amenityId => ({
                    room_id: roomId,
                    amenity_id: amenityId
                }));
                const { error: amError } = await supabase.from('room_amenities').insert(amenityInserts);
                if (amError) console.warn("Room Amenities sync failed:", amError.message);
            }

            setEditingRoom(null);
            setRoomImages([]);
            setActiveRoomAmenities([]);
            fetchRooms(currentHotel.id);
            alert("Room saved successfully!");
        } catch (err: any) {
            alert(`Error saving room: ${err.message}`);
        }
    };

    const toggleRoomAmenity = (amenityId: string) => {
        setActiveRoomAmenities(prev =>
            prev.includes(amenityId)
                ? prev.filter(id => id !== amenityId)
                : [...prev, amenityId]
        );
    };

    const handleDuplicateRoom = async (room: Room) => {
        if (!currentHotel?.id || !room.id) return;

        if (!confirm(`Are you sure you want to duplicate "${room.name}"?`)) return;

        try {
            // 1. Fetch source data (Images & Amenities)
            const { data: sourceImages } = await supabase.from('room_images').select('*').eq('room_id', room.id);
            const { data: sourceAmenities } = await supabase.from('room_amenities').select('amenity_id').eq('room_id', room.id);

            // 2. Create New Room
            const newRoomPayload = {
                ...room,
                id: undefined, // Let Supabase generate a new ID
                name: `${room.name} (Copy)`,
                slug: `${room.slug}-copy-${Math.floor(Math.random() * 1000)}`,
                hotel_id: currentHotel.id,
                created_at: new Date().toISOString()
            };

            const { data: newRoom, error: roomError } = await supabase
                .from('rooms')
                .insert(newRoomPayload)
                .select()
                .single();

            if (roomError) throw roomError;

            // 3. Duplicate Images
            if (sourceImages && sourceImages.length > 0) {
                const imageInserts = sourceImages.map(img => ({
                    room_id: newRoom.id,
                    image_url: img.image_url,
                    alt_text: img.alt_text,
                    display_order: img.display_order,
                    tags: img.tags
                }));
                const { error: imgError } = await supabase.from('room_images').insert(imageInserts);
                if (imgError) console.error("Duplicated Room Gallery sync failed:", imgError);
            }

            // 4. Duplicate Amenities
            if (sourceAmenities && sourceAmenities.length > 0) {
                const amenityInserts = sourceAmenities.map(am => ({
                    room_id: newRoom.id,
                    amenity_id: am.amenity_id
                }));
                const { error: amError } = await supabase.from('room_amenities').insert(amenityInserts);
                if (amError) console.warn("Duplicated Room Amenities sync failed:", amError.message);
            }

            fetchRooms(currentHotel.id);
            alert("Room duplicated successfully!");
        } catch (err: any) {
            alert(`Error duplicating room: ${err.message}`);
        }
    };

    const deleteRoom = async (roomId: string) => {
        if (!confirm("Delete this room?")) return;
        try {
            // Delete room images
            await supabase.from('room_images').delete().eq('room_id', roomId);

            const { error } = await supabase.from('rooms').delete().eq('id', roomId);
            if (error) throw error;
            if (currentHotel?.id) fetchRooms(currentHotel.id);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const toggleAmenity = (amenityId: string) => {
        setActiveAmenities(prev =>
            prev.includes(amenityId)
                ? prev.filter(id => id !== amenityId)
                : [...prev, amenityId]
        );
    };

    const handleEdit = (hotel: any, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const dbColumns = [
            'id', 'name', 'slug', 'location_name', 'short_description',
            'full_description', 'featured', 'highlights',
            'latitude', 'longitude', 'meta_title', 'meta_description',
            'destination_slug', 'google_maps_embed_url', 'thumbnail_image'
        ];

        const sanitized = Object.fromEntries(
            Object.entries(hotel).filter(([key]) => dbColumns.includes(key))
        ) as unknown as HotelEntry;

        setCurrentHotel({ ...sanitized, highlights: sanitized.highlights ?? [] });
        fetchHotelAmenities(hotel.id);
        fetchRooms(hotel.id);
        fetchHotelImages(hotel.id);
        fetchFaqs(hotel.id);
        setActiveTab('general');
        setIsEditorOpen(true);
    };

    const handleNew = () => {
        setCurrentHotel({
            name: '',
            slug: '',
            location_name: '',
            short_description: '',
            full_description: '',

            featured: false,
            latitude: 31.45,
            longitude: 78.25,
            meta_title: '',
            meta_description: '',
            google_maps_embed_url: '',
            highlights: [],
            thumbnail_image: ''
        });
        setActiveAmenities([]);
        setRooms([]);
        setHotelImages([]);
        setFaqs([]);
        setActiveTab('general');
        setIsEditorOpen(true);
    };

    const saveHotel = async () => {
        if (!currentHotel) return;
        setIsSaving(true);

        try {
            const dbColumns = [
                'id', 'name', 'slug', 'location_name', 'short_description',
                'full_description', 'featured', 'highlights',
                'latitude', 'longitude', 'meta_title', 'meta_description',
                'destination_slug', 'google_maps_embed_url', 'thumbnail_image'
            ];

            const savePayload = Object.fromEntries(
                Object.entries(currentHotel).filter(([key, val]) => dbColumns.includes(key) && val !== undefined)
            );

            // Always include highlights, google_maps_embed_url, and thumbnail_image explicitly
            savePayload.highlights = currentHotel.highlights ?? null;
            savePayload.google_maps_embed_url = currentHotel.google_maps_embed_url || null;
            savePayload.thumbnail_image = currentHotel.thumbnail_image || null;

            if (!savePayload.id) delete savePayload.id;

            const { data: savedHotel, error: saveError } = await supabase
                .from('hotels')
                .upsert(savePayload, { onConflict: 'id' })
                .select()
                .single();

            if (saveError) throw saveError;

            const hotelId = savedHotel.id;

            // Sync Amenities
            // 1. Delete existing
            await supabase.from('hotel_amenities').delete().eq('hotel_id', hotelId);

            // 2. Insert new
            if (activeAmenities.length > 0) {
                const amenityInserts = activeAmenities.map(amenityId => ({
                    hotel_id: hotelId,
                    amenity_id: amenityId
                }));
                const { error: amError } = await supabase.from('hotel_amenities').insert(amenityInserts);
                if (amError) console.warn("Amenities sync failed:", amError.message);
            }

            // Sync Gallery Images
            // Delete existing
            await supabase.from('hotel_images').delete().eq('hotel_id', hotelId);

            // Insert new
            if (hotelImages.length > 0) {
                const imageInserts = hotelImages.map((img, index) => ({
                    hotel_id: hotelId,
                    image_url: img.image_url,
                    alt_text: img.alt_text || img.title || '',
                    display_order: index,
                    tags: img.tags || null
                }));
                const { error: imgError } = await supabase.from('hotel_images').insert(imageInserts);
                if (imgError) console.warn("Gallery sync failed:", imgError.message);
            }

            // Sync FAQs
            // Delete existing
            await supabase.from('faqs').delete().eq('hotel_id', hotelId);

            // Insert new
            if (faqs.length > 0) {
                const faqInserts = faqs.map((f, index) => ({
                    hotel_id: hotelId,
                    question: f.question,
                    answer: f.answer,
                    display_order: index
                }));
                const { error: faqError } = await supabase.from('faqs').insert(faqInserts);
                if (faqError) console.warn("FAQs sync failed:", faqError.message);
            }

            setIsEditorOpen(false);
            fetchHotels();
        } catch (err: any) {
            console.error("Save Error:", err);
            alert(`Database Error: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const deleteHotel = async (id: string, name: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm(`Permanently remove "${name}" and all associated data?`)) return;

        setLoading(true);
        try {
            // 1. CLEAR CHILDREN (Foreign Key Protection)
            console.log("Purging child dependencies for hotel:", id);

            // Delete rooms
            const { error: roomErr } = await supabase.from('rooms').delete().eq('hotel_id', id);
            if (roomErr) console.warn("Notice: Room clearing skipped or blocked.", roomErr.message);

            // Delete images
            const { error: imgErr } = await supabase.from('hotel_images').delete().eq('hotel_id', id);
            if (imgErr) console.warn("Notice: Image clearing skipped.", imgErr.message);

            // Delete amenities
            const { error: amErr } = await supabase.from('hotel_amenities').delete().eq('hotel_id', id);
            if (amErr) console.warn("Notice: Amenity clearing skipped.", amErr.message);

            // 2. DELETE PARENT
            const { error, status } = await supabase.from('hotels').delete().eq('id', id);

            if (error) {
                throw new Error(`[DB ERROR ${error.code}] ${error.message}`);
            }

            console.log("Hotel successfully purged from database. Status:", status);
            fetchHotels();
            alert(`"${name}" successfully deleted.`);
        } catch (err: any) {
            console.error("Delete Pipeline Failure:", err);
            alert(`CRITICAL ERROR:\n\n${err.message}\n\nThis is usually caused by database permissions (RLS) or unhandled child records.`);
        } finally {
            setLoading(false);
        }
    };

    const toggleFeatured = async (id: string, current: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        await supabase.from('hotels').update({ featured: !current }).eq('id', id);
        fetchHotels();
    };

    return (
        <>
            <div className="bg-white rounded-3xl shadow-sm border border-charcoal/5 overflow-hidden">
                <div className="p-6 border-b border-charcoal/5 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h3 className="text-lg font-serif italic">Property Registry</h3>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/30 mt-1">{hotels.length} Properties Cataloged</p>
                    </div>
                    <button onClick={handleNew} className="bg-forest text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-forest/20 hover:scale-105 transition-all">
                        + Register Property
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#f8f9fa] border-b border-charcoal/5">
                                <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-charcoal/40">Property</th>
                                <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-charcoal/40">Location</th>
                                <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-charcoal/40">Status</th>
                                <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-charcoal/40 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal/5">
                            {loading ? (
                                [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="px-10 py-8 h-20 bg-white"></td></tr>)
                            ) : hotels.map((hotel) => (
                                <tr key={hotel.id} className="hover:bg-[#f8f9fa] transition-colors group">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-charcoal/5 flex-shrink-0">
                                                <img src={hotel.hero_image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=100'} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div className="truncate max-w-[200px]">
                                                <p className="text-sm font-bold text-charcoal truncate">{hotel.name}</p>
                                                <p className="text-[9px] text-charcoal/30 uppercase tracking-widest">/{hotel.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3"><span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/50">{hotel.location_name}</span></td>
                                    <td className="px-6 py-3">
                                        <button onClick={(e) => toggleFeatured(hotel.id, hotel.featured, e)} className={`px-4 py-1 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] border transition-all ${hotel.featured ? 'bg-forest/10 border-forest/20 text-forest' : 'bg-charcoal/5 border-charcoal/10 text-charcoal/30'}`}>{hotel.featured ? 'Featured' : 'Standard'}</button>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2 pointer-events-auto">
                                            <button onClick={(e) => handleEdit(hotel, e)} className="w-8 h-8 rounded-lg border border-charcoal/5 flex items-center justify-center text-charcoal/20 hover:text-forest hover:bg-forest/5 transition-all z-[100]"><i className="fas fa-pen-nib text-[10px]"></i></button>
                                            <button onClick={(e) => deleteHotel(hotel.id, hotel.name, e)} className="w-8 h-8 rounded-lg border border-charcoal/5 flex items-center justify-center text-charcoal/20 hover:text-red-500 hover:bg-red-50 transition-all z-[100]"><i className="fas fa-trash-can text-[10px]"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isEditorOpen && currentHotel && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-md" onClick={() => setIsEditorOpen(false)}></div>
                    <div className="bg-white w-full max-w-5xl h-[90vh] rounded-xl relative z-10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-charcoal/10 flex justify-between items-center bg-white sticky top-0 z-20">
                            <div>
                                <h3 className="text-xl font-serif font-bold text-charcoal">{currentHotel.name || 'New Property'}</h3>
                                <div className="flex gap-6 mt-4">
                                    {['general', 'content', 'highlights', 'amenities', 'rooms', 'gallery', 'faqs', 'seo'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab as any)}
                                            className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-all ${activeTab === tab ? 'border-forest text-forest' : 'border-transparent text-charcoal/40 hover:text-charcoal'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setIsEditorOpen(false)} className="px-4 py-2 rounded-lg text-xs font-bold uppercase text-charcoal/60 hover:bg-gray-100 transition-colors">Discard</button>
                                <button onClick={saveHotel} disabled={isSaving} className="bg-forest text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-forest/90 transition-all">{isSaving ? 'Saving...' : 'Save Hotel'}</button>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar bg-gray-50/50">

                            {activeTab === 'general' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-charcoal/60">Property Name</label>
                                            <input type="text" value={currentHotel.name} onChange={(e) => {
                                                const name = e.target.value;
                                                const updates: any = { name };
                                                if (!currentHotel.id) updates.slug = name.toLowerCase().replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-');
                                                setCurrentHotel({ ...currentHotel, ...updates });
                                            }} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm font-medium focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-charcoal/60">URL Slug</label>
                                            <input type="text" value={currentHotel.slug} onChange={(e) => setCurrentHotel({ ...currentHotel, slug: e.target.value })} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm font-mono text-charcoal/80 focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-charcoal/60">Location</label>
                                            <input type="text" value={currentHotel.location_name} onChange={(e) => setCurrentHotel({ ...currentHotel, location_name: e.target.value })} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-charcoal/60">Destination</label>
                                            <select
                                                value={currentHotel.destination_slug || ''}
                                                onChange={(e) => setCurrentHotel({ ...currentHotel, destination_slug: e.target.value || undefined })}
                                                className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all"
                                            >
                                                <option value="">— None —</option>
                                                {destinations.map(d => (
                                                    <option key={d.slug} value={d.slug}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-charcoal/60">Latitude</label>
                                            <input type="number" step="0.0001" value={currentHotel.latitude} onChange={(e) => setCurrentHotel({ ...currentHotel, latitude: parseFloat(e.target.value) })} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm font-mono focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all" placeholder="e.g. 31.1048" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-charcoal/60">Longitude</label>
                                            <input type="number" step="0.0001" value={currentHotel.longitude} onChange={(e) => setCurrentHotel({ ...currentHotel, longitude: parseFloat(e.target.value) })} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm font-mono focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all" placeholder="e.g. 77.1734" />
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <label className="text-xs font-bold uppercase text-charcoal/60">Google Maps Embed</label>
                                            <p className="text-[10px] text-charcoal/40">In Google Maps, click Share → Embed a map → Copy the full iframe code or just the src URL and paste here.</p>
                                            <textarea
                                                rows={3}
                                                value={currentHotel.google_maps_embed_url || ''}
                                                onChange={(e) => {
                                                    const raw = e.target.value.trim();
                                                    // Extract src URL if full iframe code is pasted
                                                    const match = raw.match(/src=["']([^"']+)["']/);
                                                    setCurrentHotel({ ...currentHotel, google_maps_embed_url: match ? match[1] : raw });
                                                }}
                                                className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm font-mono text-charcoal/80 focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all resize-none"
                                                placeholder='Paste <iframe ...> embed code or the src URL from Google Maps'
                                            />
                                            {currentHotel.google_maps_embed_url && (
                                                <p className="text-[10px] text-forest/60 font-mono truncate">✓ {currentHotel.google_maps_embed_url}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Thumbnail Image */}
                                    <ImagePicker
                                        label="Thumbnail Image (shown on Property Cards)"
                                        value={currentHotel.thumbnail_image || ''}
                                        onChange={(url) => setCurrentHotel({ ...currentHotel, thumbnail_image: url })}
                                    />

                                    <div className="flex items-center justify-between p-5 bg-white rounded-xl border border-charcoal/10">
                                        <div>
                                            <p className="text-sm font-bold text-charcoal">Featured Property</p>
                                            <p className="text-xs text-charcoal/40 mt-0.5">Show this property in featured sections on the homepage</p>
                                        </div>
                                        <button
                                            onClick={() => setCurrentHotel({ ...currentHotel, featured: !currentHotel.featured })}
                                            className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none ${currentHotel.featured ? 'bg-forest' : 'bg-charcoal/20'}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${currentHotel.featured ? 'translate-x-7' : 'translate-x-0'}`}></span>
                                        </button>
                                    </div>

                                </div>
                            )}

                            {activeTab === 'content' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-charcoal/60">Short Description (Card View)</label>
                                        <textarea rows={3} value={currentHotel.short_description} onChange={(e) => setCurrentHotel({ ...currentHotel, short_description: e.target.value })} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-charcoal/60">Full Narrative (Detail Page)</label>
                                        <textarea rows={15} value={currentHotel.full_description} onChange={(e) => setCurrentHotel({ ...currentHotel, full_description: e.target.value })} className="w-full bg-white border border-charcoal/10 rounded-lg px-6 py-5 outline-none text-sm leading-relaxed focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'amenities' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {amenities.map(amenity => (
                                            <button
                                                key={amenity.id}
                                                onClick={() => toggleAmenity(amenity.id)}
                                                className={`p-4 rounded-lg border flex items-center gap-3 transition-all text-left ${activeAmenities.includes(amenity.id)
                                                    ? 'bg-forest/5 border-forest/30 text-forest shadow-sm'
                                                    : 'bg-white border-charcoal/10 text-charcoal/60 hover:border-charcoal/30 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {(() => { const IC = HOTEL_ICON_MAP[amenity.icon]; return IC ? <IC size={18} /> : <span className="text-xs">?</span>; })()}
                                                <span className="text-xs font-bold uppercase tracking-wider">{amenity.name}</span>
                                                {activeAmenities.includes(amenity.id) && (
                                                    <i className="fas fa-check ml-auto text-xs text-forest"></i>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'rooms' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {!currentHotel.id ? (
                                        <div className="text-center py-20 text-charcoal/40 bg-gray-100 rounded-xl border-2 border-dashed border-charcoal/10">Please save the hotel first to manage rooms.</div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center mb-6">
                                                <h4 className="text-lg font-serif font-bold text-charcoal">Room Configurations</h4>
                                                <button
                                                    onClick={() => {
                                                        setEditingRoom({
                                                            name: '', slug: '', description: '',
                                                            price_per_night: 0, max_guests: "2", room_size: '',
                                                            sleeping_arrangements: []
                                                        });
                                                        setRoomImages([]);
                                                        setActiveRoomAmenities([]);
                                                        setActiveRoomTab('details');
                                                    }}
                                                    className="bg-charcoal text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-charcoal/90 transition-all"
                                                >
                                                    + Add Room
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {rooms.map(room => (
                                                    <div key={room.id} className="bg-white p-5 rounded-lg border border-charcoal/10 flex justify-between items-center hover:shadow-md transition-all">
                                                        <div>
                                                            <div className="flex items-center gap-3">
                                                                <h5 className="font-bold text-charcoal text-sm">{room.name}</h5>
                                                                <span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 rounded text-charcoal/60">{room.room_size}</span>
                                                            </div>
                                                            <p className="text-xs text-charcoal/50 mt-1">{room.max_guests} Guests • <span className="font-mono text-forest font-bold">₹{room.price_per_night}</span>/night</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleDuplicateRoom(room)}
                                                                title="Duplicate Room"
                                                                className="w-8 h-8 rounded-lg border border-charcoal/10 text-terracotta hover:bg-terracotta hover:text-white hover:border-terracotta flex items-center justify-center transition-all"
                                                            >
                                                                <i className="fas fa-copy text-xs"></i>
                                                            </button>
                                                            <button onClick={() => {
                                                                setEditingRoom(room);
                                                                if (room.id) {
                                                                    fetchRoomImages(room.id);
                                                                    fetchRoomAmenities(room.id);
                                                                }
                                                                setActiveRoomTab('details');
                                                            }} className="w-8 h-8 rounded-lg border border-charcoal/10 text-charcoal/40 hover:bg-forest hover:text-white hover:border-forest flex items-center justify-center transition-all"><i className="fas fa-pen text-xs"></i></button>
                                                            <button onClick={() => room.id && deleteRoom(room.id)} className="w-8 h-8 rounded-lg border border-red-100 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 flex items-center justify-center transition-all"><i className="fas fa-trash text-xs"></i></button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {rooms.length === 0 && <div className="text-center py-12 text-charcoal/40 text-sm bg-gray-50 rounded-lg border border-dashed border-charcoal/10">No rooms configured yet.</div>}
                                            </div>

                                            {editingRoom && (
                                                <div className="fixed inset-0 z-[220] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
                                                    <div className="absolute inset-0" onClick={() => setEditingRoom(null)}></div>
                                                    <div className="bg-white w-full max-w-2xl rounded-xl relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                                                        <div className="p-6 border-b border-charcoal/10 flex justify-between items-center bg-white">
                                                            <div>
                                                                <h3 className="text-xl font-serif font-bold text-charcoal">{editingRoom.id ? 'Edit Room' : 'New Room'}</h3>
                                                                <div className="flex gap-4 mt-4">
                                                                    <button
                                                                        onClick={() => setActiveRoomTab('details')}
                                                                        className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-all ${activeRoomTab === 'details' ? 'border-forest text-forest' : 'border-transparent text-charcoal/40'}`}
                                                                    >
                                                                        Details
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setActiveRoomTab('amenities')}
                                                                        className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-all ${activeRoomTab === 'amenities' ? 'border-forest text-forest' : 'border-transparent text-charcoal/40'}`}
                                                                    >
                                                                        Amenities
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setActiveRoomTab('gallery')}
                                                                        className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-all ${activeRoomTab === 'gallery' ? 'border-forest text-forest' : 'border-transparent text-charcoal/40'}`}
                                                                    >
                                                                        Gallery
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => setEditingRoom(null)} className="text-charcoal/40 hover:text-charcoal"><i className="fas fa-times"></i></button>
                                                        </div>

                                                        <div className="p-8 overflow-y-auto custom-scrollbar">
                                                            {activeRoomTab === 'details' && (
                                                                <div className="space-y-4">
                                                                    <div className="space-y-1">
                                                                        <label className="text-xs font-bold uppercase text-charcoal/60">Room Name</label>
                                                                        <input type="text" value={editingRoom.name} onChange={e => setEditingRoom({ ...editingRoom, name: e.target.value })} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm font-medium focus:border-forest focus:ring-1 focus:ring-forest/20" />
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="space-y-1">
                                                                            <label className="text-xs font-bold uppercase text-charcoal/60">Price (₹)</label>
                                                                            <input type="number" value={editingRoom.price_per_night} onChange={e => setEditingRoom({ ...editingRoom, price_per_night: parseFloat(e.target.value) })} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm font-mono focus:border-forest focus:ring-1 focus:ring-forest/20" />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-xs font-bold uppercase text-charcoal/60">Max Guests</label>
                                                                            <input type="text" value={editingRoom.max_guests} onChange={e => setEditingRoom({ ...editingRoom, max_guests: e.target.value })} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm focus:border-forest focus:ring-1 focus:ring-forest/20" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-xs font-bold uppercase text-charcoal/60">Size (e.g. 450 sq ft)</label>
                                                                        <input type="text" value={editingRoom.room_size} onChange={e => setEditingRoom({ ...editingRoom, room_size: e.target.value })} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm focus:border-forest focus:ring-1 focus:ring-forest/20" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-xs font-bold uppercase text-charcoal/60">Description</label>
                                                                        <textarea rows={3} value={editingRoom.description} onChange={e => setEditingRoom({ ...editingRoom, description: e.target.value })} className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm focus:border-forest focus:ring-1 focus:ring-forest/20" />
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <label className="text-xs font-bold uppercase text-charcoal/60">Inside Your Room</label>
                                                                        <div className="space-y-2">
                                                                            {(editingRoom.sleeping_arrangements || []).map((point, idx) => (
                                                                                <div key={idx} className="flex gap-2">
                                                                                    <input
                                                                                        type="text"
                                                                                        value={point}
                                                                                        onChange={(e) => {
                                                                                            const newArr = [...(editingRoom.sleeping_arrangements || [])];
                                                                                            newArr[idx] = e.target.value;
                                                                                            setEditingRoom({ ...editingRoom, sleeping_arrangements: newArr });
                                                                                        }}
                                                                                        className="flex-1 bg-white border border-charcoal/10 rounded-lg px-4 py-2 outline-none text-sm focus:border-forest focus:ring-1 focus:ring-forest/20"
                                                                                        placeholder="e.g. 1 King Bed"
                                                                                    />
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            const newArr = (editingRoom.sleeping_arrangements || []).filter((_, i) => i !== idx);
                                                                                            setEditingRoom({ ...editingRoom, sleeping_arrangements: newArr });
                                                                                        }}
                                                                                        className="w-10 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                                                    >
                                                                                        <i className="fas fa-trash text-xs"></i>
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                            <button
                                                                                onClick={() => setEditingRoom({ ...editingRoom, sleeping_arrangements: [...(editingRoom.sleeping_arrangements || []), ''] })}
                                                                                className="text-[10px] font-bold uppercase tracking-widest text-forest hover:underline"
                                                                            >
                                                                                + Add Point
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {activeRoomTab === 'amenities' && (
                                                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                                    <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                                                        {amenities.map(amenity => (
                                                                            <div
                                                                                key={amenity.id}
                                                                                onClick={() => toggleRoomAmenity(amenity.id)}
                                                                                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${activeRoomAmenities.includes(amenity.id)
                                                                                    ? 'bg-forest/5 border-forest/20 shadow-inner'
                                                                                    : 'bg-white border-charcoal/5 hover:border-forest/20'
                                                                                    }`}
                                                                            >
                                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${activeRoomAmenities.includes(amenity.id)
                                                                                    ? 'bg-forest text-white'
                                                                                    : 'bg-charcoal/5 text-charcoal/40'
                                                                                    }`}>
                                                                                    {(() => { const IC = HOTEL_ICON_MAP[amenity.icon]; return IC ? <IC size={16} /> : <span className="text-xs">?</span>; })()}
                                                                                </div>
                                                                                <span className={`text-xs font-bold ${activeRoomAmenities.includes(amenity.id) ? 'text-forest' : 'text-charcoal/60'}`}>
                                                                                    {amenity.name}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {activeRoomTab === 'gallery' && (
                                                                <div className="space-y-6">
                                                                    <div className="flex justify-between items-center">
                                                                        <h5 className="text-sm font-bold text-charcoal">Room Photos</h5>
                                                                        <button
                                                                            onClick={() => setShowRoomGallerySelector(true)}
                                                                            className="bg-forest text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-forest/90 transition-all shadow-lg shadow-forest/20"
                                                                        >
                                                                            <i className="fas fa-plus mr-2"></i>Add Photos
                                                                        </button>
                                                                    </div>

                                                                    <div className="grid grid-cols-3 gap-3">
                                                                        {roomImages.map((img, idx) => (
                                                                            <div key={idx} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-charcoal/10 flex flex-col">
                                                                                <div className="relative flex-grow overflow-hidden">
                                                                                    <img src={img.image_url} className="w-full h-full object-cover" alt={img.alt_text} />
                                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                                        {idx > 0 && (
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    const newImages = [...roomImages];
                                                                                                    [newImages[idx - 1], newImages[idx]] = [newImages[idx], newImages[idx - 1]];
                                                                                                    setRoomImages(newImages);
                                                                                                }}
                                                                                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
                                                                                                title="Move Left"
                                                                                            >
                                                                                                <i className="fas fa-arrow-left text-xs"></i>
                                                                                            </button>
                                                                                        )}

                                                                                        <button
                                                                                            onClick={() => setRoomImages(prev => prev.filter((_, i) => i !== idx))}
                                                                                            className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
                                                                                            title="Delete"
                                                                                        >
                                                                                            <i className="fas fa-trash-alt text-xs"></i>
                                                                                        </button>

                                                                                        {idx < roomImages.length - 1 && (
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    const newImages = [...roomImages];
                                                                                                    [newImages[idx + 1], newImages[idx]] = [newImages[idx], newImages[idx + 1]];
                                                                                                    setRoomImages(newImages);
                                                                                                }}
                                                                                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
                                                                                                title="Move Right"
                                                                                            >
                                                                                                <i className="fas fa-arrow-right text-xs"></i>
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="p-2 bg-white border-t border-charcoal/5">
                                                                                    <input
                                                                                        type="text"
                                                                                        placeholder="Tag"
                                                                                        value={img.tags || ''}
                                                                                        onChange={(e) => {
                                                                                            const newImages = [...roomImages];
                                                                                            newImages[idx].tags = e.target.value;
                                                                                            setRoomImages(newImages);
                                                                                        }}
                                                                                        className="w-full text-[10px] font-bold uppercase tracking-wider text-charcoal border-none outline-none bg-transparent placeholder:text-charcoal/30"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        {roomImages.length === 0 && (
                                                                            <div className="col-span-full py-10 text-center border-2 border-dashed border-charcoal/10 rounded-xl bg-gray-50">
                                                                                <p className="text-[10px] font-bold uppercase text-charcoal/40">No room photos yet</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="p-6 border-t border-charcoal/5 bg-gray-50 flex gap-4">
                                                            <button onClick={() => setEditingRoom(null)} className="flex-1 py-3 text-xs font-bold uppercase text-charcoal/60 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                                                            <button onClick={saveRoom} className="flex-1 bg-forest text-white py-3 rounded-lg text-xs font-bold uppercase shadow-lg hover:bg-forest/90 transition-all">Save Room</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === 'gallery' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-lg font-serif font-bold text-charcoal">Property Gallery</h4>
                                        <button
                                            onClick={() => setShowGallerySelector(true)}
                                            className="bg-forest text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-forest/90 transition-all shadow-lg shadow-forest/20"
                                        >
                                            <i className="fas fa-plus mr-2"></i>Add Photos
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {hotelImages.map((img, idx) => (
                                            <div key={idx} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-charcoal/10 flex flex-col">
                                                <div className="relative flex-grow overflow-hidden">
                                                    <img src={img.image_url} className="w-full h-full object-cover" alt={img.alt_text} />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        {idx > 0 && (
                                                            <button
                                                                onClick={() => {
                                                                    const newImages = [...hotelImages];
                                                                    [newImages[idx - 1], newImages[idx]] = [newImages[idx], newImages[idx - 1]];
                                                                    setHotelImages(newImages);
                                                                }}
                                                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
                                                                title="Move Left"
                                                            >
                                                                <i className="fas fa-arrow-left text-xs"></i>
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => setHotelImages(prev => prev.filter((_, i) => i !== idx))}
                                                            className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
                                                            title="Delete"
                                                        >
                                                            <i className="fas fa-trash-alt text-xs"></i>
                                                        </button>

                                                        {idx < hotelImages.length - 1 && (
                                                            <button
                                                                onClick={() => {
                                                                    const newImages = [...hotelImages];
                                                                    [newImages[idx + 1], newImages[idx]] = [newImages[idx], newImages[idx + 1]];
                                                                    setHotelImages(newImages);
                                                                }}
                                                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
                                                                title="Move Right"
                                                            >
                                                                <i className="fas fa-arrow-right text-xs"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="p-2 bg-white border-t border-charcoal/5">
                                                    <input
                                                        type="text"
                                                        placeholder="Tag (e.g. Bedroom)"
                                                        value={img.tags || ''}
                                                        onChange={(e) => {
                                                            const newImages = [...hotelImages];
                                                            newImages[idx].tags = e.target.value;
                                                            setHotelImages(newImages);
                                                        }}
                                                        className="w-full text-[10px] font-bold uppercase tracking-wider text-charcoal border-none outline-none bg-transparent placeholder:text-charcoal/30"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {hotelImages.length === 0 && (
                                            <div className="col-span-full py-16 text-center border-2 border-dashed border-charcoal/10 rounded-xl bg-gray-50">
                                                <div className="text-charcoal/20 text-4xl mb-3"><i className="fas fa-images"></i></div>
                                                <p className="text-xs font-bold uppercase text-charcoal/40">No images added yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'faqs' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-lg font-serif font-bold text-charcoal">Frequently Asked Questions</h4>
                                        <button
                                            onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
                                            className="bg-forest text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-forest/90 transition-all shadow-lg shadow-forest/20"
                                        >
                                            <i className="fas fa-plus mr-2"></i>Add Question
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {faqs.map((faq, idx) => (
                                            <div key={idx} className="bg-white p-6 rounded-xl border border-charcoal/10 shadow-sm group hover:border-forest/20 transition-all">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30">Q.{idx + 1}</span>
                                                    <button
                                                        onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                                                        className="text-charcoal/20 hover:text-red-500 transition-colors"
                                                    >
                                                        <i className="fas fa-trash-alt text-sm"></i>
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Question?"
                                                        value={faq.question}
                                                        onChange={(e) => {
                                                            const newFaqs = [...faqs];
                                                            newFaqs[idx].question = e.target.value;
                                                            setFaqs(newFaqs);
                                                        }}
                                                        className="w-full text-base font-serif font-bold text-charcoal border-b border-dashed border-charcoal/20 pb-2 outline-none focus:border-forest transition-colors bg-transparent placeholder:text-charcoal/20"
                                                    />
                                                    <textarea
                                                        rows={3}
                                                        placeholder="Answer..."
                                                        value={faq.answer}
                                                        onChange={(e) => {
                                                            const newFaqs = [...faqs];
                                                            newFaqs[idx].answer = e.target.value;
                                                            setFaqs(newFaqs);
                                                        }}
                                                        className="w-full text-sm text-charcoal/80 bg-charcoal/5 rounded-lg p-4 outline-none focus:ring-1 focus:ring-forest/20 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {faqs.length === 0 && (
                                            <div className="text-center py-16 border-2 border-dashed border-charcoal/10 rounded-xl bg-gray-50">
                                                <div className="text-charcoal/20 text-4xl mb-3"><i className="fas fa-question-circle"></i></div>
                                                <p className="text-xs font-bold uppercase text-charcoal/40">No FAQs yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'highlights' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-lg font-serif font-bold text-charcoal">Property Highlights</h4>
                                            <p className="text-xs text-charcoal/40 mt-0.5">Key selling points shown above the description on the property page</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const updated = [...(currentHotel.highlights || []), { icon: 'Mountain', text: '' }];
                                                setCurrentHotel({ ...currentHotel, highlights: updated });
                                                setActiveHighlightIdx(updated.length - 1);
                                            }}
                                            className="bg-charcoal text-white px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-charcoal/80 transition-all"
                                        >
                                            + Add Highlight
                                        </button>
                                    </div>

                                    {(currentHotel.highlights || []).length === 0 ? (
                                        <div className="text-center py-16 border-2 border-dashed border-charcoal/10 rounded-xl bg-gray-50">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30">No highlights yet — click + Add Highlight</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {(currentHotel.highlights || []).map((hl, idx) => {
                                                const IconComp = HOTEL_ICON_MAP[hl.icon];
                                                const isExpanded = activeHighlightIdx === idx;
                                                return (
                                                    <div key={idx} className="bg-white border border-charcoal/10 rounded-xl overflow-hidden">
                                                        {/* Row */}
                                                        <div className="flex items-center gap-3 p-3">
                                                            <button
                                                                onClick={() => setActiveHighlightIdx(isExpanded ? null : idx)}
                                                                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isExpanded ? 'bg-terracotta text-white' : 'bg-terracotta/10 text-terracotta hover:bg-terracotta/20'}`}
                                                                title="Change icon"
                                                            >
                                                                {IconComp ? <IconComp size={18} /> : <span className="text-xs font-bold">?</span>}
                                                            </button>
                                                            <input
                                                                type="text"
                                                                value={hl.text}
                                                                onChange={(e) => {
                                                                    const updated = [...(currentHotel.highlights || [])];
                                                                    updated[idx] = { ...updated[idx], text: e.target.value };
                                                                    setCurrentHotel({ ...currentHotel, highlights: updated });
                                                                }}
                                                                placeholder="e.g. Himalayan Views"
                                                                className="flex-1 bg-gray-50 border border-charcoal/10 rounded-lg px-4 py-2 outline-none text-sm font-medium focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const updated = (currentHotel.highlights || []).filter((_, i) => i !== idx);
                                                                    setCurrentHotel({ ...currentHotel, highlights: updated });
                                                                    if (activeHighlightIdx === idx) setActiveHighlightIdx(null);
                                                                }}
                                                                className="w-8 h-8 rounded-lg border border-red-100 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all flex-shrink-0"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M9 6V4h6v2" /></svg>
                                                            </button>
                                                        </div>
                                                        {/* Inline IconPicker */}
                                                        {isExpanded && (
                                                            <div className="px-4 pb-4 border-t border-charcoal/5 pt-4 bg-gray-50/70">
                                                                <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40 mb-3">Select Icon</p>
                                                                <IconPicker
                                                                    value={hl.icon}
                                                                    onChange={(iconName) => {
                                                                        const updated = [...(currentHotel.highlights || [])];
                                                                        updated[idx] = { ...updated[idx], icon: iconName };
                                                                        setCurrentHotel({ ...currentHotel, highlights: updated });
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'seo' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-charcoal/60">SEO Meta Title</label>
                                        <input
                                            type="text"
                                            value={currentHotel.meta_title || ''}
                                            onChange={(e) => setCurrentHotel({ ...currentHotel, meta_title: e.target.value })}
                                            className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm font-bold focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all"
                                            placeholder="e.g. Luxury Hotel in Shimla | Escape Stayz"
                                        />
                                        <p className="text-[10px] text-charcoal/40 text-right">{currentHotel.meta_title?.length || 0}/60 characters</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-charcoal/60">SEO Meta Description</label>
                                        <textarea
                                            rows={4}
                                            value={currentHotel.meta_description || ''}
                                            onChange={(e) => setCurrentHotel({ ...currentHotel, meta_description: e.target.value })}
                                            className="w-full bg-white border border-charcoal/10 rounded-lg px-4 py-3 outline-none text-sm focus:border-forest focus:ring-1 focus:ring-forest/20 transition-all"
                                            placeholder="e.g. Experience the best views in Shimla..."
                                        />
                                        <p className="text-[10px] text-charcoal/40 text-right">{currentHotel.meta_description?.length || 0}/160 characters</p>
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
                    onSelect={(selected) => {
                        const newAssets = selected.map(s => ({
                            image_url: s.public_url,
                            title: s.title,
                            alt_text: s.alt_text || s.title
                        }));
                        // Filter out duplicates based on URL
                        const uniqueNew = newAssets.filter(n => !hotelImages.some(h => h.image_url === n.image_url));
                        setHotelImages([...hotelImages, ...uniqueNew]);
                        setShowGallerySelector(false);
                    }}
                />
            )}

            {showRoomGallerySelector && (
                <GallerySelector
                    onClose={() => setShowRoomGallerySelector(false)}
                    onSelect={(selected) => {
                        const newAssets = selected.map(s => ({
                            image_url: s.public_url,
                            alt_text: s.alt_text || s.title
                        }));
                        // Filter out duplicates based on URL
                        const uniqueNew = newAssets.filter(n => !roomImages.some(r => r.image_url === n.image_url));
                        setRoomImages([...roomImages, ...uniqueNew]);
                        setShowRoomGallerySelector(false);
                    }}
                />
            )}

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
        </>
    );
}
