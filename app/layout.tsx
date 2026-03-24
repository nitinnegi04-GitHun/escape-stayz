import './globals.css';
import React from 'react';
import { Outfit, Inter } from 'next/font/google';
import { Providers } from './providers';
import { Metadata } from 'next';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_OG_IMAGE, SITE_LOGO } from '../lib/constants';

const outfit = Outfit({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    variable: '--font-heading',
    display: 'swap',
});

const inter = Inter({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600'],
    variable: '--font-body',
    display: 'swap',
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: `${SITE_NAME} - Luxury Hotel Chain`,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    openGraph: {
        siteName: SITE_NAME,
        type: 'website',
        images: [SITE_OG_IMAGE],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@escapestayz',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    themeColor: '#2D3A3A',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": SITE_NAME,
        "url": SITE_URL,
        "logo": SITE_LOGO,
        "sameAs": [
            "https://www.instagram.com/escapestayz",
            "https://www.facebook.com/escapestayz"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-800-ESCAPE-7",
            "contactType": "Customer Service",
            "areaServed": "IN",
            "availableLanguage": ["English", "Hindi"]
        }
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": SITE_NAME,
        "url": SITE_URL,
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${SITE_URL}/hotels?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
            <head>
                <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationSchema, websiteSchema]) }}
                />
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}

