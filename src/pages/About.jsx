import React from 'react';

const About = () => {
    return (
        <div className="min-h-screen bg-white text-black">
            {/* Intro Section */}
            <section className="py-20 px-6 md:px-12 lg:px-24 mx-auto max-w-6xl text-center">
                <h1 className="text-4xl md:text-6xl font-serif font-bold uppercase tracking-widest mb-8">
                    The Collectors’ Exchange
                </h1>
                <div className="w-24 h-1 bg-luxury-gold mx-auto mb-12"></div>

                <div className="max-w-3xl mx-auto space-y-6 text-lg md:text-xl font-light leading-relaxed text-gray-700">
                    <p>
                        Founded in 2025, with our thoughts rooted firmly in the 1800s, The Collectors’ Exchange was created with a simple belief: objects carry history, and history deserves respect.
                    </p>
                    <p>
                        Long before mass production, before trends moved at internet speed, value was built through craft, patience, and provenance. A timepiece was not just worn — it was inherited. A collectible was not bought — it was kept. A possession was not replaced — it became a story.
                    </p>
                    <p className="font-serif italic text-black font-medium text-2xl py-4">
                        At The Collectors’ Exchange, we exist to preserve that philosophy.
                    </p>
                    <p>
                        We are not a marketplace for the new. <br />
                        We are a House of Heritage for the pre-owned — for items that have lived, endured, and earned their place in time.
                    </p>
                </div>
            </section>

            {/* Section 1: Where Stories Are Collected */}
            <section className="py-20 px-6 md:px-12 lg:px-24 bg-gray-50">
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-serif mb-6">Where Stories Are Collected, Not Discarded</h2>
                        <div className="space-y-4 text-gray-600 leading-relaxed font-light">
                            <p>
                                Across generations, families have passed down watches, antiques, rare collectibles, toys, sneakers, and cultural artefacts — not as assets, but as memories.
                            </p>
                            <p>
                                Today, many millennials and Gen Z collectors find themselves custodians of these inherited pieces, along with carefully built personal collections of their own.
                            </p>
                            <p>
                                Yet, until now, there has been no trusted space where such objects could be honoured, verified, and exchanged with dignity.
                            </p>
                            <p className="font-medium text-black">
                                The Collectors’ Exchange was built to be that space.
                            </p>
                        </div>
                    </div>
                    <div className="h-full min-h-[300px] bg-gray-200 flex items-center justify-center text-gray-400 italic font-serif">
                        [Image Placeholder: Heritage Item]
                    </div>
                </div>
            </section>

            {/* Section 2: Our Belief */}
            <section className="py-20 px-6 md:px-12 lg:px-24 bg-black text-white text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-serif mb-12 text-luxury-gold">Our Belief</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 border border-gray-800 hover:border-luxury-gold transition-colors duration-300 rounded-sm">
                            <p className="font-light leading-relaxed">
                                Every pre-owned valuable is respected for its journey
                            </p>
                        </div>
                        <div className="p-6 border border-gray-800 hover:border-luxury-gold transition-colors duration-300 rounded-sm">
                            <p className="font-light leading-relaxed">
                                Every seller is valued as a custodian, not just a vendor
                            </p>
                        </div>
                        <div className="p-6 border border-gray-800 hover:border-luxury-gold transition-colors duration-300 rounded-sm">
                            <p className="font-light leading-relaxed">
                                Every buyer understands they are acquiring more than an object — they are acquiring a legacy
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Curated. Verified. Meaningful. */}
            <section className="py-20 px-6 md:px-12 lg:px-24">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-serif mb-6">Curated. Verified. Meaningful.</h2>
                    <p className="text-xl font-serif italic text-gray-500 mb-8">We believe trust is not claimed — it is earned.</p>
                    <div className="space-y-6 text-gray-600 leading-relaxed font-light">
                        <p>
                            Each item listed on The Collectors’ Exchange undergoes a structured verification process before being marked as authenticated by our marketplace. Our focus is not volume, but integrity. We choose curation over clutter, and provenance over popularity.
                        </p>
                        <p>
                            Whether it is a timepiece that has measured decades, a sneaker preserved in its original condition, or a collectible tied to cultural memory, we ensure that what enters our exchange belongs here.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 4: Built for Collectors */}
            <section className="py-20 px-6 md:px-12 lg:px-24 bg-secondary-bg">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif mb-6">Built for Collectors, Then and Now</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto font-light">
                            The courage to collect — to hold onto something when the world moves on — is rare. It takes patience, appreciation, and respect for time itself. We honour that courage.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 shadow-sm border-t-4 border-luxury-gold">
                            <h3 className="font-serif text-xl mb-4">The Seasoned Collector</h3>
                            <p className="text-sm text-gray-500 font-light">Refining a lifetime archive with precision and care.</p>
                        </div>
                        <div className="bg-white p-8 shadow-sm border-t-4 border-luxury-gold">
                            <h3 className="font-serif text-xl mb-4">The Inheritor</h3>
                            <p className="text-sm text-gray-500 font-light">Seeking a respectful, trusted place for family treasures.</p>
                        </div>
                        <div className="bg-white p-8 shadow-sm border-t-4 border-luxury-gold">
                            <h3 className="font-serif text-xl mb-4">The Modern Enthusiast</h3>
                            <p className="text-sm text-gray-500 font-light">Discovering the joy of meaningful ownership and history.</p>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <p className="font-serif italic text-lg text-gray-800">
                            Here, value is not defined by age alone — but by story, condition, rarity, and relevance.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 5: Our Promise */}
            <section className="py-20 px-6 md:px-12 lg:px-24 bg-white border-t border-gray-100">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-serif mb-8 text-luxury-gold">Our Promise</h2>
                    <p className="text-gray-600 mb-8 font-light text-lg">We promise to protect:</p>
                    <ul className="space-y-4 text-left inline-block">
                        <li className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-black rounded-full"></div>
                            <span className="text-xl font-medium">The privacy of our sellers</span>
                        </li>
                        <li className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-black rounded-full"></div>
                            <span className="text-xl font-medium">The authenticity of every item sold</span>
                        </li>
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default About;
