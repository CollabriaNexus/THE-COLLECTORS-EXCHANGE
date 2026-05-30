import React, { useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ShieldCheck, UserCheck, Star, ArrowRight, Wallet, Archive, ChevronLeft, ChevronRight, ShoppingBag, Award, Gem, Heart, Pause, Play, Quote, QuoteIcon } from 'lucide-react';
import Bullet from '../components/Bullet';
import heroVideo from '../assets/hero_section.mp4';
import verificationAuthenticity from '../assets/verification_authenticity.png';
import { useProducts } from '../hooks/api/useProducts';
import { getUser, addToCart, isInCart } from '../utils/storage';
import { useTestimonials } from '../hooks/api/useTestimonials';

const FeaturedProductsCarousel = () => {
    const trackRef = useRef(null);
    const [paused, setPaused] = React.useState(false);
    const { data, isLoading } = useProducts(null, '', 1, 10);
    const products = data?.products || [];

    if (isLoading || products.length === 0) return null;

    const cards = products.map((product) => {
        const title = product.title || product.name;
        return (
            <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="flex-shrink-0 w-[280px] sm:w-[320px] bg-white border border-heritage-beige group hover:shadow-heritage-hover transition-all duration-500 snap-start"
            >
                <div className="relative aspect-[4/5] bg-heritage-beige overflow-hidden">
                    {product.image ? (
                        <img src={product.image} alt={title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-heritage-bronze/40 bg-heritage-beige">
                            <Gem size={48} strokeWidth={1} />
                        </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-heritage-charcoal/90 backdrop-blur-sm text-white text-xs px-4 py-2 font-sans tracking-[0.15em] uppercase flex items-center gap-2">
                        <Award size={14} strokeWidth={1.5} />
                        <span>Featured</span>
                    </div>
                </div>
                <div className="p-5">
                    <span className="text-xs text-heritage-bronze uppercase tracking-[0.15em] font-medium">{product.category}</span>
                    <h3 className="font-serif text-lg font-medium text-heritage-charcoal mb-1 leading-tight mt-1">{title}</h3>
                    <p className="text-heritage-gold-muted font-serif text-lg font-medium mt-2">₹{product.price?.toLocaleString()}</p>
                </div>
            </Link>
        );
    });

    return (
        <section className="py-16 sm:py-20 px-6 bg-heritage-cream overflow-hidden">
            <div className="container mx-auto max-w-6xl">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="h-px w-8 bg-luxury-gold/40"></div>
                            <span className="text-luxury-gold tracking-[0.3em] text-xs font-bold uppercase">Curated Selection</span>
                            <div className="h-px w-8 bg-luxury-gold/40"></div>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-serif text-heritage-charcoal">Featured <span className="text-luxury-gold italic font-light">Products</span></h2>
                    </div>
                    <button
                        onClick={() => setPaused(p => !p)}
                        className="p-3 border border-heritage-bronze/20 hover:border-heritage-bronze hover:bg-white transition-all duration-300 rounded-full"
                        title={paused ? 'Resume' : 'Pause'}
                    >
                        {paused ? <Play size={20} className="text-heritage-charcoal" /> : <Pause size={20} className="text-heritage-charcoal" />}
                    </button>
                </div>

                <div className="relative">
                    <style>{`
                        @keyframes marquee {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); }
                        }
                        .carousel-track {
                            animation: marquee 40s linear infinite;
                        }
                        .carousel-track:hover {
                            animation-play-state: paused;
                        }
                    `}</style>
                    <div
                        ref={trackRef}
                        className={`carousel-track flex gap-6 ${paused ? '' : ''}`}
                        style={{
                            width: 'max-content',
                            animationPlayState: paused ? 'paused' : '',
                        }}
                        onMouseEnter={() => setPaused(true)}
                        onMouseLeave={() => setPaused(false)}
                    >
                        {cards}
                        {cards}
                    </div>
                </div>
            </div>
        </section>
    );
};

const Home = () => {
    const homeVideoRef = useRef(null);

    const handleVideoEnded = () => {
        window.dispatchEvent(new CustomEvent('homeVideoEnded'));
    };

    return (
        <div className="flex flex-col">
            <Helmet><title>The Collectors Exchange — Luxury Pre-Owned & Rare Collectibles</title></Helmet>
            {/* Hero Section */}
            <section className="relative h-screen min-h-[500px] flex flex-col justify-center items-center px-4 sm:px-6 text-center overflow-hidden">
                <video
                    ref={homeVideoRef}
                    src={heroVideo}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    autoPlay
                    muted
                    playsInline
                    onEnded={handleVideoEnded}
                />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/50"></div>

                <div className="container mx-auto max-w-4xl relative z-10">
                    <h5 className="text-luxury-gold tracking-[0.2em] font-sans text-[10px] sm:text-sm font-semibold uppercase mb-3 sm:mb-4">
                        Authorized & Premium
                    </h5>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif text-white font-bold mb-4 sm:mb-6 leading-tight drop-shadow-lg">
                        A Marketplace for Authentic <span className="italic text-luxury-gold">Collectibles</span> & Timeless Antiques
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-200 font-sans font-light mb-6 sm:mb-10 max-w-2xl mx-auto">
                        Verified. Original. Limited. Discover a curated world of rare finds and verified sellers.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                        <Link to="/category" className="bg-luxury-gold text-black px-6 sm:px-8 py-3 sm:py-4 font-sans text-xs sm:text-sm tracking-widest hover:bg-white transition-colors duration-300">
                            EXPLORE THE EXCHANGE
                        </Link>
                        <Link to="/auction" className="bg-transparent text-white border border-white px-6 sm:px-8 py-3 sm:py-4 font-sans text-xs sm:text-sm tracking-widest hover:bg-white hover:text-black transition-colors duration-300">
                            VIEW AUCTIONS
                        </Link>
                    </div>
                </div>
            </section>

            {/* Marketplace Overview */}
            <section className="py-12 sm:py-16 lg:py-20 px-6 bg-secondary-bg">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 text-center">
                        <div className="p-6 sm:p-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                            <Archive className="mx-auto text-luxury-gold mb-6 w-10 h-10 sm:w-12 sm:h-12" />
                            <h3 className="text-xl sm:text-2xl font-serif mb-4">Curated Collection</h3>
                            <p className="text-gray-600 font-sans font-light">
                                From vintage artifacts to limited edition luxury goods, every item is hand-picked for its uniqueness.
                            </p>
                        </div>
                        <div className="p-6 sm:p-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                            <ShieldCheck className="mx-auto text-luxury-gold mb-6 w-10 h-10 sm:w-12 sm:h-12" />
                            <h3 className="text-xl sm:text-2xl font-serif mb-4">Authenticity Verified</h3>
                            <p className="text-gray-600 font-sans font-light text-sm sm:text-base">
                                We verify products with brands and experts to ensure 100% originality. No replicas, no fakes.
                            </p>
                        </div>
                        <div className="p-6 sm:p-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
                            <UserCheck className="mx-auto text-luxury-gold mb-6 w-10 h-10 sm:w-12 sm:h-12" />
                            <h3 className="text-xl sm:text-2xl font-serif mb-4">Trusted Sellers</h3>
                            <p className="text-gray-600 font-sans font-light">
                                Sellers are strictly vetted with mandatory KYC and compliance checks before they can list.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Carousel */}
            <FeaturedProductsCarousel />

            {/* Verification Works */}
            <section className="py-12 sm:py-16 lg:py-20 px-6 bg-primary-bg">
                <div className="container mx-auto max-w-5xl flex flex-col lg:flex-row items-center gap-10 sm:gap-14 lg:gap-16">
                    <div className="lg:w-1/2">
                        <h2 className="text-3xl sm:text-4xl font-serif mb-6 leading-tight">The Standard of <br /> <span className="text-luxury-gold">Authenticity</span></h2>
                        <p className="text-gray-600 mb-6 font-light leading-relaxed">
                            At The Collectors Exchange, trust is our currency. Our rigorous verification process ensures that every item you purchase is genuine.
                        </p>
                        <ul className="space-y-4 font-sans text-gray-700">
                            <li className="flex items-center gap-4">
                                <Bullet className="text-luxury-gold" />
                                Direct verification with respective brands
                            </li>
                            <li className="flex items-center gap-4">
                                <Bullet className="text-luxury-gold" />
                                Expert appraisal for antiques
                            </li>
                            <li className="flex items-center gap-4">
                                <Bullet className="text-luxury-gold" />
                                Transparent history and provenance
                            </li>
                        </ul>
                    </div>
                    <div className="lg:w-1/2 h-[300px] sm:h-[350px] lg:h-[400px] w-full overflow-hidden rounded-sm shadow-heritage">
                        <img
                            src={verificationAuthenticity}
                            alt="Verification & Authenticity"
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                    </div>
                </div>
            </section>

            {/* Seller Policy Summary */}
            <section className="py-12 sm:py-16 lg:py-20 px-6 bg-black text-white text-center">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-8">Sell with Confidence</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12 text-left bg-gray-900 p-6 sm:p-10 border border-gray-800">
                        <div>
                            <h4 className="text-xl font-serif text-luxury-gold mb-2">Individual Sellers</h4>
                            <ul className="text-gray-400 space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <Bullet className="text-luxury-gold mt-1 w-2 h-2" />
                                    Mandatory KYC (Aadhaar/PAN)
                                </li>
                                <li className="flex items-start gap-2">
                                    <Bullet className="text-luxury-gold mt-1 w-2 h-2" />
                                    Limit of 5 listings per account
                                </li>
                                <li className="flex items-start gap-2">
                                    <Bullet className="text-luxury-gold mt-1 w-2 h-2" />
                                    Strict manual approval
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xl font-serif text-luxury-gold mb-2">Company Sellers</h4>
                            <ul className="text-gray-400 space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <Bullet className="text-luxury-gold mt-1 w-2 h-2" />
                                    GST & Founder verification required
                                </li>
                                <li className="flex items-start gap-2">
                                    <Bullet className="text-luxury-gold mt-1 w-2 h-2" />
                                    Company profile approval
                                </li>
                                <li className="flex items-start gap-2">
                                    <Bullet className="text-luxury-gold mt-1 w-2 h-2" />
                                    Unlimited listings (post-approval)
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-10">
                        <Link to="/account" className="inline-flex items-center gap-2 text-white border-b border-luxury-gold pb-1 hover:text-luxury-gold transition-colors">
                            Start Selling <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <TestimonialsSection />
        </div>
    );
};

const TestimonialsSection = () => {
    const { data: testimonials, isLoading } = useTestimonials();
    const [activeIndex, setActiveIndex] = React.useState(0);

    if (isLoading || !testimonials?.length) return null;

    const t = testimonials[activeIndex];

    return (
        <section className="py-16 sm:py-20 px-6 bg-heritage-cream">
            <div className="container mx-auto max-w-4xl text-center">
                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="h-px w-8 bg-luxury-gold/40"></div>
                    <span className="text-luxury-gold tracking-[0.3em] text-xs font-bold uppercase">Testimonials</span>
                    <div className="h-px w-8 bg-luxury-gold/40"></div>
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif text-heritage-charcoal mb-10">What Our <span className="text-luxury-gold italic font-light">Collectors</span> Say</h2>
                <div className="bg-white p-8 sm:p-12 shadow-sm border border-gray-100 relative">
                    <Quote className="text-luxury-gold/20 absolute top-4 left-4 w-12 h-12 sm:w-16 sm:h-16" />
                    <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-sans italic mb-6 relative z-10">&ldquo;{t.content}&rdquo;</p>
                    <div className="flex items-center justify-center gap-1 mb-3">
                        {[1,2,3,4,5].map(i => (
                            <span key={i} className={`text-lg ${i <= t.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                        ))}
                    </div>
                    <p className="font-serif font-bold text-heritage-charcoal">— {t.authorName}</p>
                </div>
                {testimonials.length > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-6">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setActiveIndex(i)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeIndex ? 'bg-luxury-gold w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Home;
