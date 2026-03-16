'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Socials {
    instagram: string;
    linkedin: string;
    pinterest: string;
    facebook: string;
}

interface BrandColors {
    primary: string;
    cream: string;
    terracotta: string;
    charcoal: string;
}

interface BrandFonts {
    heading: string;
    body: string;
}

interface ContactDetails {
    phone: string;
    email: string;
    address: string;
}

export interface SiteSettings {
    logoUrl: string;
    logoUrl2: string;
    siteName: string;
    contact: ContactDetails;
    socials: Socials;
    brandColors: BrandColors;
    brandFonts: BrandFonts;
}

const defaultSettings: SiteSettings = {
    logoUrl: '',
    logoUrl2: '',
    siteName: 'Escape Stayz',
    contact: {
        phone: '+91 98765 43210',
        email: 'hello@escapestayz.com',
        address: 'Kinnaur & Spiti Valley, Himachal Pradesh, India'
    },
    socials: {
        instagram: 'https://instagram.com/escapestayz',
        linkedin: 'https://linkedin.com/company/escapestayz',
        pinterest: 'https://pinterest.com/escapestayz',
        facebook: 'https://facebook.com/escapestayz'
    },
    brandColors: {
        primary: '#2D3A3A',
        cream: '#F5F5F0',
        terracotta: '#D96C5B',
        charcoal: '#1A1A1A'
    },
    brandFonts: {
        heading: 'Outfit',
        body: 'Inter'
    }
};

interface SettingsContextType {
    settings: SiteSettings;
    updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, error } = await supabase.from('site_settings').select('*');
                if (error) {
                    console.error('Error fetching settings:', error);
                    return;
                }
                if (data) {
                    const newSettings = { ...defaultSettings };
                    data.forEach(item => {
                        if (item.key === 'site_identity') {
                            newSettings.logoUrl = item.value.logoUrl;
                            newSettings.logoUrl2 = item.value.logoUrl2 || '';
                            newSettings.siteName = item.value.siteName;
                        } else if (item.key === 'contact_info') {
                            newSettings.contact = item.value;
                        } else if (item.key === 'social_links') {
                            newSettings.socials = item.value;
                        } else if (item.key === 'brand_colors') {
                            newSettings.brandColors = { ...defaultSettings.brandColors, ...item.value };
                        } else if (item.key === 'brand_fonts') {
                            newSettings.brandFonts = { ...defaultSettings.brandFonts, ...item.value };
                        }
                    });
                    setSettings(newSettings);
                }
            } catch (err) {
                console.error('Unexpected error fetching settings:', err);
            }
        };
        fetchSettings();
    }, []);

    const updateSettings = async (newSettings: Partial<SiteSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);

        // Update site_identity
        if (newSettings.logoUrl !== undefined || newSettings.logoUrl2 !== undefined || newSettings.siteName !== undefined) {
            await supabase.from('site_settings').update({
                value: {
                    logoUrl: updated.logoUrl,
                    logoUrl2: updated.logoUrl2,
                    siteName: updated.siteName
                }
            }).eq('key', 'site_identity');
        }
        // Update contact_info
        if (newSettings.contact) {
            await supabase.from('site_settings').update({ value: updated.contact }).eq('key', 'contact_info');
        }
        // Update social_links
        if (newSettings.socials) {
            await supabase.from('site_settings').update({ value: updated.socials }).eq('key', 'social_links');
        }
        // Update brand_colors
        if (newSettings.brandColors) {
            await supabase.from('site_settings').update({ value: updated.brandColors }).eq('key', 'brand_colors');
        }
        // Update brand_fonts
        if (newSettings.brandFonts) {
            await supabase.from('site_settings').update({ value: updated.brandFonts }).eq('key', 'brand_fonts');
        }
    };

    // Dynamic CSS Variable Injection
    useEffect(() => {
        const root = document.documentElement;
        if (settings.brandColors) {
            root.style.setProperty('--color-forest', settings.brandColors.primary);
            root.style.setProperty('--color-cream', settings.brandColors.cream);
            root.style.setProperty('--color-terracotta', settings.brandColors.terracotta);
            root.style.setProperty('--color-charcoal', settings.brandColors.charcoal);
        }
        if (settings.brandFonts) {
            root.style.setProperty('--font-heading', settings.brandFonts.heading);
            root.style.setProperty('--font-body', settings.brandFonts.body);
        }
    }, [settings]);

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
