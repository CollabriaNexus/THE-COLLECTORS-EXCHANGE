import AboutImage from '../assets/About_US.jpg';
import { History, ShieldCheck, Heart, Users, Compass, Landmark } from 'lucide-react';
import Bullet from '../components/Bullet';

const About = () => {
    return (
        <div className="min-h-screen bg-heritage-cream text-heritage-charcoal font-sans overflow-hidden">
            {/* Cinematic Hero */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-heritage-bronze/10 bg-heritage-charcoal">
                <div className="absolute inset-0 z-0">
                    <img
                        src={AboutImage}
                        alt="Heritage Backdrop"
                        className="w-full h-full object-cover opacity-[0.4] scale-105 contrast-[1.1] brightness-[0.7]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-heritage-charcoal via-transparent to-heritage-charcoal/60"></div>
                </div>

                <div className="relative z-10 container mx-auto px-6 py-24 flex flex-col items-center justify-center gap-12 text-center">
                    {/* Center: Text Content */}
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-4 mb-8 justify-center">
                            <span className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-luxury-gold font-bold">Authorized & Premium</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif mb-8 tracking-tighter leading-none text-white drop-shadow-lg">
                            A Marketplace for <br />
                            <span className="italic font-light text-white/90">Authentic</span> <span className="text-luxury-gold font-normal">History</span>
                        </h1>

                        <p className="text-base sm:text-lg md:text-xl text-white/80 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
                            Verified. Original. Limited. Discover a curated world of rare finds and verified sellers.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <button className="px-10 py-4 bg-white text-heritage-charcoal text-xs uppercase tracking-[0.2em] font-bold shadow-heritage hover:bg-luxury-gold hover:text-white transition-all duration-300 rounded-sm min-w-[220px]">
                                Explore The Exchange
                            </button>
                            <button className="px-10 py-4 bg-transparent border border-white/30 text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-white hover:text-heritage-charcoal transition-all duration-300 rounded-sm min-w-[220px]">
                                View Auctions
                            </button>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50">
                    <span className="text-[10px] uppercase tracking-[0.8em] text-luxury-gold font-bold">Scroll</span>
                    <div className="w-px h-20 bg-gradient-to-b from-luxury-gold to-transparent animate-pulse"></div>
                </div>
            </section>

            {/* Philosophy Grid */}
            <section className="py-24 px-6 container mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 item-start">
                    <div className="space-y-12">
                        <div className="relative pl-8 border-l-2 border-luxury-gold/30">
                            <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-heritage-charcoal/80 font-serif italic">
                                "Long before mass production, before trends moved at internet speed, value was built through craft, patience, and provenance. A timepiece was not just worn: it was inherited."
                            </p>
                        </div>

                        <div className="p-10 sm:p-12 bg-white rounded-sm border border-heritage-bronze/10 relative overflow-hidden shadow-heritage">
                            <Landmark className="absolute -right-8 -bottom-8 text-heritage-bronze/5 w-40 h-40" />
                            <h2 className="text-3xl sm:text-4xl font-serif mb-6 text-heritage-charcoal">Preserving Philosophy</h2>
                            <p className="text-heritage-brown leading-relaxed text-sm sm:text-base font-medium">
                                We are not a marketplace for the new. <br />
                                We are a House of Heritage for the pre-owned, for items that have lived, endured, and earned their place in time.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col h-full">
                        {/* Featured Box */}
                        <div className="h-full p-10 bg-heritage-beige/30 border border-heritage-bronze/10 rounded-sm hover:border-heritage-bronze/30 transition-all duration-500 hover:shadow-heritage group">
                            <History className="text-luxury-gold mb-8 group-hover:scale-110 transition-transform duration-500" size={32} strokeWidth={1} />
                            <h3 className="text-2xl font-serif mb-6 text-heritage-charcoal">Where Stories Are Collected</h3>
                            <div className="space-y-6 text-sm text-heritage-brown/80 leading-relaxed font-light">
                                <p>Across generations, families have passed down watches, antiques, rare collectibles, toys, sneakers, and cultural artefacts, not as assets, but as memories.</p>
                                <p>Today, many millennials and Gen Z collectors find themselves custodians of these inherited pieces, along with carefully built personal collections of their own.</p>
                                <p>Yet, until now, there has been no trusted space where such objects could be honoured, verified, and exchanged with dignity.</p>
                                <p className="text-heritage-bronze font-semibold uppercase tracking-wider text-xs">The Collectors’ Exchange was built to be that space.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Belief Section */}
            <section className="py-32 bg-white relative overflow-hidden border-y border-heritage-bronze/10">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#D4AF37 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }}></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <span className="text-luxury-gold text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Core Values</span>
                        <h2 className="text-5xl font-serif mb-6 text-heritage-charcoal">Our Belief</h2>
                        <div className="w-24 h-0.5 bg-luxury-gold/40 mx-auto"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-0 border border-heritage-bronze/10 bg-heritage-cream shadow-sm">
                        <div className="p-10 sm:p-14 border-b md:border-b-0 md:border-r border-heritage-bronze/10 text-center group hover:bg-white transition-all duration-500">
                            <Compass className="mx-auto mb-8 text-heritage-charcoal/40 group-hover:text-luxury-gold transition-colors duration-300 w-8 h-8" strokeWidth={1.5} />
                            <p className="text-lg font-serif italic text-heritage-charcoal/80 group-hover:text-heritage-charcoal transition-colors">"Every pre-owned valuable is respected for its journey"</p>
                        </div>
                        <div className="p-10 sm:p-14 border-b md:border-b-0 md:border-r border-heritage-bronze/10 text-center group hover:bg-white transition-all duration-500">
                            <Users className="mx-auto mb-8 text-heritage-charcoal/40 group-hover:text-luxury-gold transition-colors duration-300 w-8 h-8" strokeWidth={1.5} />
                            <p className="text-lg font-serif italic text-heritage-charcoal/80 group-hover:text-heritage-charcoal transition-colors">"Every seller is valued as a custodian, not just a vendor"</p>
                        </div>
                        <div className="p-10 sm:p-14 text-center group hover:bg-white transition-all duration-500">
                            <Heart className="mx-auto mb-8 text-heritage-charcoal/40 group-hover:text-luxury-gold transition-colors duration-300 w-8 h-8" strokeWidth={1.5} />
                            <p className="text-lg font-serif italic text-heritage-charcoal/80 group-hover:text-heritage-charcoal transition-colors">"Every buyer understands they are acquiring more than an object: they are acquiring a legacy"</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision Section: Archival Masterpiece */}
            <section className="py-32 bg-heritage-cream relative overflow-hidden border-y border-heritage-gold-muted/10">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-center gap-6 mb-10">
                            <div className="h-px w-16 bg-luxury-gold/30"></div>
                            <span className="text-luxury-gold tracking-[0.4em] font-sans text-xs font-bold uppercase">
                                Archive Vision
                            </span>
                            <div className="h-px w-16 bg-luxury-gold/30"></div>
                        </div>

                        <h2 className="text-4xl md:text-7xl font-serif text-heritage-charcoal font-normal leading-tight tracking-tight text-center mb-12">
                            The <span className="italic text-luxury-gold font-light">Legacy</span> Statement
                        </h2>

                        <div className="relative py-4 mb-16">
                            <p className="text-2xl md:text-4xl font-serif italic text-heritage-bronze/80 leading-relaxed max-w-4xl mx-auto">
                                "To become the definitive global archive where the world's most meaningful history is preserved, verified, and exchanged for generations to come."
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-xs uppercase tracking-[0.3em] text-heritage-charcoal/60 font-sans font-bold">
                            <div className="flex items-center gap-3">
                                <Bullet className="text-luxury-gold" />
                                <span>Provenance</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Bullet className="text-luxury-gold" />
                                <span>Authenticity</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Bullet className="text-luxury-gold" />
                                <span>Continuity</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Structured Content Sections */}
            <section className="py-24 container mx-auto px-6">
                <div className="max-w-5xl mx-auto space-y-32">
                    {/* Verification */}
                    <div className="flex flex-col md:flex-row gap-20 items-center">
                        <div className="md:w-1/2">
                            <div className="text-xs uppercase tracking-[0.4em] text-luxury-gold font-bold mb-6">Authentication</div>
                            <h2 className="text-4xl md:text-5xl font-serif mb-8 text-heritage-charcoal">Curated. Verified. Meaningful.</h2>
                            <p className="text-lg text-heritage-gold-muted italic font-serif mb-8 border-l-2 border-luxury-gold/30 pl-6">We believe trust is not claimed: it is earned.</p>
                            <div className="space-y-6 text-heritage-brown/80 leading-relaxed font-light">
                                <p>Each item listed on The Collectors’ Exchange undergoes a structured verification process before being marked as authenticated by our marketplace. Our focus is not volume, but integrity. We choose curation over clutter, and provenance over popularity.</p>
                                <p>Whether it is a timepiece that has measured decades, a sneaker preserved in its original condition, or a collectible tied to cultural memory, we ensure that what enters our exchange belongs here.</p>
                            </div>
                        </div>
                        <div className="md:w-1/2 relative">
                            <div className="absolute inset-0 bg-luxury-gold/5 blur-3xl transform rotate-3"></div>
                            <div className="h-[400px] md:h-[500px] p-2 bg-white border border-heritage-bronze/10 shadow-2xl relative z-10">
                                <img
                                    src={AboutImage}
                                    alt="Verification"
                                    className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Collectors Segment */}
                    <div className="space-y-20">
                        <div className="text-center">
                            <h2 className="text-4xl md:text-5xl font-serif mb-6 text-heritage-charcoal">Built for Collectors</h2>
                            <p className="text-lg text-heritage-brown/70 max-w-2xl mx-auto leading-relaxed italic">
                                "The courage to collect is the courage to remember."
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: "The Seasoned Collector", desc: "Refining a lifetime archive with precision and care." },
                                { title: "The Inheritor", desc: "Seeking a respectful, trusted place for family treasures." },
                                { title: "The Modern Enthusiast", desc: "Discovering the joy of meaningful ownership and history." }
                            ].map((item, i) => (
                                <div key={i} className="p-10 bg-white border border-heritage-bronze/10 hover:border-luxury-gold/40 transition-all duration-300 text-center shadow-sm hover:shadow-heritage group">
                                    <h3 className="font-serif text-xl mb-4 text-heritage-charcoal group-hover:text-luxury-gold transition-colors">{item.title}</h3>
                                    <p className="text-sm text-heritage-brown/70 font-light leading-relaxed tracking-wide">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Final Promise */}
                    <div className="bg-heritage-charcoal p-12 sm:p-24 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-luxury-gold/5 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <ShieldCheck className="mx-auto mb-8 text-luxury-gold w-16 h-16" strokeWidth={1} />
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-6 text-white">Our Promise</h2>
                            <p className="text-heritage-beige/60 mb-12 text-lg sm:text-xl italic font-serif">"To protect the past, so it may have a future."</p>

                            <div className="inline-flex flex-col sm:flex-row justify-center gap-8 sm:gap-16 border-t border-white/10 pt-12">
                                <div className="flex items-center gap-4 justify-center">
                                    <Bullet className="text-luxury-gold w-3 h-3" />
                                    <span className="text-lg sm:text-xl font-serif text-white/90">Seller Privacy</span>
                                </div>
                                <div className="flex items-center gap-4 justify-center">
                                    <Bullet className="text-luxury-gold w-3 h-3" />
                                    <span className="text-lg sm:text-xl font-serif text-white/90">Absolute Authenticity</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
