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

                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-heritage-charcoal font-bold uppercase tracking-wide leading-snug mb-10 max-w-3xl mx-auto">
                        To be the global bridge for the "Truth of Heritage."
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
