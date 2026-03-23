"use client";

import { useRef, useState, useCallback, useEffect } from 'react';

interface Experience {
    title: string;
    description?: string;
    category?: string;
    imageUrl?: string;
    image_url?: string;
}

interface ExperiencesCarouselProps {
    experiences: Experience[];
    heroImage?: string;
    recommendedDays?: number;
    destinationName?: string;
    experiencesWhatsappLink?: string;
}

export const ExperiencesCarousel = ({
    experiences,
    heroImage,
    recommendedDays,
    destinationName,
    experiencesWhatsappLink,
}: ExperiencesCarouselProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const scrollPosition = container.scrollLeft;

        let newIndex = 0;
        let minDiff = Infinity;
        const children = container.children;
        const containerCenter = scrollPosition + container.clientWidth / 2;

        for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            const childCenter = child.offsetLeft - container.offsetLeft + child.offsetWidth / 2;
            const diff = Math.abs(containerCenter - childCenter);
            if (diff < minDiff) {
                minDiff = diff;
                newIndex = i;
            }
        }
        setActiveIndex(newIndex);
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                window.scrollBy({ top: e.deltaY, behavior: 'auto' });
            }
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, []);

    const scrollToIndex = (index: number) => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const children = container.children;
        if (index >= 0 && index < children.length) {
            const child = children[index] as HTMLElement;
            const paddingLeft = window.innerWidth < 1024 ? 16 : 0;
            container.scrollTo({
                left: child.offsetLeft - container.offsetLeft - paddingLeft,
                behavior: 'smooth',
            });
            setActiveIndex(index);
        }
    };

    return (
        <div className="w-full">
            {/* Header row: title + counter side by side */}
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl lg:text-2xl font-bold text-forest font-heading">
                    Must Have Experiences Near the Stay
                </h3>

                {/* Counter — only on mobile when multiple items */}
                {experiences.length > 1 && (
                    <div className="flex items-center gap-3 shrink-0 ml-4 lg:hidden">
                        <button
                            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
                            disabled={activeIndex === 0}
                            className={`transition-opacity ${activeIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:opacity-70'} w-8 h-8 flex items-center justify-center`}
                            aria-label="Previous experience"
                        >
                            <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 18L3 10L11 2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={activeIndex === 0 ? "text-gray-300" : "text-gray-400"} />
                            </svg>
                        </button>
                        <span className="text-base font-bold text-gray-900 font-heading tracking-wide">
                            {activeIndex + 1} / {experiences.length}
                        </span>
                        <button
                            onClick={() => scrollToIndex(Math.min(experiences.length - 1, activeIndex + 1))}
                            disabled={activeIndex === experiences.length - 1}
                            className={`transition-opacity ${activeIndex === experiences.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:opacity-70'} w-8 h-8 flex items-center justify-center`}
                            aria-label="Next experience"
                        >
                            <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 18L11 10L3 2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={activeIndex === experiences.length - 1 ? "text-gray-300" : "text-gray-900"} />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Description — full width below the header row */}
            {recommendedDays && destinationName && (
                <p className="text-md text-charcoal/60 leading-relaxed mb-2 font-heading">
                    To enjoy these experiences, we recommend you spend a minimum of{' '}
                    <span className="text-terracotta font-bold italic">{recommendedDays} days</span>{' '}
                    in <span className="text-forest font-bold">{destinationName}</span>.
                </p>
            )}

            {/* Mobile: horizontal scroll carousel | Desktop: grid */}
            <div className="block lg:hidden mt-6">
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {experiences.map((item, idx) => (
                        <div key={idx} className="snap-start shrink-0 w-[80vw]">
                            <ExperienceCard item={item} heroImage={heroImage} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Desktop: standard grid */}
            <div className="hidden lg:grid grid-cols-3 gap-6 mt-8">
                {experiences.map((item, idx) => (
                    <ExperienceCard key={idx} item={item} heroImage={heroImage} />
                ))}
            </div>

            {/* WhatsApp CTA */}
            {experiencesWhatsappLink && (
                <div
                    className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl px-7 py-6 border border-terracotta/20 shadow-sm"
                    style={{ background: 'linear-gradient(to right, rgba(217, 108, 91, 0.12), #F5F5F0)' }}
                >
                    <div>
                        <p className="text-4xl text-center font-bold text-charcoal font-heading leading-snug">Want to plan these experiences?</p>
                        <p className="text-md text-center text-charcoal/55 mt-1 leading-relaxed">Chat with our travel expert to craft the perfect itinerary.</p>
                    </div>
                    <a
                        href={experiencesWhatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn flex items-center gap-2 text-white px-5 py-2.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                        style={{ backgroundColor: '#25D366' }}
                    >
                        <i className="fab fa-whatsapp text-base"></i>
                        <span className="font-bold text-xs uppercase tracking-wider">Chat with Our Travel Expert</span>
                    </a>
                </div>
            )}
        </div>
    );
};

// Individual experience card
const ExperienceCard = ({ item, heroImage }: { item: Experience; heroImage?: string }) => (
    <div className="group bg-white rounded-3xl overflow-hidden border border-forest/5 shadow-lg shadow-forest/5 hover:border-terracotta/20 transition-all duration-500 flex flex-col h-full">
        <div className="aspect-[4/3] relative overflow-hidden">
            <img
                src={item.imageUrl || item.image_url || heroImage || ''}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt={item.title}
                loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
            {item.category && (
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-forest shadow-sm z-10 border border-forest/5">
                    {item.category}
                </div>
            )}
        </div>
        <div className="p-6 flex flex-col flex-grow text-center items-center">
            <h4 className="text-base font-bold text-charcoal mb-2 group-hover:text-forest transition-colors font-heading">{item.title}</h4>
            <p className="text-charcoal/60 text-sm leading-relaxed">{item.description}</p>
        </div>
    </div>
);
