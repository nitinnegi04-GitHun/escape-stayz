
'use client';

import React, { useState, useEffect } from 'react';
import { useSettings, SiteSettings } from '../../../../context/SettingsContext';
import { ImagePicker } from '../../../../components/Admin/ImagePicker';
import { IconRegistry } from '../../../../components/Admin/IconRegistry';

export default function AdminSettingsPage() {
    const { settings, updateSettings } = useSettings();
    const [formData, setFormData] = useState<SiteSettings>(settings);
    const [isSaving, setIsSaving] = useState(false);

    // Sync local state when settings change (e.g. initial load)
    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (section: keyof SiteSettings, key: string, value: string) => {
        if (section === 'contact' || section === 'socials' || section === 'brandColors' || section === 'brandFonts') {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [key]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [key]: value
            }));
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate network delay for UX
        setTimeout(() => {
            updateSettings(formData);
            setIsSaving(false);
            alert('Settings saved successfully!');
        }, 800);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-heading text-charcoal">Global Settings</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-charcoal/40 mt-2">Site Identity & Configuration</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-forest text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="space-y-8">
                {/* Branding Section */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-charcoal/5">
                    <h3 className="text-xl font-heading mb-6 text-charcoal">Brand Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-bold uppercase text-charcoal/40">Site Name</label>
                            <input
                                type="text"
                                value={formData.siteName}
                                onChange={(e) => handleChange('siteName', 'siteName', e.target.value)}
                                className="w-full bg-[#f8f9fa] rounded-xl px-5 py-4 outline-none text-sm font-medium text-charcoal focus:ring-1 focus:ring-forest/20 transition-all"
                            />
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <ImagePicker
                                    label="Logo 1 (Primary)"
                                    value={formData.logoUrl}
                                    onChange={(url) => handleChange('logoUrl', 'logoUrl', url)}
                                />
                                <p className="text-[10px] text-charcoal/30">Main logo used in most places.</p>
                            </div>
                            <div className="space-y-3">
                                <ImagePicker
                                    label="Logo 2 (Secondary / Sticky)"
                                    value={formData.logoUrl2}
                                    onChange={(url) => handleChange('logoUrl2', 'logoUrl2', url)}
                                />
                                <p className="text-[10px] text-charcoal/30">Used for contrasting backgrounds or sticky headers.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-charcoal/5">
                        <h4 className="text-sm font-bold text-charcoal mb-6">Color Palette</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-3">
                                <label className="text-[9px] font-bold uppercase text-charcoal/40">Primary Color</label>
                                <div className="flex items-center space-x-3 bg-[#f8f9fa] rounded-xl p-2 pr-4 transition-colors focus-within:ring-1 focus-within:ring-forest/20">
                                    <input
                                        type="color"
                                        value={formData.brandColors?.primary || '#2D3A3A'}
                                        onChange={(e) => handleChange('brandColors', 'primary', e.target.value)}
                                        className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent flex-shrink-0"
                                    />
                                    <input
                                        type="text"
                                        value={formData.brandColors?.primary || '#2D3A3A'}
                                        onChange={(e) => handleChange('brandColors', 'primary', e.target.value)}
                                        className="bg-transparent border-none text-xs font-mono text-charcoal/70 uppercase w-full outline-none p-0"
                                        maxLength={7}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-bold uppercase text-charcoal/40">Background Color</label>
                                <div className="flex items-center space-x-3 bg-[#f8f9fa] rounded-xl p-2 pr-4 transition-colors focus-within:ring-1 focus-within:ring-forest/20">
                                    <input
                                        type="color"
                                        value={formData.brandColors?.cream || '#F5F5F0'}
                                        onChange={(e) => handleChange('brandColors', 'cream', e.target.value)}
                                        className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent flex-shrink-0"
                                    />
                                    <input
                                        type="text"
                                        value={formData.brandColors?.cream || '#F5F5F0'}
                                        onChange={(e) => handleChange('brandColors', 'cream', e.target.value)}
                                        className="bg-transparent border-none text-xs font-mono text-charcoal/70 uppercase w-full outline-none p-0"
                                        maxLength={7}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-bold uppercase text-charcoal/40">Accent Color</label>
                                <div className="flex items-center space-x-3 bg-[#f8f9fa] rounded-xl p-2 pr-4 transition-colors focus-within:ring-1 focus-within:ring-forest/20">
                                    <input
                                        type="color"
                                        value={formData.brandColors?.terracotta || '#D96C5B'}
                                        onChange={(e) => handleChange('brandColors', 'terracotta', e.target.value)}
                                        className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent flex-shrink-0"
                                    />
                                    <input
                                        type="text"
                                        value={formData.brandColors?.terracotta || '#D96C5B'}
                                        onChange={(e) => handleChange('brandColors', 'terracotta', e.target.value)}
                                        className="bg-transparent border-none text-xs font-mono text-charcoal/70 uppercase w-full outline-none p-0"
                                        maxLength={7}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-bold uppercase text-charcoal/40">Text Color</label>
                                <div className="flex items-center space-x-3 bg-[#f8f9fa] rounded-xl p-2 pr-4 transition-colors focus-within:ring-1 focus-within:ring-forest/20">
                                    <input
                                        type="color"
                                        value={formData.brandColors?.charcoal || '#1A1A1A'}
                                        onChange={(e) => handleChange('brandColors', 'charcoal', e.target.value)}
                                        className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent flex-shrink-0"
                                    />
                                    <input
                                        type="text"
                                        value={formData.brandColors?.charcoal || '#1A1A1A'}
                                        onChange={(e) => handleChange('brandColors', 'charcoal', e.target.value)}
                                        className="bg-transparent border-none text-xs font-mono text-charcoal/70 uppercase w-full outline-none p-0"
                                        maxLength={7}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-charcoal/5">
                        <h4 className="text-sm font-bold text-charcoal mb-6">Typography</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[9px] font-bold uppercase text-charcoal/40">Heading Font</label>
                                <select
                                    value={formData.brandFonts?.heading || 'Outfit'}
                                    onChange={(e) => handleChange('brandFonts', 'heading', e.target.value)}
                                    className="w-full bg-[#f8f9fa] rounded-xl px-5 py-4 outline-none text-sm font-medium text-charcoal focus:ring-1 focus:ring-forest/20 transition-all appearance-none"
                                >
                                    <option value="Outfit">Outfit (Modern Sans)</option>
                                    <option value="Playfair Display">Playfair Display (Serif)</option>
                                    <option value="Montserrat">Montserrat (Geometric Sans)</option>
                                    <option value="Roboto">Roboto (Clean Sans)</option>
                                    <option value="Lato">Lato (Friendly Sans)</option>
                                </select>
                                <p className="text-[10px] text-charcoal/30">Used for titles and large text.</p>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-bold uppercase text-charcoal/40">Body Font</label>
                                <select
                                    value={formData.brandFonts?.body || 'Inter'}
                                    onChange={(e) => handleChange('brandFonts', 'body', e.target.value)}
                                    className="w-full bg-[#f8f9fa] rounded-xl px-5 py-4 outline-none text-sm font-medium text-charcoal focus:ring-1 focus:ring-forest/20 transition-all appearance-none"
                                >
                                    <option value="Inter">Inter (Clean Sans)</option>
                                    <option value="Open Sans">Open Sans (Friendly Sans)</option>
                                    <option value="Roboto">Roboto (Clean Sans)</option>
                                    <option value="Lora">Lora (Readability Serif)</option>
                                    <option value="Merriweather">Merriweather (Readability Serif)</option>
                                </select>
                                <p className="text-[10px] text-charcoal/30">Used for mainly paragraphs and UI text.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Details */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-charcoal/5">
                    <h3 className="text-xl font-heading mb-6 text-charcoal">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-bold uppercase text-charcoal/40">Phone Number</label>
                            <input
                                type="text"
                                value={formData.contact.phone}
                                onChange={(e) => handleChange('contact', 'phone', e.target.value)}
                                className="w-full bg-[#f8f9fa] rounded-xl px-5 py-4 outline-none text-sm font-medium text-charcoal focus:ring-1 focus:ring-forest/20 transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-bold uppercase text-charcoal/40">Email Address</label>
                            <input
                                type="text"
                                value={formData.contact.email}
                                onChange={(e) => handleChange('contact', 'email', e.target.value)}
                                className="w-full bg-[#f8f9fa] rounded-xl px-5 py-4 outline-none text-sm font-medium text-charcoal focus:ring-1 focus:ring-forest/20 transition-all"
                            />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                            <label className="text-[9px] font-bold uppercase text-charcoal/40">Physical Address</label>
                            <input
                                type="text"
                                value={formData.contact.address}
                                onChange={(e) => handleChange('contact', 'address', e.target.value)}
                                className="w-full bg-[#f8f9fa] rounded-xl px-5 py-4 outline-none text-sm font-medium text-charcoal focus:ring-1 focus:ring-forest/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Icon Registry */}
                <IconRegistry />

                {/* Social Media */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-charcoal/5">
                    <h3 className="text-xl font-heading mb-6 text-charcoal">Social Connections</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-bold uppercase text-charcoal/40">Instagram URL</label>
                            <div className="relative">
                                <i className="fab fa-instagram absolute left-5 top-1/2 -translate-y-1/2 text-charcoal/30"></i>
                                <input
                                    type="text"
                                    value={formData.socials.instagram}
                                    onChange={(e) => handleChange('socials', 'instagram', e.target.value)}
                                    className="w-full bg-[#f8f9fa] rounded-xl pl-12 pr-5 py-4 outline-none text-sm font-medium text-charcoal focus:ring-1 focus:ring-forest/20 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-bold uppercase text-charcoal/40">LinkedIn URL</label>
                            <div className="relative">
                                <i className="fab fa-linkedin absolute left-5 top-1/2 -translate-y-1/2 text-charcoal/30"></i>
                                <input
                                    type="text"
                                    value={formData.socials.linkedin}
                                    onChange={(e) => handleChange('socials', 'linkedin', e.target.value)}
                                    className="w-full bg-[#f8f9fa] rounded-xl pl-12 pr-5 py-4 outline-none text-sm font-medium text-charcoal focus:ring-1 focus:ring-forest/20 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-bold uppercase text-charcoal/40">Pinterest URL</label>
                            <div className="relative">
                                <i className="fab fa-pinterest absolute left-5 top-1/2 -translate-y-1/2 text-charcoal/30"></i>
                                <input
                                    type="text"
                                    value={formData.socials.pinterest}
                                    onChange={(e) => handleChange('socials', 'pinterest', e.target.value)}
                                    className="w-full bg-[#f8f9fa] rounded-xl pl-12 pr-5 py-4 outline-none text-sm font-medium text-charcoal focus:ring-1 focus:ring-forest/20 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-bold uppercase text-charcoal/40">Facebook URL</label>
                            <div className="relative">
                                <i className="fab fa-facebook absolute left-5 top-1/2 -translate-y-1/2 text-charcoal/30"></i>
                                <input
                                    type="text"
                                    value={formData.socials.facebook}
                                    onChange={(e) => handleChange('socials', 'facebook', e.target.value)}
                                    className="w-full bg-[#f8f9fa] rounded-xl pl-12 pr-5 py-4 outline-none text-sm font-medium text-charcoal focus:ring-1 focus:ring-forest/20 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
