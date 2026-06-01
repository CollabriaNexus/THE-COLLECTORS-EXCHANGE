import React from 'react';
import { Landmark, ShieldCheck, History, Sparkles } from 'lucide-react';

const InstitutionalIcon = () => (
    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="3" fill="#D4AF37" />
        </svg>
    </div>
);

const DiamondBullet = () => (
    <div className="mt-1.5 flex-shrink-0">
        <svg width="9" height="9" viewBox="0 0 24 24" className="text-luxury-gold">
            <rect x="12" y="0" width="16.97" height="16.97" transform="rotate(45 12 0)" fill="#D4AF37" />
        </svg>
    </div>
);

const Vision = () => {
    return (
        <div className="min-h-screen bg-heritage-cream text-heritage-charcoal font-sans overflow-hidden">

            {/* Vision Hero & Statement Section */}
            <section className="relative pt-32 pb-24 px-6 bg-heritage-cream">
                <div className="container mx-auto max-w-4xl text-center">
                    <div className="flex items-center justify-center gap-6 mb-8 mt-12">
                        <div className="w-12 h-[1px] bg-luxury-gold/50"></div>
                        <span className="text-luxury-gold tracking-[0.2em] font-sans text-xs font-bold uppercase">
                            Our Collective Purpose
                        </span>
                        <div className="w-12 h-[1px] bg-luxury-gold/50"></div>
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif mb-12 text-heritage-charcoal">
                        Our <span className="italic text-luxury-gold">Vision</span>
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

                    <div className="w-full max-w-4xl mx-auto h-[1px] bg-heritage-bronze/10 mb-12"></div>

                    <div className="space-y-8 text-lg md:text-xl text-heritage-charcoal font-serif italic font-bold leading-relaxed max-w-3xl mx-auto mb-16">
                        <p>
                            We aren't here for the exit; we're here for the century. We draw inspiration from a time when value was measured not by price, but by the ability to be carried forward across generations.
                        </p>
                        <p>
                            Our goal is to restore the trust that has been lost in the pre-owned market and become the definitive destination where every collector can find their piece of history, backed by a handshake of absolute integrity.
                        </p>
                    </div>

                    <div className="bg-white border-l-4 border-luxury-gold p-8 md:p-10 shadow-sm max-w-3xl mx-auto text-center">
                        <p className="text-xl md:text-2xl font-serif text-heritage-charcoal font-bold">
                            "We ensure that legacy is given a future worthy of its past."
                        </p>
                    </div>
                </div>
            </section>

            {/* Three Pillars of Vision */}
            <section className="py-24 px-6 bg-heritage-cream border-y border-heritage-bronze/10">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="bg-white p-12 border border-heritage-bronze/10 group hover:border-luxury-gold transition-all duration-500 shadow-sm">
                            <History className="text-luxury-gold w-12 h-12 mb-8 group-hover:scale-110 transition-transform duration-500" strokeWidth={1} />
                            <h3 className="text-xl font-serif mb-6 text-heritage-charcoal uppercase tracking-widest">Global Access</h3>
                            <p className="text-sm text-heritage-charcoal/70 leading-relaxed font-medium">
                                Bringing the hidden treasures of India's street markets to the world's most discerning collectors.
                            </p>
                        </div>
                        <div className="bg-white p-12 border border-heritage-bronze/10 group hover:border-luxury-gold transition-all duration-500 shadow-sm">
                            <ShieldCheck className="text-luxury-gold w-12 h-12 mb-8 group-hover:scale-110 transition-transform duration-500" strokeWidth={1} />
                            <h3 className="text-xl font-serif mb-6 text-heritage-charcoal uppercase tracking-widest">Digital Integrity</h3>
                            <p className="text-sm text-heritage-charcoal/70 leading-relaxed font-medium">
                                Using technology to verify provenance and ensure every transaction is rooted in absolute transparency.
                            </p>
                        </div>
                        <div className="bg-white p-12 border border-heritage-bronze/10 group hover:border-luxury-gold transition-all duration-500 shadow-sm">
                            <Landmark className="text-luxury-gold w-12 h-12 mb-8 group-hover:scale-110 transition-transform duration-500" strokeWidth={1} />
                            <h3 className="text-xl font-serif mb-6 text-heritage-charcoal uppercase tracking-widest">Heritage Trust</h3>
                            <p className="text-sm text-heritage-charcoal/70 leading-relaxed font-medium">
                                Establishing an institutional registry that protects the legacy of every artifact we touch.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Collectors Section — NO image */}
            <section className="py-32 px-6 bg-white relative">
                {/* Archival Marker */}
                <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden xl:block">
                    <div className="flex flex-col items-center gap-8">
                        <div className="w-px h-24 bg-heritage-bronze/20"></div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-heritage-charcoal/20 [writing-mode:vertical-rl] rotate-180">EXT.01</span>
                        <div className="w-px h-24 bg-heritage-bronze/20"></div>
                    </div>
                </div>

                <div className="container mx-auto max-w-4xl">
                    <div className="flex items-center gap-4 mb-10">
                        <InstitutionalIcon />
                        <h2 className="text-3xl md:text-4xl font-serif text-heritage-charcoal tracking-tight">For Collectors</h2>
                    </div>

                    <div className="space-y-6 mb-12">
                        <p className="text-2xl font-serif italic text-heritage-charcoal leading-relaxed">
                            For collectors, The Collectors' Exchange is a sanctuary.
                        </p>
                        <p className="text-lg text-heritage-charcoal/70 font-sans leading-relaxed">
                            A place built by people who understand the discipline, patience, and emotional commitment required to collect with purpose. Every collection represents years of intention, research, restraint, and passion.
                        </p>
                    </div>

                    {/* Highlight Box */}
                    <div className="bg-heritage-cream/60 border-l-2 border-luxury-gold p-8 md:p-10 space-y-7">
                        <p className="text-lg font-serif italic text-heritage-charcoal font-medium">
                            Our vision is to create an environment where collectors can:
                        </p>
                        <ul className="space-y-5">
                            {[
                                "Discover and exchange meaningful objects with confidence",
                                "Pursue their passion without fear of fraud, misrepresentation, or compromise",
                                "Trust that authenticity, provenance, and integrity are the foundation of every transaction"
                            ].map((item, index) => (
                                <li key={index} className="flex items-start gap-4 text-sm text-heritage-charcoal/80 font-sans leading-snug">
                                    <DiamondBullet />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* For Originators Section — NO image */}
            <section className="py-32 px-6 bg-heritage-cream/20 relative">
                {/* Archival Marker */}
                <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:block">
                    <div className="flex flex-col items-center gap-8">
                        <div className="w-px h-24 bg-heritage-bronze/20"></div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-heritage-charcoal/20 [writing-mode:vertical-rl]">EXT.02</span>
                        <div className="w-px h-24 bg-heritage-bronze/20"></div>
                    </div>
                </div>

                <div className="container mx-auto max-w-4xl">
                    <div className="flex items-center gap-4 mb-10">
                        <InstitutionalIcon />
                        <h2 className="text-3xl md:text-4xl font-serif text-heritage-charcoal tracking-tight">For Originators</h2>
                    </div>

                    <div className="space-y-6 mb-12">
                        <p className="text-2xl font-serif italic text-heritage-charcoal leading-relaxed">
                            For the originators, we are the bridge to a global legacy.
                        </p>
                        <p className="text-lg text-heritage-charcoal/70 font-sans leading-relaxed">
                            We honor the craftsmen, the sellers, and the families who have preserved these treasures. Our platform ensures that their dedication is recognized and rewarded by connecting them directly with those who value history most.
                        </p>
                    </div>

                    {/* Highlight Box */}
                    <div className="bg-white border-l-2 border-luxury-gold p-8 md:p-10 space-y-7">
                        <p className="text-lg font-serif italic text-heritage-charcoal font-medium">
                            Our vision is to create a marketplace where originators can:
                        </p>
                        <ul className="space-y-5">
                            {[
                                "Present their heritage to a global audience of dedicated custodians",
                                "Receive fair and transparent value for their historical treasures",
                                "Contribute to the preservation of cultural legacy through authorized exchange"
                            ].map((item, index) => (
                                <li key={index} className="flex items-start gap-4 text-sm text-heritage-charcoal/80 font-sans leading-snug">
                                    <DiamondBullet />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Final Vision Statement */}
            <section className="py-32 bg-heritage-charcoal text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <Landmark className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px]" strokeWidth={0.5} />
                </div>
                <div className="relative z-10 container mx-auto px-6 max-w-3xl">
                    <Sparkles className="text-luxury-gold w-12 h-12 mx-auto mb-10 opacity-50" strokeWidth={1} />
                    <h2 className="text-3xl md:text-5xl font-serif mb-12 italic leading-tight">
                        "To ensure that history remains not just a memory, but a tangible legacy that can be held, shared, and passed forward."
                    </h2>
                    <div className="w-16 h-px bg-luxury-gold/50 mx-auto"></div>
                </div>
            </section>

        </div>
    );
};

export default Vision;
