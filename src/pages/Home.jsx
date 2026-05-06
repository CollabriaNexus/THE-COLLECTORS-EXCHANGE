import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Archive, ArrowRight, UserCheck, Sparkles, Box, Shield, Users, Landmark } from 'lucide-react';
import Bullet from '../components/Bullet';
import heroVideo from '../assets/hero_section.mp4';
import verificationImage from '../assets/verification_authenticity.png';

const Home = () => {
    return (
        <div className="flex flex-col bg-heritage-cream selection:bg-luxury-gold selection:text-white overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative h-[90vh] min-h-[600px] flex flex-col justify-center items-center px-6 text-center overflow-hidden bg-heritage-charcoal">
                <video
                    src={heroVideo}
                    className="absolute inset-0 w-full h-full object-cover object-top opacity-50"
                    autoPlay
                    muted
                    playsInline
                    loop
                />
                <div className="absolute inset-0 bg-black/40"></div>

                <div className="container mx-auto max-w-5xl relative z-10">
                    <span className="text-luxury-gold tracking-[0.4em] font-sans text-[10px] md:text-xs font-bold uppercase mb-8 block animate-fade-in">
                        Authorized & Premium
                    </span>
                    <h1 className="text-6xl md:text-9xl font-serif text-white font-normal mb-10 leading-[0.9] tracking-tighter">
                        The <span className="italic font-light text-luxury-gold">Collectors</span> <br />
                        <span className="inline-block mt-2">Exchange</span>
                    </h1>
                    <div className="flex flex-col md:flex-row justify-center gap-6 mt-12">
                        <Link to="/THE-COLLECTORS-EXCHANGE/category" className="bg-luxury-gold text-black px-12 py-5 font-sans text-[10px] tracking-[0.3em] font-bold hover:bg-white hover:text-black transition-all duration-500 uppercase rounded-sm">
                            Explore The Exchange
                        </Link>
                        <Link to="/THE-COLLECTORS-EXCHANGE/auction" className="bg-transparent text-white border border-white/30 px-12 py-5 font-sans text-[10px] tracking-[0.3em] font-bold hover:bg-white hover:text-black transition-all duration-500 uppercase rounded-sm">
                            View Auctions
                        </Link>
                    </div>
                </div>
            </section>

            {/* Introduction Section - High Contrast */}
            <section className="py-32 px-6 bg-white relative border-b border-heritage-bronze/10">
                <div className="container mx-auto max-w-5xl text-center">
                    <div className="w-20 h-px bg-luxury-gold mx-auto mb-16"></div>
                    <h2 className="text-5xl md:text-8xl font-serif text-heritage-charcoal mb-12 leading-[1.1] tracking-tight">
                        From the Streets of India <br />
                        <span className="italic font-light text-luxury-gold">To Your Collection</span>
                    </h2>
                    <div className="max-w-4xl mx-auto">
                        <p className="text-xl md:text-2xl text-heritage-charcoal font-sans font-medium leading-relaxed">
                            We go where others don’t. Our mission is simple: sourcing the most unique, valuable, and historical finds from every corner of Indian pawn shops, street markets, and beyond. Whether you're a seasoned collector or a history enthusiast, we provide global access to a selection you won't find anywhere else. Experience the value of history, delivered to your door.
                        </p>
                    </div>
                </div>
            </section>

            {/* Institutional Registry Section */}
            <section className="py-32 px-6 bg-gray-100 relative">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
                        <div>
                            <span className="text-luxury-gold text-xs font-bold tracking-[0.4em] uppercase mb-4 block">Institutional Framework</span>
                            <h2 className="text-4xl md:text-6xl font-serif leading-tight text-heritage-charcoal">A New Standard <br /> of <span className="italic text-luxury-gold">Archival Integrity</span></h2>
                        </div>
                        <Link to="/THE-COLLECTORS-EXCHANGE/vision" className="group flex items-center gap-4 text-heritage-charcoal/50 hover:text-luxury-gold transition-colors text-xs font-bold tracking-widest uppercase">
                            Our Full Vision <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-16 bg-gray-200/80 shadow-md flex flex-col items-center text-center hover:shadow-lg transition-shadow group">
                            <Archive className="text-luxury-gold w-12 h-12 mb-8 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                            <h3 className="text-xl font-serif uppercase tracking-widest mb-6 font-bold text-heritage-charcoal">The Archive</h3>
                            <p className="text-sm text-heritage-charcoal/80 leading-relaxed font-medium">
                                Hand-picked artifacts sourced directly from the streets and private vaults. We don't list items; we archive history.
                            </p>
                        </div>
                        <div className="p-16 bg-gray-200/80 shadow-md flex flex-col items-center text-center hover:shadow-lg transition-shadow group">
                            <ShieldCheck className="text-luxury-gold w-12 h-12 mb-8 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                            <h3 className="text-xl font-serif uppercase tracking-widest mb-6 font-bold text-heritage-charcoal">Verification</h3>
                            <p className="text-sm text-heritage-charcoal/80 leading-relaxed font-medium">
                                Our institutional verification process ensures that every piece is original. We restore the trust lost in the pre-owned market.
                            </p>
                        </div>
                        <div className="p-16 bg-gray-200/80 shadow-md flex flex-col items-center text-center hover:shadow-lg transition-shadow group">
                            <UserCheck className="text-luxury-gold w-12 h-12 mb-8 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                            <h3 className="text-xl font-serif uppercase tracking-widest mb-6 font-bold text-heritage-charcoal">Handshake</h3>
                            <p className="text-sm text-heritage-charcoal/80 leading-relaxed font-medium">
                                Sellers are vetted with archival rigor. We ensure every agreement is honored and every transaction is backed by integrity.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Authenticated Heritage Section */}
            <section className="py-32 px-6 bg-white overflow-hidden">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col lg:flex-row items-center gap-24">
                        <div className="lg:w-1/2 space-y-10 relative">
                            <h2 className="text-5xl md:text-6xl font-serif text-heritage-charcoal leading-[1.1] tracking-tighter uppercase relative z-10">
                                The Truth Of <br />
                                <span className="text-luxury-gold">Heritage</span>
                            </h2>
                            <p className="text-xl text-heritage-charcoal font-sans font-medium leading-relaxed max-w-xl relative z-10">
                                Trust is our only currency. Our verification process is not a check; it is a commitment to the preservation of truth.
                            </p>
                            <ul className="space-y-6 relative z-10">
                                {[
                                    "Institutional verification with heritage brands",
                                    "Expert archival appraisal for all artifacts",
                                    "Transparent provenance and documented history"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-heritage-charcoal font-sans font-bold text-sm tracking-wide">
                                        <Sparkles className="text-luxury-gold w-4 h-4 flex-shrink-0" strokeWidth={2} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="relative z-10 p-2 bg-white border border-heritage-bronze/10 shadow-2xl overflow-hidden group">
                                <img src={verificationImage} alt="Heritage Verification" className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-heritage-charcoal/5 to-transparent"></div>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-luxury-gold/10 rounded-full blur-3xl -z-0"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sell with Confidence Section */}
            <section className="py-32 px-6 bg-heritage-charcoal text-white text-center border-t border-white/5">
                <div className="container mx-auto max-w-6xl">
                    <span className="text-luxury-gold text-xs font-bold tracking-[0.4em] uppercase mb-8 block">Global Outreach</span>
                    <h2 className="text-5xl md:text-7xl font-serif mb-20 leading-tight">Sell with Confidence</h2>

                    <div className="bg-[#0A0D12] border border-white/5 p-12 md:p-24 grid md:grid-cols-2 gap-20 text-left max-w-5xl mx-auto shadow-heritage relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                        <div className="space-y-10 relative z-10">
                            <h4 className="text-2xl font-serif text-luxury-gold flex items-center gap-4">
                                <div className="w-8 h-px bg-luxury-gold/50"></div>
                                Individual Sellers
                            </h4>
                            <ul className="space-y-6">
                                {[
                                    "Mandatory KYC (Aadhaar/PAN)",
                                    "Limit of 5 listings per account",
                                    "Strict manual archival approval"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-xs text-gray-300 font-sans font-bold tracking-widest uppercase">
                                        <Sparkles className="text-luxury-gold/50 w-4 h-4" strokeWidth={2} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-10 relative z-10">
                            <h4 className="text-2xl font-serif text-luxury-gold flex items-center gap-4">
                                <div className="w-8 h-px bg-luxury-gold/50"></div>
                                Company Sellers
                            </h4>
                            <ul className="space-y-6">
                                {[
                                    "GST & Founder verification required",
                                    "Company profile archival audit",
                                    "Unlimited listings (post-approval)"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-xs text-gray-300 font-sans font-bold tracking-widest uppercase">
                                        <Sparkles className="text-luxury-gold/50 w-4 h-4" strokeWidth={2} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-24">
                        <Link to="/THE-COLLECTORS-EXCHANGE/account" className="inline-flex items-center gap-6 text-white border border-white/20 px-12 py-6 hover:bg-white hover:text-black transition-all duration-500 font-sans text-xs tracking-[0.4em] uppercase font-black group">
                            Start Selling <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
