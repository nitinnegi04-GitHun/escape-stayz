'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getLucideIcon } from '../../lib/lucideAll';
import { HOTEL_ICONS } from './hotelIcons';

interface RegistryIcon {
    name: string;
    label: string;
    category: string;
}

interface IconPickerProps {
    value: string;
    onChange: (iconName: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
    const [icons, setIcons] = useState<RegistryIcon[]>([]);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        supabase
            .from('icon_registry')
            .select('name, label, category')
            .order('category')
            .order('label')
            .then(({ data }) => {
                if (data && data.length > 0) {
                    setIcons(data);
                } else {
                    // Fallback to static built-in icons
                    setIcons(HOTEL_ICONS.map(i => ({ name: i.name, label: i.label, category: i.category })));
                }
            });
    }, []);

    const categories = ['All', ...Array.from(new Set(icons.map(i => i.category))).sort()];

    const filtered = icons.filter(icon => {
        const matchesSearch = search
            ? icon.label.toLowerCase().includes(search.toLowerCase()) ||
              icon.name.toLowerCase().includes(search.toLowerCase())
            : true;
        const matchesCategory = activeCategory === 'All' || icon.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const SelectedIcon = getLucideIcon(value);

    return (
        <div className="space-y-3">
            {/* Selected preview */}
            <div className="flex items-center gap-3 p-3 bg-white border border-charcoal/10 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center flex-shrink-0">
                    {SelectedIcon
                        ? <SelectedIcon size={20} />
                        : <span className="text-[10px] text-charcoal/30 font-bold">NONE</span>
                    }
                </div>
                <div>
                    <p className="text-xs font-bold text-charcoal">
                        {value
                            ? icons.find(i => i.name === value)?.label || value
                            : 'No icon selected'}
                    </p>
                    <p className="text-[9px] text-charcoal/30 font-mono">{value || '—'}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/30" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-charcoal/5 rounded-xl pl-9 pr-4 py-2.5 outline-none text-sm placeholder-charcoal/30 focus:ring-2 focus:ring-forest/20 transition-all"
                    placeholder="Search icons..."
                />
            </div>

            {/* Category pills */}
            <div className="flex gap-1.5 flex-wrap">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${
                            activeCategory === cat
                                ? 'bg-forest text-white'
                                : 'bg-charcoal/5 text-charcoal/50 hover:bg-charcoal/10'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Icon grid */}
            <div className="max-h-52 overflow-y-auto custom-scrollbar pr-1">
                {filtered.length === 0 ? (
                    <div className="text-center py-8 text-charcoal/30 text-xs">No icons found</div>
                ) : (
                    <div className="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-8 gap-1.5">
                        {filtered.map(icon => {
                            const IC = getLucideIcon(icon.name);
                            if (!IC) return null;
                            const isSelected = value === icon.name;
                            return (
                                <button
                                    key={icon.name}
                                    onClick={() => onChange(icon.name)}
                                    title={icon.label}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                                        isSelected
                                            ? 'bg-forest text-white border-forest shadow-md shadow-forest/20 scale-105'
                                            : 'bg-white text-charcoal/50 border-charcoal/10 hover:border-forest/30 hover:text-forest hover:bg-forest/5'
                                    }`}
                                >
                                    <IC size={18} />
                                    <span className="text-[7px] font-bold uppercase leading-tight text-center line-clamp-2">{icon.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
