import React from 'react';

const FoundersNote = () => {
    return (
        <div className="min-h-screen bg-white text-black py-20 px-6 md:px-12 lg:px-24">
            <div className="max-w-3xl mx-auto">

                {/* Intro Section */}
                <section className="mb-20 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-serif mb-12">Founder’s Note</h1>

                    <div className="space-y-6 text-lg md:text-xl font-light leading-relaxed text-gray-800 font-serif">
                        <p>
                            The idea for The Collectors’ Exchange did not come from a trend, a market gap, or a business plan.
                        </p>
                        <p className="italic text-black font-normal">
                            It came from observing how easily meaningful things are forgotten.
                        </p>
                        <p>
                            Across homes, families, and generations, objects that once carried pride, craftsmanship, and memory are quietly discarded — not because they lack value, but because the world has learned to move too fast. In the rush for what is new, we have lost respect for what has endured.
                        </p>
                        <p>
                            I founded The Collectors’ Exchange in 2025 with a belief shaped by history — particularly by eras when possessions were built to last, preserved with care, and passed on with intention. In those times, value was not measured by immediacy, but by continuity.
                        </p>
                        <p className="font-normal text-black mt-8">
                            This platform exists to restore that balance.
                        </p>
                    </div>
                </section>

                <div className="w-24 h-0.5 bg-gray-200 mx-auto md:mx-0 mb-20"></div>

                {/* Section 1: Built on Respect */}
                <section className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-serif mb-6">Built on Respect, Not Volume</h2>
                    <div className="space-y-4 text-gray-600 leading-relaxed font-light">
                        <p>
                            The Collectors’ Exchange is not designed to be the largest marketplace. It is designed to be the most responsible.
                        </p>
                        <p>
                            Every object listed here represents someone’s trust — a collector’s years of patience, a family’s inheritance, a creator’s original intent. That trust demands more than transactions. It demands verification, transparency, and restraint.
                        </p>
                        <div className="pl-6 border-l-2 border-luxury-gold italic text-gray-800 my-8">
                            <p>This is why we authenticate what we list.</p>
                            <p>Why we assess quality with care.</p>
                            <p>Why we protect the privacy of our sellers.</p>
                            <p>And why we choose curation over excess.</p>
                        </div>
                    </div>
                </section>

                {/* Section 2: For Those Who Keep */}
                <section className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-serif mb-6">For Those Who Keep, Not Consume</h2>
                    <div className="space-y-4 text-gray-600 leading-relaxed font-light">
                        <p>
                            Collectors are often misunderstood. They are not accumulators. They are custodians.
                        </p>
                        <p>
                            They preserve what others overlook. They carry forward what might otherwise disappear. The Collectors’ Exchange was built for them — and for those who are just beginning to understand the quiet satisfaction of owning something that matters.
                        </p>
                        <p>
                            To the families entrusting us with heirlooms, to the collectors refining their archives, and to the creators whose work deserves enduring respect — this platform exists because of you.
                        </p>
                    </div>
                </section>

                {/* Section 3: A Commitment */}
                <section className="mb-20">
                    <h2 className="text-2xl md:text-3xl font-serif mb-6">A Commitment, Not a Claim</h2>
                    <div className="space-y-4 text-gray-600 leading-relaxed font-light">
                        <p>
                            Trust is not something we ask for. It is something we work to earn — every listing, every verification, every exchange.
                        </p>
                        <p>
                            The Collectors’ Exchange is a long-term commitment to heritage, authenticity, and integrity. Not for a season. Not for a cycle. But for the generations that follow.
                        </p>
                    </div>
                </section>

                {/* Closing */}
                <div className="mt-12 text-center md:text-left">
                    <div className="mb-8">
                        <p className="font-serif italic text-2xl">
                            — Shaik Faraz
                        </p>
                        <p className="font-serif text-lg text-gray-500 mt-2">
                            Founder, The Collectors’ Exchange
                        </p>
                    </div>
                    <p className="text-sm text-gray-400 uppercase tracking-widest">
                        Thank you for being part of this journey.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default FoundersNote;
