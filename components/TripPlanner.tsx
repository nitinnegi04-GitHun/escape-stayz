
'use client';

import React, { useState } from 'react';
import { generateTripPlan } from '../services/geminiService';
import { TripPlan } from '../types';
import { Button } from './ui/Button';

export const TripPlanner = () => {
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState<TripPlan | null>(null);
    const [formData, setFormData] = useState({
        destination: '',
        duration: '3 days',
        budget: 'Luxury',
        interests: [] as string[]
    });

    const availableInterests = ['Fine Dining', 'Adventure', 'Alpine History', 'Wellness', 'Architecture', 'Photography', 'Night Skies', 'Wilderness'];

    const toggleInterest = (interest: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.destination) return;

        setLoading(true);
        try {
            const result = await generateTripPlan(
                formData.destination,
                formData.duration,
                formData.budget,
                formData.interests
            );
            setPlan(result);
        } catch (err) {
            alert("Consultation failed. The alpine winds are turbulent. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen py-24">
            <div className="container mx-auto px-6 max-w-7xl">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">

                    {/* Form Section */}
                    <div className="lg:col-span-5">
                        <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 sticky top-32">
                            <div className="mb-10 text-center">
                                <span className="text-terracotta font-bold uppercase tracking-[0.2em] text-[10px] mb-4 block text-center">Begin Your Journey</span>
                                <h2 className="text-3xl font-heading font-bold text-forest">Design Your Escape</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-bold text-forest uppercase tracking-widest pl-2">Where to?</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Spiti Valley, Kyoto..."
                                        className="w-full bg-white border-transparent focus:border-terracotta focus:ring-0 rounded-2xl px-6 py-4 font-light text-forest placeholder-charcoal/30 transition-all shadow-sm"
                                        value={formData.destination}
                                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-bold text-forest uppercase tracking-widest pl-2">Duration</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-white border-transparent focus:border-terracotta focus:ring-0 rounded-2xl px-6 py-4 font-light text-forest transition-all shadow-sm appearance-none cursor-pointer"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        >
                                            <option>Weekend Retreat</option>
                                            <option>3 days</option>
                                            <option>5 days</option>
                                            <option>1 week Stay</option>
                                        </select>
                                        <i className="fas fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none"></i>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-bold text-forest uppercase tracking-widest pl-2">Experience Level</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Economic', 'Comfort', 'Luxury'].map(b => (
                                            <button
                                                key={b}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, budget: b })}
                                                className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${formData.budget === b ? 'bg-forest text-white border-forest shadow-lg' : 'bg-white text-charcoal/40 border-transparent hover:border-forest/10'}`}
                                            >
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-bold text-forest uppercase tracking-widest pl-2">Interests</label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableInterests.map(interest => (
                                            <button
                                                key={interest}
                                                type="button"
                                                onClick={() => toggleInterest(interest)}
                                                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${formData.interests.includes(interest) ? 'bg-terracotta text-white border-terracotta' : 'bg-white text-charcoal/40 border-transparent hover:bg-white hover:text-terracotta'}`}
                                            >
                                                {interest}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    variant="secondary"
                                    disabled={loading}
                                    className="py-5 px-12"
                                    showIcon={!loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <i className="fas fa-circle-notch fa-spin"></i> Synthesizing...
                                        </span>
                                    ) : 'Generate Itinerary'}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="lg:col-span-7">
                        {!plan && !loading && (
                            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-100 rounded-[50px]">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 text-gray-300">
                                    <i className="fas fa-compass text-4xl"></i>
                                </div>
                                <h3 className="text-3xl font-heading font-bold mb-4 text-forest">Awaiting your vision</h3>
                                <p className="text-charcoal/40 max-w-sm leading-relaxed font-light">
                                    Share your preferences, and our intelligence will craft a bespoke narrative for your journey.
                                </p>
                            </div>
                        )}

                        {loading && (
                            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 space-y-8 animate-pulse">
                                <div className="w-20 h-20 bg-gray-100 rounded-full"></div>
                                <div className="h-4 bg-gray-100 rounded w-64"></div>
                                <div className="h-3 bg-gray-100 rounded w-48"></div>
                            </div>
                        )}

                        {plan && !loading && (
                            <div className="space-y-12 animate-fade-in-up">
                                {/* Result Header */}
                                <div className="bg-forest text-white p-10 md:p-12 rounded-[50px] shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="relative z-10">
                                        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                                            <div>
                                                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight">{plan.destination}</h2>
                                                <p className="text-white/60 font-bold uppercase tracking-[0.2em] text-[10px]">
                                                    {plan.duration} • {plan.budget} Experience
                                                </p>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                                                <i className="fas fa-check-circle text-terracotta"></i>
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Itinerary Ready</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {plan.interests.map(i => (
                                                <span key={i} className="bg-white/5 px-3 py-1 rounded-full text-[9px] uppercase font-bold text-white/80 border border-white/10 tracking-widest hover:bg-white/10 transition-colors">
                                                    {i}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="relative border-l-2 border-dashed border-gray-200 ml-8 md:ml-12 pl-12 space-y-12 py-4">
                                    {plan.itinerary.map((day, idx) => (
                                        <div key={day.day || idx} className="relative">
                                            <div className="absolute -left-[67px] md:-left-[69px] top-0 w-10 h-10 md:w-12 md:h-12 bg-terracotta text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg ring-4 ring-white">
                                                {idx + 1}
                                            </div>
                                            <div className="bg-white p-8 rounded-[30px] shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                                                <h4 className="text-xl font-bold text-forest mb-3 font-heading">{day.activity}</h4>
                                                <p className="text-charcoal/60 leading-relaxed font-light text-sm">{day.details}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Recommendations */}
                                <div className="bg-cream p-10 rounded-3xl">
                                    <h4 className="font-heading font-bold text-2xl text-forest mb-8 flex items-center gap-3">
                                        <i className="fas fa-star text-terracotta"></i> Curated Recommendations
                                    </h4>
                                    <ul className="grid grid-cols-1 gap-4">
                                        {plan.recommendations.map((rec, idx) => (
                                            <li key={idx} className="flex items-start gap-4 text-charcoal/70 text-sm font-light leading-relaxed bg-white p-4 rounded-2xl shadow-sm">
                                                <span className="w-1.5 h-1.5 bg-terracotta rounded-full mt-2 flex-shrink-0"></span>
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
