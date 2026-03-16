
import { Metadata } from 'next';
import { Layout } from '../../components/Layout';
import { PageHero } from '../../components/PageHero';
import { TripPlanner } from '../../components/TripPlanner';

export const metadata: Metadata = {
    title: 'AI Concierge | Bespoke Itineraries',
    description: 'Experience bespoke trip planning powered by advanced intelligence. Craft your perfect Himalayan escape.',
    openGraph: {
        title: 'AI Concierge | Bespoke Itineraries',
        description: 'Experience bespoke trip planning powered by advanced intelligence. Craft your perfect Himalayan escape.',
        type: 'website',
    }
};

export default function PlanTripPage() {
    return (
        <Layout>
            <PageHero
                title="The AI Concierge"
                subtitle="Bespoke Journeys, Curated by Intelligence"
                image="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2921&auto=format&fit=crop"
            />
            <TripPlanner />
        </Layout>
    );
}
