'use client';

import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ImageGalleryModal } from './ImageGalleryModal';
import { Button } from './ui/Button';

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
}

export const RoomCard: React.FC<RoomProps> = ({ room }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

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
                className="flex flex-col md:flex-row group items-stretch border border-forest/10 hover:bg-forest/[0.02] transition-colors duration-500 rounded-3xl overflow-hidden"
            >

                {/* Image Section - Scaled Down */}
                <div className="md:w-5/12 w-full relative overflow-hidden shrink-0">
                    <div
                        className="h-[250px] md:h-full md:min-h-[300px] w-full rounded-none shadow-2xl shadow-forest/10 relative cursor-pointer"
                        onClick={() => openGallery(currentImageIndex)}
                    >
                        {/* Media Display (Image or Video) */}
                        {galleryImages[currentImageIndex].url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                            <motion.video
                                style={{ y: yParallax, scale: 1.1 }}
                                src={galleryImages[currentImageIndex].url}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 origin-center"
                                muted
                                loop
                                onMouseOver={e => e.currentTarget.play()}
                                onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                            />
                        ) : (
                            <motion.img
                                style={{ y: yParallax, scale: 1.1 }}
                                src={galleryImages[currentImageIndex].url}
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 origin-center"
                                alt={`${room.name} - View ${currentImageIndex + 1}`}
                            />
                        )}

                        {/* Tag Overlay */}
                        {galleryImages[currentImageIndex].tag && (
                            <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 shadow-lg z-10 pointer-events-none">
                                {galleryImages[currentImageIndex].tag}
                            </div>
                        )}

                        {/* Elegant Image Navigation - Visible on Hover */}
                        {galleryImages.length > 1 && (
                            <>
                                <div className="absolute inset-0 flex items-center justify-between px-4 z-10 pointer-events-none">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-forest hover:bg-forest hover:text-white transition-all transform hover:scale-110 pointer-events-auto"
                                    >
                                        <i className="fas fa-chevron-left text-xs"></i>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-forest hover:bg-forest hover:text-white transition-all transform hover:scale-110 pointer-events-auto"
                                    >
                                        <i className="fas fa-chevron-right text-xs"></i>
                                    </button>
                                </div>

                                {/* Minimal Dots */}
                                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10 pointer-events-none">
                                    {galleryImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                            className={`w-1.5 h-1.5 rounded-full transition-all shadow-sm pointer-events-auto ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/60 hover:bg-white'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Zoom Icon Overlay */}
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <i className="fas fa-expand-alt text-white"></i>
                        </div>
                    </div>
                </div>

                {/* Content Section - Editorial Style */}
                <div className="md:w-7/12 w-full flex flex-col justify-between p-5 md:p-8 lg:p-10">

                    {/* Header: Name & Capacity */}
                    <div className="mb-5">

                        <h4 className="text-2xl md:text-3xl font-heading font-bold text-charcoal mb-3 leading-tight group-hover:text-forest transition-colors duration-300">
                            {room.name}
                        </h4>
                        <p className="text-charcoal/70 text-sm md:text-base leading-relaxed font-light line-clamp-2 md:line-clamp-none">{room.description}</p>
                    </div>

                    {/* Amenities - Refactored to Lightweight Text List */}
                    {room.room_amenities && room.room_amenities.length > 0 && (
                        <div className="mb-5 border-t border-forest/5 pt-4">
                            <h5 className="text-forest/70 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-3">Room Amenities</h5>
                            <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
                                {room.room_amenities.slice(0, 8).map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-charcoal/70 text-sm font-light">
                                        <i className={`fas ${item.amenity.icon || 'fa-check'} text-forest/40 text-[10px]`}></i>
                                        <span>{item.amenity.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Sleeping Arrangements & Features - Minimal */}
                    {room.sleeping_arrangements && (
                        <div className="mb-5 border-t border-forest/5 pt-4">
                            <h5 className="text-forest/70 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-3">Layout & Design</h5>
                            <div className="flex flex-wrap gap-x-6 gap-y-3">
                                <span className="flex items-center gap-2 text-charcoal/70 text-sm font-light">
                                    <i className="fas fa-user-group text-forest/40 text-[10px]"></i>
                                    <span>Max {room.max_guests} Guests</span>
                                </span>
                                <span className="flex items-center gap-2 text-charcoal/70 text-sm font-light">
                                    <i className="fas fa-ruler-combined text-forest/40 text-[10px]"></i>
                                    <span>{room.room_size || 'Spacious Suite'}</span>
                                </span>
                                {room.sleeping_arrangements.map((bed, idx) => (
                                    <span key={idx} className="flex items-center gap-2 text-charcoal/70 text-sm font-light">
                                        <i className="fas fa-bed text-forest/40 text-[10px]"></i>
                                        <span>{bed}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}



                    {/* Pricing - Simple & Elegant */}
                    <div className="mt-4 md:mt-auto flex items-end justify-between pt-4 border-t border-forest/5">
                        <div className="flex flex-col">
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-charcoal/40 mb-0.5">Starting from</p>
                            <span className="text-xs text-charcoal/40 line-through font-medium decoration-terracotta/30 mb-0.5">
                                ₹{Math.round(room.price_per_night * 1.2).toLocaleString()}
                            </span>
                            <div className="flex items-baseline gap-1.5 md:gap-2">
                                <span className="text-2xl md:text-3xl font-heading font-bold text-terracotta whitespace-nowrap">
                                    ₹{room.price_per_night.toLocaleString()}
                                </span>
                                <span className="text-[10px] md:text-sm text-charcoal/60 font-medium whitespace-nowrap">/ night</span>
                            </div>
                        </div>
                        <Button
                            onClick={() => {
                                document.getElementById('reservation-sidebar')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            variant="primary"
                            className="!py-2 !px-4 md:!py-2.5 md:!px-6 text-[10px] md:text-xs shrink-0 self-end mb-1"
                        >
                            Book Now
                        </Button>
                    </div>
                </div>
            </motion.div>
        </>
    );
};
