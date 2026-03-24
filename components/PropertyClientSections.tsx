'use client';

import dynamic from 'next/dynamic';

export const DirectBookingPopup = dynamic(
    () => import('./DirectBookingPopup').then(m => ({ default: m.DirectBookingPopup })),
    { ssr: false }
);

export const OtherPropertiesSection = dynamic(
    () => import('./OtherPropertiesSection').then(m => ({ default: m.OtherPropertiesSection })),
    { ssr: false }
);

export const ExperiencesCarousel = dynamic(
    () => import('./ExperiencesCarousel').then(m => ({ default: m.ExperiencesCarousel })),
    { ssr: false }
);
