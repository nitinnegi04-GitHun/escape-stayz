import './globals.css';
import React from 'react';
import { Providers } from './providers';
import { Metadata } from 'next';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_OG_IMAGE, SITE_LOGO } from '../lib/constants';

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
        <html lang="en">
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
                    media="print"
                    // @ts-ignore
                    onLoad="this.media='all'"
                />
                <noscript>
                    <link
                        rel="stylesheet"
                        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
                    />
                </noscript>
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

