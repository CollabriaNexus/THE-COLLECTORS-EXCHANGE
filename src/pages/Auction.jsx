import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Instagram, ArrowRight, Clock } from 'lucide-react';
import SEO from '../components/SEO';

const Auction = () => {
    return (
        <div className="min-h-screen bg-heritage-cream">
            <SEO
                title="Auctions"
                description="Participate in live and upcoming auctions for rare collectibles, antiques, and limited-edition pieces at The Collectors Exchange. Bid with confidence on verified items."
                canonical="/auction"
            />
            {/* Hero */}
            <section className="relative h-[60vh] sm:h-[65vh] lg:h-[70vh] min-h-[400px] sm:min-h-[450px] lg:min-h-[500px] flex items-center justify-center overflow-hidden bg-heritage-charcoal">
                <div className="absolute inset-0 bg-black/50 z-10"></div>
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=2500&auto=format&fit=crop')" }}
                >
                    <div className="absolute inset-0 bg-black/60"></div>
                </div>
                <div className="relative z-20 container mx-auto px-4 sm:px-6 text-center">
                    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="h-px w-8 sm:w-12 bg-luxury-gold/50"></div>
                        <span className="text-luxury-gold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-bold">Coming Soon</span>
                        <div className="h-px w-8 sm:w-12 bg-luxury-gold/50"></div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-7xl font-serif text-white font-normal mb-4 sm:mb-6">
                        The Auction House
                    </h1>
                    <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto font-light">
                        Bid on rare collectors' items, verified and curated by our experts.
                    </p>
                    <a
                        href="https://www.instagram.com/the_collectors_exchange/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-6 sm:mt-8 px-5 sm:px-6 py-2.5 sm:py-3 border border-white/20 text-white/80 hover:text-luxury-gold hover:border-luxury-gold/50 transition-all duration-300 text-[11px] sm:text-sm uppercase tracking-widest"
                    >
                        <Instagram size={16} className="sm:w-[18px] sm:h-[18px]" />
                        Follow on Instagram
                    </a>
                </div>
            </section>

            {/* Coming Soon Content */}
            <section className="py-20 sm:py-28 px-6">
                <div className="container mx-auto max-w-3xl text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-heritage-charcoal/5 flex items-center justify-center mx-auto mb-8">
                        <Gavel size={36} className="text-heritage-gold-muted/60 sm:w-[44px] sm:h-[44px]" strokeWidth={1} />
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-heritage-charcoal mb-6 leading-tight">
                        The Gavel Will <span className="italic text-luxury-gold">Soon</span> Fall
                    </h2>
                    <p className="text-heritage-charcoal/60 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-4">
                        Our auction house is being prepared for its inaugural season. We are curating an exceptional collection of artifacts that will be presented to discerning collectors like you.
                    </p>
                    <div className="flex items-center justify-center gap-3 text-heritage-bronze/50 mt-10 mb-12">
                        <Clock size={18} className="sm:w-5 sm:h-5" />
                        <span className="text-sm uppercase tracking-[0.2em] font-medium">Launching Soon</span>
                    </div>
                    <Link
                        to="/category"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-heritage-charcoal text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-heritage-brown transition-colors duration-300"
                    >
                        Explore The Exchange <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Auction;
