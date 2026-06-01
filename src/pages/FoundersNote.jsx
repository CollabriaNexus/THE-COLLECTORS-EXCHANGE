import React from 'react';
import AboutImage from '../assets/About_US.jpg';
import { Sparkles, Quote } from 'lucide-react';

const FoundersNote = () => {
    return (
        <div className="min-h-screen bg-heritage-cream text-heritage-charcoal font-sans overflow-hidden">
            {/* Header section for the note */}
            <section className="py-24 px-6 bg-white border-b border-heritage-bronze/10">
                <div className="container mx-auto max-w-4xl text-center">
                    <span className="text-luxury-gold text-xs font-bold tracking-[0.3em] uppercase mb-6 block">Founder’s message</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-heritage-charcoal mb-8 leading-tight">A Letter from <br />Our Founder</h1>
                    <div className="w-24 h-0.5 bg-luxury-gold/30 mx-auto"></div>
                </div>
            </section>

                {/* Founder's Message */}
                <section className="mb-20 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-serif mb-12">A Message from Our Founder</h1>

                    <div className="space-y-6 text-lg md:text-xl font-light leading-relaxed text-gray-800 font-serif">
                        <p className="italic text-black font-normal text-2xl border-l-4 border-luxury-gold pl-6">
                            "The Collectors Exchange is not a 'startup dream,' it is a lifelong commitment to the soul of our nation.
                        </p>
                        <p>
                            My intention is simple: to ensure that Indian heritage does not become a memory, but remains a living, breathing part of our homes.
                        </p>
                        <p>
                            We do not believe in the fleeting nature of 'startup bubbles.' Instead, we build on the timeless principles taught by our ancestors: integrity, longevity, and a deep respect for the trade. To us, every article we find is sacred. Our responsibility does not end at the point of sale; we remain the guardians of every piece we sell. This is why we check in with our collectors annually to ensure the health and preservation of these historic treasures.
                        </p>
                        <p className="font-normal text-black mt-8 text-xl border-l-4 border-luxury-gold pl-6">
                            'India is my country, and I know my responsibility to keep its history sacred and alive forever.' That is my vision, and that is my promise to you."
                        </p>
                    </div>
                </section>

                {/* The Story: The Heartbeat of Heritage */}
                <section className="mb-20 pt-16 border-t border-gray-100">
                    <h2 className="text-3xl md:text-4xl font-serif mb-12">The Story: The Heartbeat of Heritage</h2>

                    <div className="space-y-6 text-lg md:text-xl font-light leading-relaxed text-gray-800 font-serif">
                        <p>
                            I grew up listening to my father speak of a world that no longer seems to exist. He spoke of mechanical watches born from historic watchmakers and the weight of true craftsmanship. Today, I see fashion brands masquerading as "luxury" icons, but labels are not legacies.
                        </p>
                        <p className="italic text-black font-normal">
                            You cannot ask a cobbler to stitch a wound and call him a doctor; similarly, you cannot put a luxury price tag on a hollow product and call it heritage.
                        </p>
                        <p>
                            This "misbranding" is a betrayal of our history, and it isn't just happening with watches; it's everywhere. That realization sparked a burning passion within me to build something history would remember. The Collectors Exchange was born to be the antidote to the "startup bubble."
                        </p>
                        <p>
                            To the Gen Z and Millennials: We are the bridge between the ancient and the digital. We bring the heritage of a hundred years to your screen and the rarest treasures to your doorstep. What used to take years of searching is now at your fingertips, curated, authenticated, and preserved.
                        </p>
                        <p>
                            We are not a tech startup or an "innovation" company. We are your pride. We are your trust. We are the family you call upon when authenticity is the only currency that matters. Our process isn't about scrolling through vendor lists; it's about traveling across India, scouring the streets to find the needle in a haystack so you don't have to.
                        </p>
                        <p className="border-l-4 border-luxury-gold pl-6 italic text-black text-lg">
                            When you hold a timepiece or a collectible from the Exchange, you aren't just holding an object. You are holding a family's lineage, a craftsman's soul, and a piece of sacred history.
                        </p>
                        <p>
                            Our responsibility does not end at your doorstep. As stewards of heritage, we check in on our collectors and the "health" of their articles annually. We believe that if we take care of our history, our history will take care of our future.
                        </p>
                        <p className="text-xl font-normal text-black mt-8 pt-8 border-t border-gray-100">
                            History isn't meant to be lived in the past; it is meant to be lived in the present.
                        </p>
                        <p className="text-2xl font-serif text-luxury-gold">
                            Welcome to the Exchange.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default FoundersNote;
