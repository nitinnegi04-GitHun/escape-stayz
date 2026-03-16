import './globals.css';
import React from 'react';
import { Providers } from './providers';

export const metadata = {
    title: 'Escape Stayz - Luxury Hotel Chain',
    description: 'Crafting silent luxury and refined mountain hospitality across the globes most secluded peaks.',
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
        "name": "Escape Stayz - Luxury Hotel Chain",
        "url": "https://escapestayz.com",
        "logo": "https://escapestayz.com/logo.png",
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

    return (
        <html lang="en">
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                />
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
