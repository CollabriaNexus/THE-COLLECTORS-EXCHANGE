import React from 'react';
import Bullet from '../components/Bullet';

const Terms = () => {
    return (
        <div className="min-h-screen bg-heritage-cream text-heritage-charcoal py-24 px-6 md:px-12 lg:px-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-16 border-b border-heritage-bronze/10 pb-12">
                    <span className="text-luxury-gold text-xs font-bold tracking-[0.4em] uppercase mb-4 block">Institutional Framework</span>
                    <h1 className="text-5xl md:text-6xl font-serif font-normal mb-6 tracking-tight">Custodianship Agreement</h1>
                    <p className="text-heritage-charcoal/50 font-sans text-sm tracking-widest uppercase">Effective Date: 31st December 2025</p>
                    <div className="w-20 h-0.5 bg-luxury-gold/40 mt-8"></div>
                </div>

                {/* Introduction */}
                <div className="mb-16 font-serif italic text-xl text-heritage-charcoal/80 leading-relaxed border-l-2 border-luxury-gold/20 pl-8">
                    <p>
                        "This agreement establishes the professional protocols and ethical mandates for the stewardship, verification, and exchange of heritage assets within the House of Heritage archive."
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-16 font-sans text-heritage-charcoal/80">
                    <section>
                        <h2 className="text-2xl font-serif font-semibold mb-6 text-heritage-charcoal tracking-wide uppercase text-xs tracking-[0.2em]">01. Nature of the Registry</h2>
                        <p className="mb-4 leading-relaxed">The House of Heritage (formerly The Collectors’ Exchange) operates as a sovereign archival registry for heritage assets, provenance-backed horology, and cultural artefacts.</p>
                        <p className="mb-4 leading-relaxed">All entries into the registry are subject to institutional verification and are stewarded by:</p>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start gap-4">
                                <Bullet className="text-luxury-gold mt-1.5" />
                                <span>The Institution as the primary repository</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <Bullet className="text-luxury-gold mt-1.5" />
                                <span>Sovereign Stewards (Private Collectors)</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <Bullet className="text-luxury-gold mt-1.5" />
                                <span>Archival Originators (Creators and Heritage Brands)</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-semibold mb-6 text-heritage-charcoal tracking-wide uppercase text-xs tracking-[0.2em]">02. Verification Protocols</h2>
                        <p className="mb-4 leading-relaxed">Every asset submitted for registration undergoes a rigorous multi-stage authentication process to establish historical continuity and provenance.</p>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start gap-4">
                                <Bullet className="text-luxury-gold mt-1.5" />
                                <span>Physical Archive Inspection</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <Bullet className="text-luxury-gold mt-1.5" />
                                <span>Provenance Documentation Audit</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <Bullet className="text-luxury-gold mt-1.5" />
                                <span>Sovereign Verification Marking</span>
                            </li>
                        </ul>
                        <p className="text-sm italic opacity-60">Verification reflects a professional archival opinion based on the historical evidence provided at the time of entry.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-semibold mb-6 text-heritage-charcoal tracking-wide uppercase text-xs tracking-[0.2em]">03. Stewardship Responsibilities</h2>
                        <p className="mb-4 leading-relaxed">Stewards (Sellers) warrant the absolute accuracy of the provenance provided and the legal right to transfer custodianship of the heritage asset.</p>
                        <p className="mb-4 leading-relaxed">Acquirers (Buyers) acknowledge that they are assuming the role of custodian for a historical asset, subject to the preservation standards of the institution.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-semibold mb-6 text-heritage-charcoal tracking-wide uppercase text-xs tracking-[0.2em]">04. Archival Fees & Transfers</h2>
                        <p className="mb-4 leading-relaxed">All transfers of custodianship involve archival processing fees, verification costs, and secure heritage transport arrangements, as disclosed during the acquisition process.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-semibold mb-6 text-heritage-charcoal tracking-wide uppercase text-xs tracking-[0.2em]">05. Governing Mandate</h2>
                        <p className="mb-4 leading-relaxed">This agreement is governed by the sovereign laws of the jurisdiction of operation. Any disputes regarding historical misrepresentation or inauthenticity are subject to the Institution's internal Archival Audit Board.</p>
                    </section>
                </div>

                {/* Footer Note */}
                <div className="mt-24 pt-12 border-t border-heritage-bronze/10 text-center">
                    <p className="font-serif italic text-heritage-charcoal/40 text-lg">
                        "Integrity is the bedrock of heritage."
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Terms;
