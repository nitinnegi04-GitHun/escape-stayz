'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getLucideIcon, ALL_LUCIDE_ICON_NAMES } from '../../lib/lucideAll';
import { HOTEL_ICONS } from './hotelIcons';

interface IconEntry {
    id: string;
    name: string;
    label: string;
    category: string;
}

const DEFAULT_CATEGORIES = [
    'Connectivity', 'Food & Drink', 'Room', 'Bathroom', 'Climate',
    'Travel', 'Nature', 'Recreation', 'Services', 'Luxury'
];

export function IconRegistry() {
    const [icons, setIcons] = useState<IconEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Add/Edit modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingIcon, setEditingIcon] = useState<IconEntry | null>(null);
    const [form, setForm] = useState({ name: '', label: '', category: '' });
    const [iconSearch, setIconSearch] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchIcons = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('icon_registry')
                .select('*')
                .order('category')
                .order('label');
            if (error) throw error;
            setIcons(data || []);
        } catch {
            setIcons([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchIcons(); }, []);

    const openAdd = () => {
        setEditingIcon(null);
        setForm({ name: '', label: '', category: '' });
        setIconSearch('');
        setModalOpen(true);
    };

    const openEdit = (icon: IconEntry) => {
        setEditingIcon(icon);
        setForm({ name: icon.name, label: icon.label, category: icon.category });
        setIconSearch('');
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.label || !form.category) return;
        setIsSaving(true);
        try {
            if (editingIcon) {
                const { error } = await supabase
                    .from('icon_registry')
                    .update({ name: form.name, label: form.label, category: form.category })
                    .eq('id', editingIcon.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('icon_registry')
                    .upsert({ name: form.name, label: form.label, category: form.category }, { onConflict: 'name' });
                if (error) throw error;
            }
            setModalOpen(false);
            fetchIcons();
        } catch (err: any) {
            const isDuplicate = err.message?.includes('duplicate key') || err.code === '23505';
            alert(isDuplicate
                ? `An icon named "${form.name}" already exists. Choose a different icon name or edit the existing one.`
                : `Error saving icon: ${err.message}`
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (icon: IconEntry) => {
        if (!confirm(`Remove "${icon.label}" from the registry?`)) return;
        const { error } = await supabase.from('icon_registry').delete().eq('id', icon.id);
        if (!error) fetchIcons();
    };

    const seedFromDefaults = async () => {
        if (!confirm('Seed the registry with all built-in icons? This will add any missing ones.')) return;
        const inserts = HOTEL_ICONS.map(i => ({ name: i.name, label: i.label, category: i.category }));
        const { error } = await supabase.from('icon_registry').upsert(inserts, { onConflict: 'name' });
        if (!error) fetchIcons();
        else alert(`Seed error: ${error.message}`);
    };

    // Filter icons for the main list
    const filtered = icons.filter(i =>
        !search || i.label.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase())
    );

    // All Lucide icon names filtered by search in modal (show top 80)
    const lucideFiltered = iconSearch
        ? ALL_LUCIDE_ICON_NAMES.filter(n => n.toLowerCase().includes(iconSearch.toLowerCase())).slice(0, 80)
        : ALL_LUCIDE_ICON_NAMES.slice(0, 80);

    const categories = Array.from(new Set(icons.map(i => i.category))).sort();

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-charcoal/5">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-heading text-charcoal">Icon Registry</h3>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40 mt-1">{icons.length} Icons in Registry</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={seedFromDefaults}
                        className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-charcoal/10 text-charcoal/50 hover:bg-charcoal/5 transition-all"
                    >
                        Seed Defaults
                    </button>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 bg-forest text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-forest/20 hover:scale-105 transition-all"
                    >
                        <Plus size={13} /> Add Icon
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-5">
                <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search icons..."
                    className="w-full bg-[#f8f9fa] rounded-xl pl-10 pr-4 py-3 outline-none text-sm placeholder-charcoal/30 focus:ring-1 focus:ring-forest/20 transition-all"
                />
            </div>

            {loading ? (
                <div className="text-center py-12 text-charcoal/40 text-sm">Loading...</div>
            ) : icons.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-charcoal/10 rounded-2xl">
                    <p className="text-charcoal/30 text-xs font-bold uppercase tracking-widest mb-3">No icons yet</p>
                    <button onClick={seedFromDefaults} className="text-forest text-xs font-bold underline">Seed built-in icons</button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {filtered.map(icon => {
                        const IC = getLucideIcon(icon.name);
                        return (
                            <div key={icon.id} className="group flex flex-col bg-[#f8f9fa] rounded-xl p-4 border border-transparent hover:border-forest/20 hover:bg-white hover:shadow-md transition-all">
                                {/* Icon */}
                                <div className="w-10 h-10 rounded-xl bg-white border border-charcoal/5 text-forest flex items-center justify-center shadow-sm mb-3">
                                    {IC ? <IC size={20} /> : <span className="text-[9px] text-charcoal/30 font-bold">?</span>}
                                </div>
                                {/* Text */}
                                <p className="text-xs font-bold text-charcoal leading-tight mb-0.5">{icon.label}</p>
                                <p className="text-[9px] text-charcoal/40 mb-3">{icon.category}</p>
                                {/* Buttons */}
                                <div className="flex gap-1.5 mt-auto">
                                    <button onClick={() => openEdit(icon)} className="flex-1 h-7 rounded-lg bg-white border border-charcoal/10 text-charcoal/40 hover:text-forest hover:border-forest/30 flex items-center justify-center transition-colors">
                                        <Pencil size={11} />
                                    </button>
                                    <button onClick={() => handleDelete(icon)} className="flex-1 h-7 rounded-lg bg-white border border-red-100 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 flex items-center justify-center transition-colors">
                                        <Trash2 size={11} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add / Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-md" onClick={() => setModalOpen(false)} />
                    <div className="bg-white w-full max-w-2xl rounded-3xl relative z-10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="px-8 pt-8 pb-5 border-b border-charcoal/5 flex items-center justify-between">
                            <h4 className="text-xl font-serif font-bold text-charcoal">{editingIcon ? 'Edit Icon' : 'Add Icon'}</h4>
                            <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full bg-charcoal/5 text-charcoal/40 hover:bg-charcoal/10 flex items-center justify-center transition-colors">
                                <X size={14} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5 custom-scrollbar">

                            {/* Selected Preview */}
                            <div className="flex items-center gap-4 p-4 bg-[#f8f9fa] rounded-2xl border border-charcoal/5">
                                <div className="w-14 h-14 rounded-xl bg-white border border-charcoal/10 text-forest flex items-center justify-center flex-shrink-0 shadow-sm">
                                    {form.name && getLucideIcon(form.name)
                                        ? React.createElement(getLucideIcon(form.name)!, { size: 26 })
                                        : <span className="text-[9px] text-charcoal/30 font-bold text-center leading-tight">SELECT<br />ICON</span>
                                    }
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-charcoal text-sm">{form.name || 'No icon selected'}</p>
                                    <p className="text-[10px] text-charcoal/40 font-mono mt-0.5">{form.label || '—'}</p>
                                </div>
                                {form.name && getLucideIcon(form.name) && (
                                    <div className="w-6 h-6 rounded-full bg-forest flex items-center justify-center">
                                        <Check size={12} className="text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Label & Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40">Label</label>
                                    <input
                                        type="text"
                                        value={form.label}
                                        onChange={e => setForm({ ...form, label: e.target.value })}
                                        placeholder="e.g. Swimming Pool"
                                        className="w-full bg-[#f8f9fa] rounded-xl px-4 py-3 outline-none text-sm font-medium focus:ring-1 focus:ring-forest/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40">Category</label>
                                    <input
                                        type="text"
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                        placeholder="e.g. Recreation"
                                        list="category-suggestions"
                                        className="w-full bg-[#f8f9fa] rounded-xl px-4 py-3 outline-none text-sm font-medium focus:ring-1 focus:ring-forest/20 transition-all"
                                    />
                                    <datalist id="category-suggestions">
                                        {[...DEFAULT_CATEGORIES, ...categories].filter((v, i, a) => a.indexOf(v) === i).map(c => (
                                            <option key={c} value={c} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            {/* Icon Search from all Lucide icons */}
                            <div className="space-y-3">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40">
                                    Pick Icon — All Lucide Icons ({ALL_LUCIDE_ICON_NAMES.length} available)
                                </label>
                                <div className="relative">
                                    <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/30" />
                                    <input
                                        type="text"
                                        value={iconSearch}
                                        onChange={e => setIconSearch(e.target.value)}
                                        placeholder="Search all Lucide icons..."
                                        className="w-full bg-[#f8f9fa] rounded-xl pl-9 pr-4 py-2.5 outline-none text-sm placeholder-charcoal/30 focus:ring-1 focus:ring-forest/20 transition-all"
                                    />
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 pr-1">
                                        {lucideFiltered.map(iconName => {
                                            const IC = getLucideIcon(iconName);
                                            if (!IC) return null;
                                            const isSelected = form.name === iconName;
                                            return (
                                                <button
                                                    key={iconName}
                                                    onClick={() => setForm({ ...form, name: iconName, label: form.label || iconName })}
                                                    title={iconName}
                                                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                                                        isSelected
                                                            ? 'bg-forest text-white border-forest shadow-md scale-105'
                                                            : 'bg-white text-charcoal/50 border-charcoal/10 hover:border-forest/30 hover:text-forest hover:bg-forest/5'
                                                    }`}
                                                >
                                                    <IC size={18} />
                                                    <span className="text-[7px] font-bold uppercase leading-tight text-center line-clamp-2">{iconName}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                {!iconSearch && <p className="text-[9px] text-charcoal/30">Showing first 80 — type to search all {ALL_LUCIDE_ICON_NAMES.length}</p>}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-5 border-t border-charcoal/5 flex gap-3">
                            <button onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] text-charcoal/40 hover:bg-charcoal/5 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !form.name || !form.label || !form.category || !getLucideIcon(form.name)}
                                className="flex-1 bg-forest text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-forest/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Saving...' : editingIcon ? 'Update Icon' : 'Add to Registry'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}
