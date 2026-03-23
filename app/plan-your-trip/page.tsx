import { Metadata } from 'next';
import PlanTripClient from './PlanTripClient';
import { SITE_URL, SITE_NAME, SITE_OG_IMAGE } from '../../lib/constants';

export const metadata: Metadata = {
    title: `Plan Your Trip | ${SITE_NAME}`,
    description: 'Plan your perfect Himalayan adventure with Escape Stayz. Customise your itinerary, choose accommodations, and get expert advice for your trip to Kinnaur and Spiti Valley.',
    alternates: {
        canonical: `${SITE_URL}/plan-your-trip`,
    },
    openGraph: {
        title: `Plan Your Trip | ${SITE_NAME}`,
        description: 'Plan your perfect Himalayan adventure with Escape Stayz. Customise your itinerary, choose accommodations, and get expert advice.',
        type: 'website',
        url: `${SITE_URL}/plan-your-trip`,
        siteName: SITE_NAME,
        images: [SITE_OG_IMAGE],
    },
    twitter: {
        card: 'summary_large_image',
        title: `Plan Your Trip | ${SITE_NAME}`,
        description: 'Plan your perfect Himalayan adventure with Escape Stayz.',
        images: [SITE_OG_IMAGE],
    },
};

export default function PlanTripPage() {
    return <PlanTripClient />;
}

