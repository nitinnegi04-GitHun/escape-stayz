'use client';

import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ImageGalleryModal } from './ImageGalleryModal';
import { Button } from './ui/Button';
import { useSettings } from '../context/SettingsContext';

interface RoomProps {
    room: {
        id: string;
        name: string;
        description: string;
        price_per_night: number;
        max_guests: string;
        image_url: string;
        images?: { id: string, image_url: string, alt_text?: string, tags?: string }[];
        room_amenities?: { amenity: { name: string, icon: string } }[];
        sleeping_arrangements?: string[];
        room_size?: string;
    };
    hotelName?: string;
}

export const RoomCard: React.FC<RoomProps> = ({ room, hotelName }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const { settings } = useSettings();

    const phone = settings?.contact?.phone?.replace(/\D/g, '') || '';
    const message = `Hi Team, would Like to Know More about ${room.name} ${hotelName ? `at ${hotelName}` : ''}`;
    const whatsappLink = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : '#';

    const { scrollYProgress } = useScroll({
        target: cardRef,
        offset: ["start end", "end start"]
    });

    // Parallax effect for the image: moves it slightly slower than the scroll
    const yParallax = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

    const placeholder = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?fm=webp&w=800';

    // Safety check: Filter out images with missing URLs
    const validRoomImages = room.images?.filter(img => img.image_url).map(img => ({
        url: img.image_url,
        alt: img.alt_text || room.name,
        tag: img.tags
    })) || [];

    const images = validRoomImages.length > 0
        ? validRoomImages
        : [{ url: room.image_url || placeholder, alt: room.name, tag: undefined }];

    // Deduplicate images (Not strictly necessary if using objects, but let's keep it simple or remove unique check if objects differ)
    // Actually, uniqueImages was Set(images), but images are now objects.
    // Let's just use images array directly for now, assuming BE returns valid list.
    const galleryImages = images;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    const openGallery = (index: number) => {
        setCurrentImageIndex(index); // Sync carousel with gallery
        setIsGalleryOpen(true);
    };

    return (
        <>
            <ImageGalleryModal
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                images={galleryImages}
                initialIndex={currentImageIndex}
            />

            <motion.div
                ref={cardRef}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col group items-stretch bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full"
            >

                {/* Image Section - Top weighted */}
                <div className="w-full relative overflow-hidden shrink-0">
                    <div
                        className="aspect-[4/3] w-full relative cursor-pointer"
                        onClick={() => openGallery(currentImageIndex)}
                    >
                        {/* Media Display */}
                        {galleryImages[currentImageIndex].url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                            <video
                                src={galleryImages[currentImageIndex].url}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                muted
                                loop
                                onMouseOver={e => e.currentTarget.play()}
                                onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                            />
                        ) : (
                            <img
                                src={galleryImages[currentImageIndex].url}
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                alt={`${room.name} - View ${currentImageIndex + 1}`}
                            />
                        )}

                        {/* Tag/Badge Overlay (Aligned with Site Style) */}
                        <div className="absolute top-4 left-4 z-10">

                            <span className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 shadow-lg z-10 whitespace-nowrap">
                                {galleryImages[currentImageIndex]?.tag || (room.name.includes('Balcony') ? 'ROOM - WITH BALCONY' : 'PREMIUM ROOM')}
                            </span>
                        </div>

                        {/* Navigation Arrows - Standard Size */}
                        {galleryImages.length > 1 && (
                            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex items-center justify-between z-10 opacity-50 group-hover:opacity-80 transition-opacity duration-300">
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm text-charcoal shadow-lg hover:bg-white transition-all flex items-center justify-center transform hover:scale-110"
                                >
                                    <i className="fas fa-chevron-left text-xs"></i>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm text-charcoal shadow-lg hover:bg-white transition-all flex items-center justify-center transform hover:scale-110"
                                >
                                    <i className="fas fa-chevron-right text-xs"></i>
                                </button>
                            </div>
                        )}

                        {/* Pagination Dots */}
                        {galleryImages.length > 1 && (
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                                {galleryImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-terracotta w-4' : 'bg-white/40 w-1.5'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="w-full flex flex-col p-8 flex-grow bg-white">

                    {/* Room Name & Brief Description */}
                    <div className="mb-6">
                        <h4 className="text-l font-bold text-charcoal mb-2 leading-tight ">
                            {room.name}
                        </h4>
                        <p className="text-charcoal/60 text-sm leading-relaxed prose font-light min-h-[30px]">
                            {room.description}
                        </p>
                    </div>


                    {/* Capacity Section - Site Aligned */}
                    <div className="flex items-center justify-between mb-6 group/capacity">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-forest/5 flex items-center justify-center shrink-0 transition-colors">
                                <i className="fas fa-users text-[15px] text-forest/60"></i>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-terracotta leading-none mb-1">
                                    Capacity
                                </span>
                                <span className="text-[10px]  tracking-wider text-charcoal/40 font-medium">
                                    {room.max_guests}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100/50">
                            <i className="fas fa-ruler-combined text-[15px] text-charcoal/40"></i>
                            <span className="text-sm font-medium text-terracotta">
                                sq ft  <span className="text-[10px] uppercase ml-0.5 text-charcoal/60">{room.room_size || '180'}</span>
                            </span>
                        </div>
                    </div>

                    {/* Room Amenities */}
                    {room.room_amenities && room.room_amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6 pt-2 border-t border-gray-100/50">
                            {room.room_amenities.slice(0, room.room_amenities.length).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-cream/30 rounded-full border border-forest/5">
                                    <i className={`${item.amenity?.icon || 'fas fa-check'} text-[10px] text-terracotta opacity-80`}></i>
                                    <span className="text-[10px] font-medium text-charcoal/70 tracking-wide">{item.amenity?.name}</span>
                                </div>
                            ))}

                        </div>
                    )}

                    {/* Pricing & CTA Stack - Site Aligned */}
                    <div className="mt-auto flex items-center justify-between">
                        <div className="flex flex-col">
                            <p className="text-[10px] uppercase tracking-wider text-charcoal/40 mb-1">Price / Night</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-terracotta opacity-80">
                                    From ₹{room.price_per_night.toLocaleString()}
                                </span>
                                <span className="text-xs text-charcoal/40 italic font-light">/nt</span>
                            </div>
                        </div>

                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/btn flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full hover:bg-[#1EBE5D] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            <span className="font-bold text-xs uppercase tracking-wider">Book Now</span>
                            <i className="fab fa-whatsapp text-base"></i>
                        </a>
                    </div>
                </div>
            </motion.div>
        </>
    );
};
