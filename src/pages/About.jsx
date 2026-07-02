import AboutImage from '../assets/About_US.jpg';
import VerificationImage from '../assets/verification_authenticity.webp';
import SourcingImage from '../assets/artisan2.webp';
import FounderImage from '../assets/collectors_study.webp';
import SEO from '../components/SEO';
import { History, ShieldCheck, Landmark, Compass, Users, Sparkles, Heart } from 'lucide-react';
import Bullet from '../components/Bullet';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div className="min-h-screen bg-heritage-cream text-heritage-charcoal font-sans overflow-hidden">
            <SEO
                title="About"
                description="Learn about The Collectors Exchange — India's premier platform for authentic pre-owned collectibles, antiques, and limited-edition pieces. Discover our mission to preserve heritage through verified sourcing."
                canonical="/about"
            />
            {/* Cinematic Hero */}
            <section className="relative min-h-[60vh] sm:min-h-[75vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-heritage-bronze/10 bg-heritage-charcoal">
                <div className="absolute inset-0 z-0">
                    <img
                        src={AboutImage}
                        alt="Heritage Backdrop"
                        className="w-full h-full object-cover opacity-[0.4] scale-105 contrast-[1.1] brightness-[0.7]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-heritage-charcoal via-transparent to-heritage-charcoal/60"></div>
                </div>

                <div className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col items-center justify-center gap-8 sm:gap-12 text-center">
                    {/* Center: Text Content */}
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8 justify-center">
                            <span className="text-[9px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-luxury-gold font-bold">Authorized & Premium</span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-serif mb-4 sm:mb-8 tracking-tighter leading-none text-white drop-shadow-lg">
                            From the Streets of <br />
                            <span className="italic font-light text-white/90">India</span> <span className="text-luxury-gold font-normal">to Your Collection</span>
                        </h1>

                        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 font-light mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
                            We go where others don't. Sourcing the most unique, valuable, and historical finds from every corner of Indian pawn shops, street markets, and beyond. Whether you're a seasoned collector or a history enthusiast, we provide global access to a selection you won't find anywhere else.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                            <Link to="/category" className="px-6 sm:px-10 py-3 sm:py-4 bg-white text-heritage-charcoal text-[11px] sm:text-xs uppercase tracking-[0.2em] font-bold shadow-heritage hover:bg-luxury-gold hover:text-white transition-all duration-300 rounded-sm w-full sm:w-auto text-center">
                                Explore The Exchange
                            </Link>
                            <Link to="/auction" className="px-6 sm:px-10 py-3 sm:py-4 bg-transparent border border-white/30 text-white text-[11px] sm:text-xs uppercase tracking-[0.2em] font-bold hover:bg-white hover:text-heritage-charcoal transition-all duration-300 rounded-sm w-full sm:w-auto text-center">
                                View Auctions
                            </Link>
                        </div>
                    </div>
                </div>

            </section>

            {/* Why We Do It & Mission */}
            <section className="py-16 sm:py-24 px-6 container mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 item-start">
                    <div className="space-y-8 sm:space-y-12">
                        <div className="relative pl-4 sm:pl-8 border-l-2 border-luxury-gold/30">
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-heritage-charcoal/80 font-serif italic">
                                "We believe that every collector deserves more than just an object; they deserve a legacy they can trust."
                            </p>
                        </div>

                        <div className="p-6 sm:p-10 lg:p-12 bg-white rounded-sm border border-heritage-bronze/10 relative overflow-hidden shadow-heritage">
                            <Landmark className="absolute -right-8 -bottom-8 text-heritage-bronze/5 w-40 h-40" />
                            <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif mb-4 sm:mb-6 text-heritage-charcoal">Why We Do It</h2>
                            <p className="text-heritage-brown leading-relaxed text-sm sm:text-base font-medium">
                                Finding that one dream watch or a relic that honors the memory of your forefathers shouldn't require endless hours of digital rabbit holes or navigating the uncertainty of local markets.
                            </p>
                            <p className="text-heritage-brown leading-relaxed text-sm sm:text-base font-medium mt-4">
                                We exist to bridge the gap between the hunt and the heritage. By sourcing only 100% original and authentic articles, we do the heavy lifting so you can focus on what matters: keeping history close to your heart.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col h-full">
                        <div className="h-full p-6 sm:p-10 bg-heritage-beige/30 border border-heritage-bronze/10 rounded-sm hover:border-heritage-bronze/30 transition-all duration-500 hover:shadow-heritage group">
                            <History className="text-luxury-gold mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500" size={32} strokeWidth={1} />
                            <h3 className="text-lg sm:text-2xl font-serif mb-4 sm:mb-6 text-heritage-charcoal">Mission: Reviving the Soul of Indian Heritage</h3>
                            <div className="space-y-4 sm:space-y-6 text-sm text-heritage-brown/80 leading-relaxed font-light">
                                <p>In an era dominated by the digital, the tangible history of India is at risk of fading away. Our mission is to reclaim that "dead value" and bring it back to life. We don't just trade articles; we preserve stories.</p>
                                <p>We act as the lifejacket for our national heritage, ensuring that every collectible is backed by trust and authenticity. We are dedicated to educating the next generation of collectors, helping them understand and protect the true worth of the past.</p>
                                <p className="text-heritage-bronze font-semibold uppercase tracking-wider text-xs">The Collectors Exchange was built to end that struggle.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Belief Section */}
            <section className="py-16 sm:py-24 lg:py-32 bg-white relative overflow-hidden border-y border-heritage-bronze/10">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#D4AF37 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }}></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-12 sm:mb-20">
                        <span className="text-luxury-gold text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Core Values</span>
                        <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif mb-6 text-heritage-charcoal">Our Belief</h2>
                        <div className="w-24 h-0.5 bg-luxury-gold/40 mx-auto"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-0 border border-heritage-bronze/10 bg-heritage-cream shadow-sm">
                        <div className="p-6 sm:p-10 lg:p-14 border-b md:border-b-0 md:border-r border-heritage-bronze/10 text-center group hover:bg-white transition-all duration-500">
                            <Compass className="mx-auto mb-4 sm:mb-8 text-heritage-charcoal/40 group-hover:text-luxury-gold transition-colors duration-300 w-6 h-6 sm:w-8 sm:h-8" strokeWidth={1.5} />
                            <p className="text-sm sm:text-lg font-serif italic text-heritage-charcoal/80 group-hover:text-heritage-charcoal transition-colors">"Every pre-owned valuable is respected for its journey"</p>
                        </div>
                        <div className="p-6 sm:p-10 lg:p-14 border-b md:border-b-0 md:border-r border-heritage-bronze/10 text-center group hover:bg-white transition-all duration-500">
                            <Users className="mx-auto mb-4 sm:mb-8 text-heritage-charcoal/40 group-hover:text-luxury-gold transition-colors duration-300 w-6 h-6 sm:w-8 sm:h-8" strokeWidth={1.5} />
                            <p className="text-sm sm:text-lg font-serif italic text-heritage-charcoal/80 group-hover:text-heritage-charcoal transition-colors">"Every seller is valued as a custodian, not just a vendor"</p>
                        </div>
                        <div className="p-6 sm:p-10 lg:p-14 text-center group hover:bg-white transition-all duration-500">
                            <Heart className="mx-auto mb-4 sm:mb-8 text-heritage-charcoal/40 group-hover:text-luxury-gold transition-colors duration-300 w-6 h-6 sm:w-8 sm:h-8" strokeWidth={1.5} />
                            <p className="text-sm sm:text-lg font-serif italic text-heritage-charcoal/80 group-hover:text-heritage-charcoal transition-colors">"Every buyer understands they are acquiring more than an object: they are acquiring a legacy"</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision Section: Archival Masterpiece */}
            <section className="py-16 sm:py-24 lg:py-32 bg-heritage-cream relative overflow-hidden border-y border-heritage-gold-muted/10">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-center gap-6 mb-10">
                            <div className="h-px w-16 bg-luxury-gold/30"></div>
                            <span className="text-luxury-gold tracking-[0.4em] font-sans text-xs font-bold uppercase">
                                Archive Vision
                            </span>
                            <div className="h-px w-16 bg-luxury-gold/30"></div>
                        </div>

                        <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif text-heritage-charcoal font-normal leading-tight tracking-tight text-center mb-8 sm:mb-12">
                            The <span className="italic text-luxury-gold font-light">Legacy</span> Statement
                        </h2>

                        <div className="relative py-4 mb-12 sm:mb-16">
                            <p className="text-xl sm:text-2xl md:text-4xl font-serif italic text-heritage-bronze/80 leading-relaxed max-w-4xl mx-auto">
                                "To become the definitive global archive where the world's most meaningful history is preserved, verified, and exchanged for generations to come."
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 sm:gap-8 md:gap-16">
                            <div className="flex items-center gap-3 justify-center">
                                <Bullet className="text-luxury-gold" />
                                <span className="text-xs uppercase tracking-[0.3em] text-heritage-charcoal/60 font-sans font-bold">Provenance</span>
                            </div>
                            <div className="space-y-4 sm:space-y-6 text-heritage-charcoal/80 text-sm sm:text-base md:text-lg leading-relaxed font-medium border-l-2 border-luxury-gold/20 pl-4 sm:pl-8">
                                <p>
                                    We believe that every collector deserves more than just an object; they deserve a legacy they can trust.
                                </p>
                                <p>
                                    Finding that one dream watch or a relic that honors the memory of your forefathers shouldn't require endless hours of digital rabbit holes or navigating the uncertainty of local markets.
                                </p>
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
                            <div className="text-xs uppercase tracking-[0.4em] text-luxury-gold font-bold mb-4 sm:mb-6">Authentication</div>
                            <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif mb-6 sm:mb-8 text-heritage-charcoal">Truth Over Misbranding</h2>
                            <p className="text-sm sm:text-base md:text-lg text-heritage-gold-muted italic font-serif mb-6 sm:mb-8 border-l-2 border-luxury-gold/30 pl-4 sm:pl-6">You cannot ask a cobbler to stitch a wound and call him a doctor.</p>
                            <div className="space-y-4 sm:space-y-6 text-heritage-brown/80 text-sm sm:text-base leading-relaxed font-light">
                                <p>While many brands sell "lifestyle" through clever marketing, we sell the Truth. We specialize in the mechanical heartbeat of history and the raw authenticity of heritage. If it isn't genuine, it isn't on our platform. Period.</p>
                                <p>Each item listed on The Collectors Exchange undergoes a rigorous internal verification process. Our focus is not volume, but integrity. We choose curation over clutter, and provenance over popularity. We reject "misbranding."</p>
                            </div>
                        </div>
                        <div className="md:w-1/2 relative">
                            <div className="absolute inset-0 bg-luxury-gold/5 blur-3xl transform rotate-3"></div>
                            <div className="h-[400px] md:h-[500px] p-2 bg-white border border-heritage-bronze/10 shadow-2xl relative z-10">
                                <img
                                    src={VerificationImage}
                                    alt="Expert examining a vintage pocket watch for authenticity"
                                    className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                                />
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-luxury-gold/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>

                    {/* Collectors Segment */}
                    <div className="space-y-20">
                        <div className="text-center">
                            <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif mb-4 sm:mb-6 text-heritage-charcoal">Built for Collectors</h2>
                            <p className="text-sm sm:text-base md:text-lg text-heritage-brown/70 max-w-2xl mx-auto leading-relaxed italic">
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

                    {/* Final Promise: Stewardship */}
                    <div className="bg-heritage-charcoal p-8 sm:p-12 lg:p-24 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-luxury-gold/5 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <ShieldCheck className="mx-auto mb-6 sm:mb-8 text-luxury-gold w-12 h-12 sm:w-16 sm:h-16" strokeWidth={1} />
                            <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif mb-4 sm:mb-6 text-white">Stewardship, Not Just Sales</h2>
                            <p className="text-heritage-beige/60 mb-8 sm:mb-12 text-base sm:text-lg md:text-xl italic font-serif">"Most businesses end their relationship with you at the checkout. We are just getting started."</p>
                            <p className="text-heritage-beige/70 mb-8 sm:mb-12 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
                                As stewards of Indian history, we provide annual "health checks" for the articles you purchase. We stay in touch to ensure your timepieces and collectibles are preserved correctly, honoring the lineage they represent.
                            </p>

                            <div className="inline-flex flex-col sm:flex-row justify-center gap-6 sm:gap-16 border-t border-white/10 pt-8 sm:pt-12">
                                <div className="flex items-center gap-4 justify-center">
                                    <Bullet className="text-luxury-gold w-3 h-3" />
                                    <span className="text-base sm:text-lg md:text-xl font-serif text-white/90">Ancestral Integrity</span>
                                </div>
                                <div className="flex items-center gap-4 justify-center">
                                    <Bullet className="text-luxury-gold w-3 h-3" />
                                    <span className="text-base sm:text-lg md:text-xl font-serif text-white/90">Annual Health Checks</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 sm:space-y-8">
                        <div className="space-y-3 sm:space-y-4">
                            <span className="text-luxury-gold font-serif text-2xl sm:text-3xl md:text-4xl block">01.</span>
                            <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif text-heritage-charcoal tracking-tight uppercase">A New Standard of Trust</h2>
                        </div>
                        <div className="space-y-4 sm:space-y-6 text-heritage-charcoal/80 text-sm sm:text-base md:text-lg leading-relaxed font-medium border-l-2 border-luxury-gold/20 pl-4 sm:pl-8">
                            <p>
                                The pre-owned market is often clouded by doubt. We're here to change that.
                            </p>
                            <p>
                                Through a rigorous verification process and archival appraisal, we ensure that every piece in our registry is original and authentic. We're creating a space where transparency is the default, not the exception.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div className="space-y-6 sm:space-y-8 order-2 md:order-1">
                            <div className="space-y-3 sm:space-y-4">
                                <span className="text-luxury-gold font-serif text-2xl sm:text-3xl md:text-4xl block">02.</span>
                                <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif text-heritage-charcoal tracking-tight uppercase">Direct From the Source</h2>
                            </div>
                            <div className="space-y-4 sm:space-y-6 text-heritage-charcoal/80 text-sm sm:text-base md:text-lg leading-relaxed font-medium border-l-2 border-luxury-gold/20 pl-4 sm:pl-8">
                                <p>
                                    By eliminating unnecessary middlemen and sourcing directly from local street markets and private sellers, we provide unparalleled value.
                                </p>
                                <p>
                                    We handle everything—from careful verification to global shipping—ensuring that history travels safely from the streets of India to the world.
                                </p>
                            </div>
                        </div>
                        <div className="aspect-square bg-white border border-heritage-bronze/10 p-2 shadow-heritage order-1 md:order-2 overflow-hidden">
                            <img src={SourcingImage} alt="Vintage market vendor with antique wares" className="w-full h-full object-cover grayscale-[0.5]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* The Story Section */}
            <section className="py-16 sm:py-24 bg-heritage-charcoal text-white relative">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <span className="text-luxury-gold text-xs font-bold tracking-[0.3em] uppercase mb-4 sm:mb-6 block">The Story</span>
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif mb-8 sm:mb-12">The Journey</h2>
                    <div className="space-y-6 sm:space-y-8 text-sm sm:text-base md:text-lg lg:text-xl text-white/70 font-light leading-relaxed font-serif italic max-w-3xl mx-auto">
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
            <section className="py-16 sm:py-24 lg:py-32 px-6 bg-white">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-12 sm:gap-16 items-start">
                        <div className="space-y-8 sm:space-y-12">
                            <div className="space-y-3 sm:space-y-4">
                                <span className="text-luxury-gold text-xs font-bold tracking-[0.3em] uppercase block">Founder's message</span>
                                <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif text-heritage-charcoal leading-tight">A Letter from <br />Our Founder</h2>
                            </div>
                            <div className="relative p-6 sm:p-12 bg-heritage-cream border border-heritage-bronze/10">
                                <Sparkles className="absolute -top-4 -left-4 text-luxury-gold w-8 h-8" />
                                <div className="space-y-4 sm:space-y-6 text-sm sm:text-base md:text-lg text-heritage-charcoal/90 font-serif italic leading-relaxed">
                                    <p>
                                        "Growing up, I was always fascinated by the stories objects tell. A simple watch isn’t just about keeping time; it’s about the person who wore it, the milestones they reached, and the legacy they left behind."
                                    </p>
                                    <p>
                                        "At The Collectors Exchange, we don’t just sell items. We connect you with pieces of history that have been carefully sourced and verified. Thank you for being a part of our journey."
                                    </p>
                                </div>
                                <div className="mt-12">
                                    <p className="text-lg sm:text-2xl font-serif text-heritage-charcoal mb-1">Shaik Faraz</p>
                                    <p className="text-xs uppercase tracking-[0.2em] text-luxury-gold font-bold">Founder, The Collectors Exchange</p>
                                </div>
                            </div>
                        </div>
                        <div className="pt-20">
                            <div className="aspect-[3/4] bg-heritage-charcoal overflow-hidden p-2 shadow-2xl">
                                <img src={FounderImage} alt="Founder" className="w-full h-full object-cover contrast-[1.1] grayscale" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-white border-t border-heritage-bronze/10">
                <div className="container mx-auto px-6 text-center">
                    <Link to="/category" className="inline-block px-12 py-5 bg-heritage-charcoal text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-luxury-gold transition-all duration-500 rounded-sm">
                        EXPLORE THE REGISTRY
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default About;
