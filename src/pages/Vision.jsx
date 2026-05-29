import React from 'react';
import collectorsStudy from '../assets/collectors_study.png';
import artisanAtWork from '../assets/artisan2.png';
import { Landmark, Compass, ShieldCheck, History, Heart, Users } from 'lucide-react';
import Bullet from '../components/Bullet';

const Vision = () => {
    return (
        <div className="min-h-screen bg-[#FDFDFD] text-[#1A1816] font-light overflow-hidden">
            {/* Intro / Hero Section */}
            <section className="relative pt-4 pb-12 px-6 overflow-hidden border-b border-[#C9A962]/10 bg-[#fbfaf8]">
                {/* Architectural Backdrop */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="vision-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#C9A962" strokeWidth="0.5" />
                                <circle cx="0" cy="0" r="0.5" fill="#C9A962" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#vision-grid)" />
                    </svg>
                </div>

                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-8 h-px bg-[#C9A962]"></div>
                        <span className="text-[9px] uppercase tracking-[0.4em] text-[#C9A962] font-black">Our Collective Purpose</span>
                        <div className="w-8 h-px bg-[#C9A962]"></div>
                    </div>

                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif mb-4 tracking-tight leading-tight text-[#1A1816]">
                        Our <span className="text-[#C9A962] italic font-normal">Vision</span>
                    </h1>

                    <div className="relative max-w-3xl mx-auto">
                        <div className="absolute -left-6 top-0 w-px h-full bg-gradient-to-b from-[#C9A962]/40 via-[#C9A962]/10 to-transparent hidden md:block"></div>
                        <div className="space-y-4 text-sm sm:text-base lg:text-lg font-serif italic leading-relaxed text-[#4A443E]">
                            <p className="text-lg sm:text-xl lg:text-2xl text-[#1A1816] font-medium not-italic mb-6 border-b border-[#C9A962]/10 pb-6">
                                To restore integrity to the world of collectibles by eliminating cheap quality in favor of authentic Indian heritage.
                            </p>
                            <div className="pl-0 md:pl-6 space-y-4">
                                <p>
                                    We are building the world's most trusted bridge from the local streets to the global collector, honoring the craftsmanship of our ancestors while securing history for the generations to come.
                                </p>
                                <p className="text-base sm:text-lg lg:text-xl font-medium text-[#1A1816] border-l-2 border-[#C9A962]/20 pl-6 py-2 bg-[#F9F7F4]/50 not-italic">
                                    We draw inspiration from ancient India, a time when objects were not discarded, but preserved; when possessions were not replaced, but respected; and when value was measured not by price, but by the ability to be carried forward across generations.
                                </p>
                                <p>
                                    In a world driven by speed and excess, we believe it is time to pause, to protect every lantern that once lit a home, every radio that carried voices across decades, every gramophone that captured moments in time, and every timepiece handed down by a grandparent with quiet pride.
                                </p>
                            </div>
                            <div className="pt-4 pl-0 sm:pl-6 not-italic">
                                <p className="text-base sm:text-lg lg:text-xl font-medium text-[#1A1816] border-l-2 border-[#C9A962]/20 pl-6 py-2 bg-[#F9F7F4]/50">
                                    Our vision is to ensure that such objects are not lost to neglect, imitation, or indifference, but are given a future worthy of their past.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-32 border border-[#C9A962]/5 rounded-full -translate-x-1/2"></div>
                <div className="absolute bottom-0 right-0 w-44 h-44 bg-[#C9A962]/5 rounded-tl-full blur-2xl"></div>
            </section>

            {/* For Collectors Section */}
            <section className="py-10 px-6 bg-white relative overflow-hidden">
                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="grid lg:grid-cols-12 gap-10 items-center">
                        <div className="lg:col-span-1 hidden lg:flex flex-col items-center gap-6 opacity-30">
                            <span className="text-[8px] uppercase tracking-[0.3em] font-bold rotate-90 whitespace-nowrap">EXT.01</span>
                            <div className="w-px h-16 bg-[#1A1816]"></div>
                        </div>

                        <div className="lg:col-span-5 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full border border-[#C9A962] flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-[#C9A962] rounded-full"></div>
                                </div>
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#1A1816]">For Collectors</h2>
                            </div>

                            <div className="space-y-4 text-[#4A443E] leading-relaxed text-sm lg:text-base font-light">
                                <p className="text-base sm:text-lg lg:text-xl font-serif italic text-[#1A1816] border-b border-[#C9A962]/5 pb-2">
                                    For collectors, The Collectors’ Exchange is a sanctuary.
                                </p>
                                <p>
                                    A place built by people who understand the discipline, patience, and emotional commitment required to collect with purpose. Every collection represents years of intention, research, restraint, and passion.
                                </p>
                                <div className="bg-[#F9F7F4] p-6 border border-[#C9A962]/10 rounded-sm shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-[2px] h-full bg-[#C9A962]"></div>
                                    <p className="mb-4 font-serif italic text-base md:text-lg text-[#1A1816]">Our vision is to create an environment where collectors can:</p>
                                    <ul className="space-y-3">
                                        {[
                                            "Discover and exchange meaningful objects with confidence",
                                            "Pursue their passion without fear of fraud, misrepresentation, or compromise",
                                            "Trust that authenticity, provenance, and integrity are never optional"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2.5 group text-xs md:text-sm">
                                                <Bullet className="text-[#C9A962] mt-0.5" />
                                                <span className="text-[#6B635B] group-hover:text-[#1A1816] transition-colors">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <p className="font-serif italic text-lg md:text-xl text-[#1A1816] pt-2 flex items-center gap-3">
                                    <div className="w-8 h-px bg-[#C9A962]/40"></div>
                                    Here, collectors are custodians of history.
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-6 relative">
                            <div className="relative z-10 p-1 bg-white border border-[#C9A962]/20 shadow-[-10px_10px_30px_rgba(0,0,0,0.05)] rounded-sm group overflow-hidden">
                                <img
                                    src={collectorsStudy}
                                    alt="Collector's Study"
                                    className="w-full h-[250px] sm:h-[350px] lg:h-[500px] object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816]/20 to-transparent"></div>
                            </div>
                            {/* Decorative Archival Label */}
                            <div className="absolute -bottom-3 -right-3 p-4 bg-[#1A1816] text-[#C9A962] z-20 shadow-xl">
                                <div className="text-[7px] uppercase tracking-[0.2em] font-bold">Reference</div>
                                <div className="text-base font-serif italic">Unit.01</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Brands & Creators Section */}
            <section className="py-10 px-6 bg-[#F9F7F4] relative overflow-hidden border-y border-[#C9A962]/10">
                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="grid lg:grid-cols-12 gap-10 items-center">
                        <div className="lg:col-span-6 order-2 lg:order-1 relative">
                            <div className="relative z-10 p-1 bg-white border border-[#C9A962]/20 shadow-[10px_10px_30px_rgba(0,0,0,0.05)] rounded-sm group overflow-hidden">
                                <img
                                    src={artisanAtWork}
                                    alt="Artisan at Work"
                                    className="w-full h-[250px] sm:h-[350px] lg:h-[500px] object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816]/20 to-transparent"></div>
                            </div>
                            {/* Decorative Frame */}
                            <div className="absolute -top-6 -left-6 w-24 h-24 border border-[#C9A962]/10 rounded-full animate-pulse"></div>
                        </div>

                        <div className="lg:col-span-5 order-1 lg:order-2 space-y-5">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#1A1816]">For Brands & Creators</h2>
                                <div className="w-5 h-5 rounded-full border border-[#C9A962] flex items-center justify-center">
                                    <div className="w-1 h-1 bg-[#C9A962] rounded-full"></div>
                                </div>
                            </div>

                            <div className="space-y-4 text-[#4A443E] leading-relaxed text-sm lg:text-base font-light">
                                <p className="text-base sm:text-lg lg:text-xl font-serif italic text-[#1A1816] border-b border-[#C9A962]/5 pb-2">
                                    We believe the secondary market should not diminish creation: it should honour it.
                                </p>
                                <p>
                                    For brands and creators who produce limited works, rare editions, or culturally significant pieces, The Collectors’ Exchange is a modern online museum: a place where intent and originality are preserved long after the first sale.
                                </p>
                                <div className="bg-white p-6 border border-[#C9A962]/10 rounded-sm shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-[2px] h-full bg-[#C9A962]"></div>
                                    <p className="mb-4 font-serif italic text-base md:text-lg text-[#1A1816]">Our vision is to offer:</p>
                                    <ul className="space-y-3">
                                        {[
                                            "A refined platform to showcase limited editions and collectible works",
                                            "A transparent and respectful ecosystem that protects intellectual property",
                                            "A secondary market that strengthens brand legacy rather than eroding it"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 group text-xs md:text-sm text-right justify-end">
                                                <span className="text-[#6B635B] group-hover:text-[#1A1816] transition-colors">{item}</span>
                                                <Bullet className="text-[#C9A962] mt-0.5" />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <p className="font-serif italic text-lg md:text-xl text-[#1A1816] pt-2 flex items-center justify-end gap-3 text-right">
                                    By safeguarding authenticity, we ensure that value flows forward.
                                    <div className="w-8 h-px bg-[#C9A962]/40"></div>
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-1 hidden lg:flex flex-col items-center gap-6 opacity-30 order-3">
                            <span className="text-[8px] uppercase tracking-[0.3em] font-bold rotate-90 whitespace-nowrap">EXT.02</span>
                            <div className="w-px h-16 bg-[#1A1816]"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* A Living Legacy Section */}
            <section className="relative py-12 px-6 bg-[#FDFDFD] text-[#1A1816] text-center overflow-hidden border-t border-[#C9A962]/10">
                {/* Subtle Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#C9A962]/5 rounded-full blur-[60px] -z-0"></div>

                <div className="container mx-auto max-w-4xl relative z-10">
                    <div className="flex justify-center mb-8">
                        <div className="w-14 h-14 rounded-full border border-[#C9A962]/40 flex items-center justify-center bg-white shadow-sm relative">
                            <Landmark className="text-[#1A1816] w-7 h-7" strokeWidth={1} />
                            <div className="absolute inset-0 rounded-full border border-[#C9A962]/20 animate-ping"></div>
                        </div>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif mb-6 text-[#1A1816] tracking-tight">
                        A <span className="text-[#C9A962] italic font-normal">Living Legacy</span>
                    </h2>

                    <div className="space-y-5 text-sm sm:text-base lg:text-lg font-serif italic leading-relaxed text-[#4A443E]">
                        <p className="not-italic text-[#1A1816] font-medium border-b border-[#C9A962]/5 pb-6 mb-6 text-lg sm:text-xl">
                            The Collectors’ Exchange is not merely a marketplace.
                        </p>
                        <div className="space-y-4 text-base md:text-lg">
                            <p>
                                It is an institution in the making, dedicated to preservation, trust, and continuity.
                            </p>
                            <p>
                                We envision a future where every object with meaning finds its rightful place, and where legacy is experienced as something alive.
                            </p>
                        </div>
                        <div className="pt-6">
                            <div className="inline-flex flex-col items-center">
                                <div className="w-12 h-px bg-[#C9A962] mb-4"></div>
                                <p className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#1A1816] tracking-tight font-medium">
                                    That is the future we are building.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Vision;
