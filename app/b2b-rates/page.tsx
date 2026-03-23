import { Metadata } from 'next';
import B2BRatesClient from './B2BRatesClient';

export const metadata: Metadata = {
    title: 'B2B Partner Rates | EscapeStayz',
    robots: {
        index: false,
        follow: false,
    },
};

export default function B2BRatesPage() {
    return <B2BRatesClient />;
}
