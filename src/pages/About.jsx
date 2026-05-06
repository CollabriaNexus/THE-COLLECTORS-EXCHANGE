import AboutImage from '../assets/About_US.jpg';
import { History, ShieldCheck, Landmark, Compass, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div className="min-h-screen bg-heritage-cream text-heritage-charcoal font-sans overflow-hidden">
            {/* Cinematic Hero */}
            <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden border-b border-heritage-bronze/10 bg-heritage-charcoal">
                <div className="absolute inset-0 z-0">
                    <img
                        src={AboutImage}
                        alt="Heritage Backdrop"
                        className="w-full h-full object-cover opacity-[0.4] scale-105 contrast-[1.1] brightness-[0.7]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-heritage-charcoal via-transparent to-heritage-charcoal/60"></div>
                </div>

                <div className="relative z-10 container mx-auto px-6 py-24 text-center">
                    <div className="max-w-4xl mx-auto">
                        <span className="text-luxury-gold tracking-[0.5em] font-sans text-[10px] font-bold uppercase mb-6 block">
                            Authorized & Premium
                        </span>
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif mb-8 tracking-tighter leading-[0.9] text-white">
                            The House <br />
                            <span className="italic font-light text-luxury-gold">of Heritage</span>
                        </h1>
                        <p className="text-base md:text-lg text-white/70 font-light max-w-xl mx-auto leading-relaxed font-serif italic">
                            "Preserving the pieces that matter, one collection at a time."
                        </p>
                    </div>
                </div>
            </section>

            {/* Introduction Section */}
            <section className="py-24 px-6 bg-white relative">
                <div className="container mx-auto max-w-4xl text-center">
                    <span className="text-luxury-gold text-xs font-bold tracking-[0.3em] uppercase mb-6 block">Introduction</span>
                    <h2 className="text-4xl md:text-6xl font-serif text-heritage-charcoal mb-10 leading-tight">
                        From the Streets of India <br />
                        <span className="italic text-luxury-gold">To Your Collection</span>
                    </h2>
                    <p className="text-lg md:text-xl text-heritage-charcoal/80 font-sans font-medium leading-relaxed max-w-3xl mx-auto mb-12">
                        We go where others don’t. Our mission is simple: sourcing the most unique, valuable, and historical finds from every corner of Indian pawn shops, street markets, and beyond. Whether you’re a seasoned collector or a history enthusiast, we provide global access to a selection you won't find anywhere else.
                    </p>
                    <div className="w-24 h-0.5 bg-luxury-gold/30 mx-auto"></div>
                </div>
            </section>

            {/* Main Narrative Sections */}
            <section className="py-24 px-6 bg-heritage-cream">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-20 items-center mb-32">
                        <div className="space-y-8 order-2 md:order-1">
                            <div className="space-y-4">
                                <span className="text-luxury-gold font-serif text-4xl block">01.</span>
                                <h2 className="text-3xl md:text-4xl font-serif text-heritage-charcoal tracking-tight uppercase">Why We Do It: <br />Preserving the Pieces That Matter</h2>
                            </div>
                            <div className="space-y-6 text-heritage-charcoal/80 text-lg leading-relaxed font-medium border-l-2 border-luxury-gold/20 pl-8">
                                <p>
                                    We believe that every collector deserves more than just an object; they deserve a legacy they can trust.
                                </p>
                                <p>
                                    Finding that one dream watch or a relic that honors the memory of your forefathers shouldn't require endless hours of digital rabbit holes or navigating the uncertainty of local markets.
                                </p>
                            </div>
                        </div>
                        <div className="relative order-1 md:order-2">
                            <div className="aspect-[4/5] bg-white p-2 border border-heritage-bronze/10 shadow-heritage overflow-hidden">
                                <img src={AboutImage} alt="Heritage Craft" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-luxury-gold/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-20 items-center mb-32">
                        <div className="relative">
                            <div className="aspect-square bg-heritage-charcoal p-2 border border-heritage-bronze/10 shadow-heritage overflow-hidden">
                                <Landmark className="absolute inset-0 m-auto text-white/5 w-64 h-64" strokeWidth={0.5} />
                                <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/10 to-transparent"></div>
                                <div className="relative z-10 w-full h-full flex items-center justify-center p-12 text-center">
                                    <p className="text-white font-serif italic text-2xl leading-relaxed">
                                        "Trust is not a claim, it is a commitment."
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <span className="text-luxury-gold font-serif text-4xl block">02.</span>
                                <h2 className="text-3xl md:text-4xl font-serif text-heritage-charcoal tracking-tight uppercase">A New Standard of Trust</h2>
                            </div>
                            <div className="space-y-6 text-heritage-charcoal/80 text-lg leading-relaxed font-medium border-l-2 border-luxury-gold/20 pl-8">
                                <p>
                                    The pre-owned market is often clouded by doubt. We’re here to change that.
                                </p>
                                <p>
                                    Through a rigorous verification process and archival appraisal, we ensure that every piece in our registry is original and authentic. We’re creating a space where transparency is the default, not the exception.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8 order-2 md:order-1">
                            <div className="space-y-4">
                                <span className="text-luxury-gold font-serif text-4xl block">03.</span>
                                <h2 className="text-3xl md:text-4xl font-serif text-heritage-charcoal tracking-tight uppercase">Direct From the Source</h2>
                            </div>
                            <div className="space-y-6 text-heritage-charcoal/80 text-lg leading-relaxed font-medium border-l-2 border-luxury-gold/20 pl-8">
                                <p>
                                    By eliminating unnecessary middlemen and sourcing directly from local street markets and private sellers, we provide unparalleled value.
                                </p>
                                <p>
                                    We handle everything—from careful verification to global shipping—ensuring that history travels safely from the streets of India to the world.
                                </p>
                            </div>
                        </div>
                        <div className="aspect-square bg-white border border-heritage-bronze/10 p-2 shadow-heritage order-1 md:order-2 overflow-hidden">
                            <img src={AboutImage} alt="Sourcing" className="w-full h-full object-cover grayscale-[0.5]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* The Story Section */}
            <section className="py-24 bg-heritage-charcoal text-white relative">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <span className="text-luxury-gold text-xs font-bold tracking-[0.3em] uppercase mb-6 block">The Story</span>
                    <h2 className="text-4xl md:text-6xl font-serif mb-12">The Journey</h2>
                    <div className="space-y-8 text-lg md:text-xl text-white/70 font-light leading-relaxed font-serif italic max-w-3xl mx-auto">
                        <p>
                            What started as a personal passion for historical finds has grown into a dedicated platform for collectors worldwide. We’ve spent years building relationships with local markets and experts to bridge the gap between local street markets and global collections.
                        </p>
                        <p>
                            Our journey is defined by the incredible items we’ve discovered and the stories they carry.
                        </p>
                    </div>
                </div>
            </section>

            {/* Founder's Message Section */}
            <section className="py-32 px-6 bg-white">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-16 items-start">
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <span className="text-luxury-gold text-xs font-bold tracking-[0.3em] uppercase block">Founder’s message</span>
                                <h2 className="text-4xl md:text-5xl font-serif text-heritage-charcoal leading-tight">A Letter from <br />Our Founder</h2>
                            </div>
                            <div className="relative p-12 bg-heritage-cream border border-heritage-bronze/10">
                                <Sparkles className="absolute -top-4 -left-4 text-luxury-gold w-8 h-8" />
                                <div className="space-y-6 text-lg text-heritage-charcoal/90 font-serif italic leading-relaxed">
                                    <p>
                                        "Growing up, I was always fascinated by the stories objects tell. A simple watch isn’t just about keeping time; it’s about the person who wore it, the milestones they reached, and the legacy they left behind."
                                    </p>
                                    <p>
                                        "At The Collectors Exchange, we don’t just sell items. We connect you with pieces of history that have been carefully sourced and verified. Thank you for being a part of our journey."
                                    </p>
                                </div>
                                <div className="mt-12">
                                    <p className="text-2xl font-serif text-heritage-charcoal mb-1">Prithwis S.</p>
                                    <p className="text-xs uppercase tracking-[0.2em] text-luxury-gold font-bold">Founder, The Collectors Exchange</p>
                                </div>
                            </div>
                        </div>
                        <div className="pt-20">
                            <div className="aspect-[3/4] bg-heritage-charcoal overflow-hidden p-2 shadow-2xl">
                                <img src={AboutImage} alt="Founder" className="w-full h-full object-cover contrast-[1.1] grayscale" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-white border-t border-heritage-bronze/10">
                <div className="container mx-auto px-6 text-center">
                    <Link to="/THE-COLLECTORS-EXCHANGE/category" className="inline-block px-12 py-5 bg-heritage-charcoal text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-luxury-gold transition-all duration-500 rounded-sm">
                        EXPLORE THE REGISTRY
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default About;
