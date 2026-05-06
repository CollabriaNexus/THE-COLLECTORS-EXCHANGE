import React from 'react';
import Bullet from '../components/Bullet';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-heritage-cream text-heritage-charcoal py-24 px-6 md:px-12 lg:px-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-16 border-b border-heritage-bronze/10 pb-12">
                    <span className="text-luxury-gold text-xs font-bold tracking-[0.4em] uppercase mb-4 block">Institutional Confidentiality</span>
                    <h1 className="text-5xl md:text-6xl font-serif font-normal mb-6 tracking-tight">Privacy & Discretion Policy</h1>
                    <p className="text-heritage-charcoal/50 font-sans text-sm tracking-widest uppercase">Effective Date: December 31, 2025</p>
                    <div className="w-20 h-0.5 bg-luxury-gold/40 mt-8"></div>
                </div>

                {/* Introduction */}
                <div className="mb-16 font-serif italic text-xl text-heritage-charcoal/80 leading-relaxed border-l-2 border-luxury-gold/20 pl-8">
                    <p>
                        "The protection of identities, the sanctity of provenance, and the discretion of high-value archival transfers are the fundamental commitments of the House of Heritage."
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-16 font-sans text-heritage-charcoal/80">
                    <section>
                        <h2 className="text-2xl font-serif font-semibold mb-6 text-heritage-charcoal tracking-wide uppercase text-xs tracking-[0.2em]">01. The Mandate of Discretion</h2>
                        <p className="mb-4 leading-relaxed">As a sovereign archival registry, we hold the privacy of our stewards and acquirers in the highest regard. We collect only the data necessary for legal verification (KYC/AML) and provenance accuracy.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-semibold mb-6 text-heritage-charcoal tracking-wide uppercase text-xs tracking-[0.2em]">02. Archival Data Collection</h2>
                        <ul className="space-y-4 mb-6">
                            <li className="flex items-start gap-4">
                                <Bullet className="text-luxury-gold mt-1.5" />
                                <div>
                                    <span className="font-bold block mb-1">Identity Records</span>
                                    <p className="text-sm opacity-80">Government-issued identifiers required for sovereign verification and compliance.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <Bullet className="text-luxury-gold mt-1.5" />
                                <div>
                                    <span className="font-bold block mb-1">Provenance Dossiers</span>
                                    <p className="text-sm opacity-80">Historical records, ownership history, and certification documents tied to registered assets.</p>
                                </div>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-semibold mb-6 text-heritage-charcoal tracking-wide uppercase text-xs tracking-[0.2em]">03. Data Stewardship & Security</h2>
                        <p className="mb-4 leading-relaxed">All sensitive archival data is encrypted and stored in secure, sovereign environments. Access is restricted to authorized institutional personnel only.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-semibold mb-6 text-heritage-charcoal tracking-wide uppercase text-xs tracking-[0.2em]">04. Third-Party Disclosures</h2>
                        <p className="mb-4 leading-relaxed">Disclosures are limited to:</p>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start gap-4">
                                <Bullet className="text-luxury-gold mt-1.5" />
                                <span>Authorized Verification Partners (for authentication only)</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <Bullet className="text-luxury-gold mt-1.5" />
                                <span>Legal & Regulatory Authorities (under sovereign mandate)</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-semibold mb-6 text-heritage-charcoal tracking-wide uppercase text-xs tracking-[0.2em]">05. Right to Erasure</h2>
                        <p className="mb-4 leading-relaxed">Stewards may request the de-listing of their personal information from the active registry, subject to historical record-keeping requirements for provenance continuity.</p>
                    </section>
                </div>

                {/* Footer Note */}
                <div className="mt-24 pt-12 border-t border-heritage-bronze/10 text-center">
                    <p className="font-serif italic text-heritage-charcoal/40 text-lg">
                        "Your legacy is protected with absolute discretion."
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
