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

            {/* Main Content Section */}
            <section className="py-24 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-20 items-start">
                        <div className="space-y-12 order-2 md:order-1">
                            <div className="relative">
                                <Quote className="absolute -top-12 -left-12 text-luxury-gold/10 w-24 h-24 -z-0" strokeWidth={0.5} />
                                <div className="space-y-8 text-xl md:text-2xl text-heritage-charcoal/90 font-serif italic leading-relaxed relative z-10">
                                    <p>
                                        "Growing up, I was always fascinated by the stories objects tell. A simple watch isn’t just about keeping time; it’s about the person who wore it, the milestones they reached, and the legacy they left behind."
                                    </p>
                                    <p>
                                        "At The Collectors Exchange, we don’t just sell items. We connect you with pieces of history that have been carefully sourced and verified. Our goal is to make these treasures accessible to collectors worldwide while ensuring that the essence of their origin remains intact."
                                    </p>
                                    <p>
                                        "Thank you for being a part of our journey."
                                    </p>
                                </div>
                            </div>

                            <div className="pt-12 border-t border-heritage-bronze/10">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-serif text-heritage-charcoal">Prithwis S.</h3>
                                    <p className="text-xs uppercase tracking-[0.4em] text-luxury-gold font-bold">Founder, The Collectors Exchange</p>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 md:order-2">
                            <div className="relative">
                                <div className="absolute -inset-4 border border-luxury-gold/20 translate-x-4 translate-y-4 -z-10"></div>
                                <div className="aspect-[3/4] bg-heritage-charcoal p-2 border border-heritage-bronze/10 shadow-2xl overflow-hidden">
                                    <img 
                                        src={AboutImage} 
                                        alt="Founder" 
                                        className="w-full h-full object-cover contrast-[1.1] grayscale hover:grayscale-0 transition-all duration-1000" 
                                    />
                                </div>
                                <div className="absolute -bottom-8 -left-8 bg-white p-8 border border-heritage-bronze/10 shadow-heritage hidden md:block">
                                    <Sparkles className="text-luxury-gold w-8 h-8 mb-4" />
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-heritage-charcoal/50">EST. 2024</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Closing Section */}
            <section className="py-24 bg-heritage-charcoal text-white text-center">
                <div className="container mx-auto px-6 max-w-2xl">
                    <p className="text-lg font-serif italic text-white/60 mb-8">
                        "Connecting the past to the future, through the hands of those who care."
                    </p>
                    <div className="w-12 h-px bg-luxury-gold/30 mx-auto"></div>
                </div>
            </section>
        </div>
    );
};

export default FoundersNote;
