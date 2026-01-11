import React from 'react';

const Vision = () => {
    return (
        <div className="min-h-screen bg-white text-black">
            {/* Intro Section */}
            <section className="py-20 px-6 md:px-12 lg:px-24 mx-auto max-w-5xl text-center">
                <h1 className="text-4xl md:text-6xl font-serif font-bold uppercase tracking-widest mb-8">
                    Our Vision
                </h1>
                <div className="w-24 h-1 bg-luxury-gold mx-auto mb-12"></div>

                <div className="space-y-6 text-lg md:text-xl font-light leading-relaxed text-gray-700">
                    <p className="font-serif italic text-black font-medium text-2xl mb-6">
                        At The Collectors’ Exchange, our vision is to bring legacy back to life.
                    </p>
                    <p>
                        We draw inspiration from ancient India, a time when objects were not discarded, but preserved; when possessions were not replaced, but respected; and when value was measured not by price, but by the ability to be carried forward across generations.
                    </p>
                    <p>
                        In a world driven by speed and excess, we believe it is time to pause — to protect every lantern that once lit a home, every radio that carried voices across decades, every gramophone that captured moments in time, and every timepiece handed down by a grandparent with quiet pride.
                    </p>
                    <p className="font-medium text-black">
                        Our vision is to ensure that such objects are not lost to neglect, imitation, or indifference — but are given a future worthy of their past.
                    </p>
                </div>
            </section>

            {/* For Collectors Section */}
            <section className="py-20 px-6 md:px-12 lg:px-24 bg-gray-50">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl md:text-4xl font-serif mb-6">For Collectors</h2>
                        <div className="space-y-4 text-gray-600 leading-relaxed font-light">
                            <p className="font-medium text-black text-lg">
                                For collectors, The Collectors’ Exchange is a sanctuary.
                            </p>
                            <p>
                                A place built by people who understand the discipline, patience, and emotional commitment required to collect with purpose. Every collection represents years of intention, research, restraint, and passion.
                            </p>
                            <div className="py-4">
                                <p className="mb-4">Our vision is to create an environment where collectors can:</p>
                                <ul className="space-y-3 pl-4 border-l-2 border-luxury-gold">
                                    <li>Discover and exchange meaningful objects with confidence</li>
                                    <li>Pursue their passion without fear of fraud, misrepresentation, or compromise</li>
                                    <li>Trust that authenticity, provenance, and integrity are never optional</li>
                                </ul>
                            </div>
                            <p className="font-serif italic text-black">
                                Here, collectors are not just participants — they are custodians of history.
                            </p>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 h-80 bg-gray-200 flex items-center justify-center text-gray-400 italic font-serif">
                        [Image Placeholder: Collector's Study]
                    </div>
                </div>
            </section>

            {/* For Brands & Creators Section */}
            <section className="py-20 px-6 md:px-12 lg:px-24">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div className="h-80 bg-gray-100 flex items-center justify-center text-gray-400 italic font-serif">
                        [Image Placeholder: Artisan at Work]
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-serif mb-6">For Brands & Creators</h2>
                        <div className="space-y-4 text-gray-600 leading-relaxed font-light">
                            <p className="font-medium text-black text-lg">
                                We believe the secondary market should not diminish creation — it should honour it.
                            </p>
                            <p>
                                For brands and creators who produce limited works, rare editions, or culturally significant pieces, The Collectors’ Exchange is envisioned as a modern online museum — a place where craftsmanship, intent, and originality are preserved long after the first sale.
                            </p>
                            <div className="py-4">
                                <p className="mb-4">Our vision is to offer:</p>
                                <ul className="space-y-3 pl-4 border-l-2 border-luxury-gold">
                                    <li>A refined platform to showcase limited editions and collectible works</li>
                                    <li>A transparent and respectful ecosystem that protects intellectual property</li>
                                    <li>A secondary market that strengthens brand legacy rather than eroding it</li>
                                </ul>
                            </div>
                            <p className="font-serif italic text-black">
                                By safeguarding authenticity and respecting original creators, we ensure that value flows forward — not away from its source.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* A Living Legacy Section */}
            <section className="py-24 px-6 md:px-12 lg:px-24 bg-black text-white text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-serif mb-8 text-luxury-gold">A Living Legacy</h2>
                    <div className="space-y-6 text-xl font-light leading-relaxed opacity-90">
                        <p>
                            The Collectors’ Exchange is not merely a marketplace.
                        </p>
                        <p>
                            It is an institution in the making — dedicated to preservation, trust, and continuity.
                        </p>
                        <p>
                            We envision a future where every object with meaning finds its rightful place, and where legacy is not remembered as something lost, but experienced as something alive.
                        </p>
                        <div className="pt-8">
                            <p className="text-2xl md:text-3xl font-serif italic text-white">
                                That is the future we are building.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Vision;
