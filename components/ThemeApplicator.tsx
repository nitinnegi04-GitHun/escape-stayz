import React, { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

export const ThemeApplicator: React.FC = () => {
    const { settings } = useSettings();

    useEffect(() => {
        if (!settings.brandColors || !settings.brandFonts) return;

        // Local variables with fallbacks to prevent crashes
        const colors = settings.brandColors || { primary: '#2D3A3A', cream: '#F5F5F0', terracotta: '#D96C5B', charcoal: '#1A1A1A' };
        const fonts = settings.brandFonts || { heading: 'Outfit', body: 'Inter' };

        const root = document.documentElement;

        // Apply Colors
        root.style.setProperty('--color-forest', colors.primary);
        root.style.setProperty('--color-cream', colors.cream);
        root.style.setProperty('--color-terracotta', colors.terracotta);
        root.style.setProperty('--color-charcoal', colors.charcoal);

        // Apply Fonts
        root.style.setProperty('--font-heading', `'${fonts.heading}', sans-serif`);
        root.style.setProperty('--font-body', `'${fonts.body}', sans-serif`);

        // Load Fonts from Google Fonts dynamically
        const fontsToLoad = [fonts.heading, fonts.body];
        const uniqueFonts = Array.from(new Set(fontsToLoad)); // Deduplicate

        const linkId = 'dynamic-google-fonts';
        let linkElement = document.getElementById(linkId) as HTMLLinkElement;

        if (!linkElement) {
            linkElement = document.createElement('link');
            linkElement.id = linkId;
            linkElement.rel = 'stylesheet';
            document.head.appendChild(linkElement);
        }

        const fontQuery = uniqueFonts.map(font => `family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700;800`).join('&');
        linkElement.href = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;

    }, [settings]);

    return null; // This component doesn't render anything visible
};
