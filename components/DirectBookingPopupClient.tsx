'use client';

import dynamic from 'next/dynamic';

const DirectBookingPopup = dynamic(
    () => import('./DirectBookingPopup').then(m => ({ default: m.DirectBookingPopup })),
    { ssr: false }
);

export default function DirectBookingPopupClient() {
    return <DirectBookingPopup />;
}
