import AboutImage from '../assets/About_US.jpg';
import { History, ShieldCheck, Heart, Users, Compass, Landmark } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen bg-[#FDFDFD] text-[#1A1816] font-light overflow-hidden">
            {/* Cinematic Hero */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-[#C9A962]/10 bg-[#0F0E0D]">
                <div className="absolute inset-0 z-0">
                    <img
                        src={AboutImage}
                        alt="Heritage Backdrop"
                        className="w-full h-full object-cover opacity-[0.5] scale-105 contrast-[1.1] brightness-[0.8]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0D] via-transparent to-[#0F0E0D]/60"></div>
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>

                <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center justify-center gap-10 text-center">
                    {/* Center: Text Content */}
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-4 mb-6 justify-center">
                            <span className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-[#C9A962] font-semibold">AUTHORIZED & PREMIUM</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif mb-8 tracking-tight leading-[1.1] text-white">
                            A Marketplace for <br />
                            Authentic <span className="text-[#C9A962] italic font-normal">Collectibles</span> <span className="font-serif italic">&</span> <br />
                            Timeless Antiques
                        </h1>

                        <p className="text-sm sm:text-base md:text-lg text-white/80 font-light mb-10 max-w-2xl mx-auto leading-relaxed">
                            Verified. Original. Limited. Discover a curated world of rare finds and verified sellers.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                            <button className="px-8 py-3.5 bg-[#C9A962] text-white text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold shadow-lg hover:bg-[#b09351] transition-colors rounded-sm min-w-[200px]">
                                Explore The Exchange
                            </button>
                            <button className="px-8 py-3.5 bg-transparent border border-white/20 text-white text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold hover:bg-white hover:text-[#1A1816] transition-all rounded-sm min-w-[200px]">
                                View Auctions
                            </button>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-40">
                    <span className="text-[9px] uppercase tracking-[1em] text-[#C9A962] font-bold">Scroll</span>
                    <div className="w-px h-16 bg-gradient-to-b from-[#C9A962] to-transparent animate-pulse"></div>
                </div>
            </section>

            {/* Philosophy Grid */}
            <section className="py-14 px-6 container mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <div className="space-y-12">
                        <div className="relative group">
                            <div className="absolute -left-6 top-0 w-1 h-12 bg-[#C9A962]/30"></div>
                            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-[#4A443E]">
                                Long before mass production, before trends moved at internet speed, value was built through craft, patience, and provenance. A timepiece was not just worn — it was inherited. A collectible was not bought — it was kept. A possession was not replaced — it became a story.
                            </p>
                        </div>

                        <div className="p-8 sm:p-10 bg-[#F4F1ED] rounded-sm border border-[#C9A962]/10 relative overflow-hidden shadow-sm">
                            <Landmark className="absolute -right-8 -bottom-8 text-[#C9A962]/5 w-32 h-32 sm:w-40 sm:h-40" />
                            <h2 className="text-2xl sm:text-3xl font-serif mb-6 text-[#1A1816]">At The Collectors’ Exchange, we exist to preserve that philosophy.</h2>
                            <p className="text-[#6B635B] leading-relaxed italic text-sm sm:text-base">
                                We are not a marketplace for the new. <br />
                                We are a House of Heritage for the pre-owned — for items that have lived, endured, and earned their place in time.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bento Item 1 */}
                        <div className="col-span-1 md:col-span-2 p-8 bg-white border border-[#C9A962]/10 rounded-sm hover:border-[#C9A962]/30 transition-all group shadow-sm">
                            <History className="text-[#C9A962] mb-6 group-hover:scale-110 transition-transform" size={28} strokeWidth={1} />
                            <h3 className="text-xl font-serif mb-4 text-[#1A1816]">Where Stories Are Collected, Not Discarded</h3>
                            <div className="space-y-4 text-sm text-[#6B635B] leading-relaxed">
                                <p>Across generations, families have passed down watches, antiques, rare collectibles, toys, sneakers, and cultural artefacts — not as assets, but as memories.</p>
                                <p>Today, many millennials and Gen Z collectors find themselves custodians of these inherited pieces, along with carefully built personal collections of their own.</p>
                                <p>Yet, until now, there has been no trusted space where such objects could be honoured, verified, and exchanged with dignity.</p>
                                <p className="text-[#C9A962] font-semibold">The Collectors’ Exchange was built to be that space.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Belief Section */}
            <section className="py-16 bg-[#F9F7F4] relative overflow-hidden border-y border-[#C9A962]/10">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#C9A962 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }}></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-serif mb-4 text-[#1A1816]">Our Belief</h2>
                        <div className="w-12 h-px bg-[#C9A962]/40 mx-auto"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-0 border border-[#C9A962]/10 bg-white shadow-sm">
                        <div className="p-8 sm:p-12 border-b sm:border-b-0 sm:border-r border-[#C9A962]/10 text-center group hover:bg-[#FDFDFD] transition-colors">
                            <Compass className="mx-auto mb-6 sm:mb-8 text-[#1A1816]/60 group-hover:text-[#C9A962] transition-colors w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.5} />
                            <p className="text-base sm:text-lg font-serif italic text-[#4A443E] group-hover:text-[#1A1816] transition-colors">"Every pre-owned valuable is respected for its journey"</p>
                        </div>
                        <div className="p-8 sm:p-12 border-b sm:border-b-0 sm:border-r border-[#C9A962]/10 text-center group hover:bg-[#FDFDFD] transition-colors">
                            <Users className="mx-auto mb-6 sm:mb-8 text-[#1A1816]/60 group-hover:text-[#C9A962] transition-colors w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.5} />
                            <p className="text-base sm:text-lg font-serif italic text-[#4A443E] group-hover:text-[#1A1816] transition-colors">"Every seller is valued as a custodian, not just a vendor"</p>
                        </div>
                        <div className="p-8 sm:p-12 text-center group hover:bg-[#FDFDFD] transition-colors">
                            <Heart className="mx-auto mb-6 sm:mb-8 text-[#1A1816]/60 group-hover:text-[#C9A962] transition-colors w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.5} />
                            <p className="text-base sm:text-lg font-serif italic text-[#4A443E] group-hover:text-[#1A1816] transition-colors">"Every buyer understands they are acquiring more than an object — they are acquiring a legacy"</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision Section: Archival Masterpiece */}
            <section className="py-24 bg-[#FDFDFD] relative overflow-hidden border-y border-[#C9A962]/20">
                {/* Architectural Background Pattern (Faint SVG) */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="arch-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#C9A962" strokeWidth="0.5" />
                                <circle cx="0" cy="0" r="1" fill="#C9A962" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#arch-grid)" />
                    </svg>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid lg:grid-cols-12 gap-12 items-center">
                            {/* Left: Masterpiece Medal */}
                            <div className="lg:col-span-4 flex justify-center lg:justify-start">
                                <div className="relative">
                                    {/* Rotating Outer Ring */}
                                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border border-[#C9A962]/20 animate-spin-slow"></div>
                                    {/* Inner Medallion */}
                                    <div className="absolute inset-4 rounded-full border-2 border-[#C9A962]/40 bg-white shadow-xl flex items-center justify-center group overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A962]/5 to-transparent"></div>
                                        <Landmark className="text-[#1A1816] w-16 h-16 md:w-24 md:h-24 opacity-80 group-hover:scale-110 transition-transform duration-1000" strokeWidth={0.3} />
                                        {/* Compass Ornament */}
                                        <div className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full border border-[#C9A962]/20 flex items-center justify-center shadow-lg">
                                            <Compass className="text-[#C9A962] w-5 h-5 animate-pulse" strokeWidth={1} />
                                        </div>
                                    </div>
                                    {/* Decorative Crosshair */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-px bg-gradient-to-r from-transparent via-[#C9A962]/20 to-transparent rotate-45"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-px bg-gradient-to-r from-transparent via-[#C9A962]/20 to-transparent -rotate-45"></div>
                                </div>
                            </div>

                            {/* Right: Cinematic Content */}
                            <div className="lg:col-span-8 space-y-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-px bg-[#C9A962]"></div>
                                    <span className="text-[11px] uppercase tracking-[1em] text-[#C9A962] font-black">Archive Vision</span>
                                </div>

                                <div className="space-y-6">
                                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif text-[#1A1816] leading-none mb-4">
                                        The <span className="text-[#C9A962] italic">Legacy</span> Statement
                                    </h2>
                                    <div className="w-24 h-1 bg-gradient-to-r from-[#C9A962] to-transparent"></div>
                                </div>

                                <div className="relative">
                                    <p className="text-xl sm:text-2xl md:text-4xl font-serif italic text-[#4A443E] leading-relaxed border-l-4 border-[#C9A962]/10 pl-6 sm:pl-8 py-2">
                                        To become the definitive global archive where the world's most meaningful history is preserved, verified, and exchanged for generations to come.
                                    </p>
                                    <div className="absolute -left-4 -top-8 text-[#C9A962]/5 text-[100px] sm:text-[150px] font-serif select-none italic">"</div>
                                </div>

                                <div className="pt-8 grid grid-cols-2 sm:flex items-center gap-6 sm:gap-10 opacity-60">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-[#C9A962] rounded-full"></div>
                                        <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-nowrap">Provenance</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-[#C9A962] rounded-full"></div>
                                        <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-nowrap">Authenticity</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-[#C9A962] rounded-full"></div>
                                        <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-nowrap">Continuity</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Light Beam Effect */}
                <div className="absolute -top-1/2 left-1/4 w-[1px] h-[200%] bg-gradient-to-b from-transparent via-[#C9A962]/10 to-transparent rotate-12 blur-[1px]"></div>
                <div className="absolute -top-1/2 right-1/4 w-[1px] h-[200%] bg-gradient-to-b from-transparent via-[#C9A962]/10 to-transparent rotate-12 blur-[1px]"></div>
            </section>

            {/* Structured Content Sections */}
            <section className="py-16 container mx-auto px-6">
                <div className="max-w-4xl mx-auto space-y-24">
                    {/* Verification */}
                    <div className="flex flex-col md:flex-row gap-16 items-center">
                        <div className="md:w-1/2">
                            <div className="text-[10px] uppercase tracking-[0.4em] text-[#C9A962] font-bold mb-4">AUTHENTICATION</div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-6 sm:mb-8 text-[#1A1816]">Curated. Verified. Meaningful.</h2>
                            <p className="text-base sm:text-lg text-[#C9A962]/80 italic font-serif mb-6 sm:mb-8 border-l-2 border-[#C9A962]/20 pl-6">We believe trust is not claimed — it is earned.</p>
                            <div className="space-y-6 text-[#6B635B] leading-relaxed">
                                <p>Each item listed on The Collectors’ Exchange undergoes a structured verification process before being marked as authenticated by our marketplace. Our focus is not volume, but integrity. We choose curation over clutter, and provenance over popularity.</p>
                                <p>Whether it is a timepiece that has measured decades, a sneaker preserved in its original condition, or a collectible tied to cultural memory, we ensure that what enters our exchange belongs here.</p>
                            </div>
                        </div>
                        <div className="md:w-1/2 p-1 bg-[#F4F1ED] border border-[#C9A962]/10 rounded-sm shadow-inner">
                            <img src={AboutImage} alt="Verification" className="opacity-80 hover:opacity-100 transition-all duration-700 contrast-[1.05]" />
                        </div>
                    </div>

                    {/* Collectors Segment */}
                    <div className="space-y-16">
                        <div className="text-center">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-4 sm:mb-6 text-[#1A1816]">Built for Collectors, Then and Now</h2>
                            <p className="text-sm sm:text-base text-[#6B635B] max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                                The courage to collect — to hold onto something when the world moves on — is rare. It takes patience, appreciation, and respect for time itself. We honour that courage.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: "The Seasoned Collector", desc: "Refining a lifetime archive with precision and care." },
                                { title: "The Inheritor", desc: "Seeking a respectful, trusted place for family treasures." },
                                { title: "The Modern Enthusiast", desc: "Discovering the joy of meaningful ownership and history." }
                            ].map((item, i) => (
                                <div key={i} className="p-8 bg-white border border-[#C9A962]/10 hover:border-[#C9A962]/40 transition-all text-center shadow-sm">
                                    <h3 className="font-serif text-xl mb-3 text-[#1A1816]">{item.title}</h3>
                                    <p className="text-xs text-[#6B635B] font-light leading-relaxed tracking-wide">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="text-center pt-8 border-t border-[#C9A962]/10">
                            <p className="font-serif italic text-xl text-[#C9A962]">
                                "Here, value is not defined by age alone — but by story, condition, rarity, and relevance."
                            </p>
                        </div>
                    </div>

                    {/* Final Promise */}
                    <div className="bg-[#1A1816] p-8 sm:p-16 rounded-sm text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A962]/5 rounded-bl-full"></div>
                        <ShieldCheck className="mx-auto mb-6 sm:mb-8 text-[#C9A962] w-10 h-10 sm:w-12 sm:h-12" strokeWidth={1} />
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-4 text-[#E5E1DA]">Our Promise</h2>
                        <p className="text-[#9C8B7E] mb-8 sm:mb-12 text-base sm:text-lg italic">We promise to protect:</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-12">
                            <div className="flex items-center gap-4 justify-center sm:justify-start">
                                <div className="w-1.5 h-1.5 bg-[#C9A962] rounded-full"></div>
                                <span className="text-xl sm:text-2xl font-serif text-[#E5E1DA]">The privacy of our sellers</span>
                            </div>
                            <div className="flex items-center gap-4 justify-center sm:justify-start">
                                <div className="w-1.5 h-1.5 bg-[#C9A962] rounded-full"></div>
                                <span className="text-xl sm:text-2xl font-serif text-[#E5E1DA]">The authenticity of every item sold</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
