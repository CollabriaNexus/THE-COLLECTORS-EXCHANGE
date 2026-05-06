import React from 'react';
import { Instagram } from 'lucide-react';

const Auction = () => {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=2500&auto=format&fit=crop')"
                }}
            >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/70"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 px-6 max-w-3xl mx-auto text-center">
                {/* Label */}
                <div className="mb-8">
                    <span className="text-luxury-gold uppercase tracking-[0.2em] font-bold text-sm md:text-base">
                        Coming Soon
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">
                    Sovereign Auctions by <br /> House of Heritage
                </h1>

                {/* Description */}
                <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed mb-12 max-w-2xl mx-auto">
                    Our auction house is being carefully prepared to honour rarity, provenance, and timeless value.
                    <br className="hidden md:block" />
                    We will be launching this experience soon.
                    <br /><br />
                    Until then, follow us to stay connected with our journey.
                </p>

                {/* CTA */}
                <a
                    href="https://www.instagram.com/the_collectors_exchange/?utm_source=ig_web_button_share_sheet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 border border-luxury-gold text-white hover:bg-luxury-gold hover:text-black transition-all duration-300 uppercase tracking-widest text-sm font-medium"
                >
                    <Instagram size={20} />
                    Follow us on Instagram
                </a>

                {/* Footer Note */}
                <div className="mt-20 opacity-60 font-serif italic text-sm">
                    A legacy takes time. Thank you for your patience.
                </div>
            </div>
        </div>
    );
};

export default Auction;
