import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO, { OrganizationSchema, WebSiteSchema } from '../components/SEO';
import { ShieldCheck, UserCheck, Star, ArrowRight, Archive, Award, Gem, Quote, QuoteIcon, ShoppingBag, Sparkles, Check, XCircle } from 'lucide-react';
import Bullet from '../components/Bullet';
import heroVideoWebm from '../assets/hero_section.webm';
import heroVideoMp4 from '../assets/hero_section-compressed.mp4';
import verificationAuthenticity from '../assets/verification_authenticity.webp';
import { useProducts } from '../hooks/api/useProducts';
import { useTestimonials } from '../hooks/api/useTestimonials';
import { useCart, useAddToCart } from '../hooks/api/useCart';
import { getUser } from '../utils/storage';
import { useToast } from '../components/Toast';
import { useInView } from '../hooks/useInView';

const Reveal = ({ children, className = '' }) => {
    const [ref, inView] = useInView();
    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
        >
            {children}
        </div>
    );
};

const FeaturedProductCard = ({ product }) => {
    const user = getUser();
    const navigate = useNavigate();
    const showToast = useToast();
    const { data: cartItems = [] } = useCart(user?.id);
    const addToCartMutation = useAddToCart();
    const [cartFeedback, setCartFeedback] = useState(false);
    const cartFeedbackTimer = useRef(null);
    const inCart = cartItems.some(item => item.productId === product.id);
    const title = product.title || product.name;

    useEffect(() => {
        return () => clearTimeout(cartFeedbackTimer.current);
    }, []);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            showToast('Please sign in to add items to cart', 'error');
            return;
        }
        if (inCart) return;
        try {
            await addToCartMutation.mutateAsync({ userId: user.id, productId: product.id });
            setCartFeedback(true);
            clearTimeout(cartFeedbackTimer.current);
            cartFeedbackTimer.current = setTimeout(() => setCartFeedback(false), 2000);
        } catch (err) {
            if (err?.response?.status === 401) {
                showToast('Please sign in to add items to cart', 'error');
            } else {
                showToast(err?.response?.data?.message || err?.response?.data?.error || 'Failed to add to cart', 'error');
            }
        }
    };

    return (
        <div className="flex-shrink-0 w-[240px] sm:w-[280px] md:w-[320px] bg-white border border-heritage-beige group hover:shadow-heritage-hover transition-all duration-500 snap-start flex flex-col">
            <Link to={`/product/${product.id}`} className="block">
                <div className="relative aspect-[4/5] bg-heritage-beige overflow-hidden">
                    {product.image ? (
                        <img loading="lazy" width="400" height="500" src={product.image} alt={title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-heritage-bronze/40 bg-heritage-beige">
                            <Gem size={36} strokeWidth={1} />
                        </div>
                    )}
                    {product.status === 'Sold' && (
                        <div className="absolute inset-0 bg-heritage-charcoal/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                            <span className="bg-white/90 text-heritage-charcoal text-[10px] sm:text-sm font-bold px-3 sm:px-4 py-1 sm:py-1.5 uppercase tracking-[0.15em] shadow-lg">Sold Out</span>
                        </div>
                    )}
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-heritage-charcoal/90 backdrop-blur-sm text-white text-[10px] sm:text-xs px-2 sm:px-4 py-1 sm:py-2 font-sans tracking-[0.15em] uppercase flex items-center gap-1 sm:gap-2">
                        <Award size={12} strokeWidth={1.5} />
                        <span>Featured</span>
                    </div>
                </div>
            </Link>
            <div className="p-3 sm:p-5 flex flex-col flex-grow">
                <div className="flex-grow">
                    <span className="text-[10px] sm:text-xs text-heritage-bronze uppercase tracking-[0.15em] font-medium">{product.category}</span>
                    <Link to={`/product/${product.id}`} className="block hover:text-luxury-gold transition-colors">
                        <h3 className="font-serif text-sm sm:text-base md:text-lg font-medium text-heritage-charcoal mb-1 leading-tight mt-1">{title}</h3>
                    </Link>
                    <p className="text-heritage-gold-muted font-serif text-sm sm:text-base md:text-lg font-medium mt-2">₹{product.price?.toLocaleString()}</p>
                </div>
                {product.status === 'Sold' ? (
                    <div className="w-full py-2 sm:py-3 text-[11px] sm:text-sm uppercase tracking-widest flex items-center justify-center gap-1 sm:gap-2 mt-3 sm:mt-4 bg-gray-100 text-gray-400 cursor-default">
                        <XCircle size={13} />
                        Sold Out
                    </div>
                ) : (
                    <button
                        onClick={inCart ? () => navigate('/cart') : cartFeedback ? undefined : handleAddToCart}
                        disabled={addToCartMutation.isPending || cartFeedback}
                        className={`w-full py-2 sm:py-3 text-[11px] sm:text-sm uppercase tracking-widest transition-colors duration-300 flex items-center justify-center gap-1 sm:gap-2 mt-3 sm:mt-4 active:scale-[0.97] ${
                            cartFeedback || inCart
                                ? 'bg-luxury-gold text-white cursor-pointer hover:bg-luxury-gold/90'
                                : 'bg-black text-white hover:bg-luxury-gold'
                        }`}
                    >
                        {cartFeedback ? <Check size={13} /> : product.status === 'Sold' ? <XCircle size={13} /> : <ShoppingBag size={13} />}
                        {addToCartMutation.isPending ? 'Adding...' : cartFeedback ? 'Added' : inCart ? 'In Cart →' : 'Add to Cart'}
                    </button>
                )}
            </div>
        </div>
    );
};

const FeaturedProductsCarousel = () => {
    const trackRef = useRef(null);
    const [paused, setPaused] = React.useState(false);
    const { data, isLoading } = useProducts(null, '', 1, 10);
    const allProducts = data?.products || [];

    // Only show products marked as featured or most_rare
    let products = allProducts.filter(
        p => p.listingCategory === 'featured' || p.listingCategory === 'most_rare'
    );

    if (isLoading || products.length === 0) return null;

    // Sort: non-sold items first, sold items last
    products = [...products].sort((a, b) => {
        if (a.status === 'Sold' && b.status !== 'Sold') return 1;
        if (a.status !== 'Sold' && b.status === 'Sold') return -1;
        return 0;
    });

    const cards = products.map((product) => (
        <FeaturedProductCard key={product.id} product={product} />
    ));

    return (
        <section className="py-12 sm:py-20 px-6 bg-heritage-cream overflow-hidden">
            <div className="container mx-auto max-w-6xl">
                <Reveal>
                    <div className="text-center mb-8 sm:mb-10">
                        <div className="flex items-center justify-center gap-4 mb-3">
                            <div className="h-px w-8 bg-luxury-gold/40"></div>
                            <span className="text-luxury-gold tracking-[0.3em] text-xs font-bold uppercase">Curated Selection</span>
                            <div className="h-px w-8 bg-luxury-gold/40"></div>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-serif text-heritage-charcoal">Featured <span className="text-luxury-gold italic font-light">Products</span></h2>
                    </div>
                </Reveal>

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
                        className="carousel-track flex gap-6"
                        style={{
                            width: 'max-content',
                            animationPlayState: paused ? 'paused' : '',
                        }}
                        onMouseEnter={() => setPaused(true)}
                        onMouseLeave={() => setPaused(false)}
                    >
                        {cards}
                        {cards.length >= 2 && cards}
                    </div>
                </div>
            </div>
        </section>
    );
};

const Home = () => {
    return (
        <div className="flex flex-col">
            <SEO
                description="India's premier curated marketplace for verified pre-owned collectibles, antiques, and limited-edition pieces. Every item authenticated. Trusted sellers. Secure transactions."
                canonical="/"
                ogType="website"
            />
            <OrganizationSchema />
            <WebSiteSchema />
            {/* Hero Section */}
            <section className="relative h-screen min-h-[500px] flex flex-col justify-center items-center px-4 sm:px-6 text-center overflow-hidden bg-black">
                    <video autoPlay muted playsInline preload="auto" fetchpriority="high" onEnded={() => window.dispatchEvent(new Event('homeVideoEnded'))} className="absolute inset-0 w-full h-full object-cover">
                        <source src={heroVideoWebm} type="video/webm" />
                        <source src={heroVideoMp4} type="video/mp4" />
                    </video>
                <div className="absolute inset-0 bg-black/40"></div>

                <div className="container mx-auto max-w-4xl relative z-10">
                    <h5 className="text-luxury-gold tracking-[0.2em] font-sans text-[10px] sm:text-sm font-semibold uppercase mb-3 sm:mb-4">
                        Authorized & Premium
                    </h5>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-serif text-white font-bold mb-4 sm:mb-6 leading-tight drop-shadow-lg">
                        A Marketplace for Authentic <span className="italic text-luxury-gold">Collectibles</span> & Timeless Antiques
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 font-sans font-light mb-4 sm:mb-10 max-w-2xl mx-auto">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 text-center">
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
                        <Reveal>
                            <h2 className="text-3xl sm:text-4xl font-serif mb-6 leading-tight">The Standard of <br /> <span className="text-luxury-gold">Authenticity</span></h2>
                        </Reveal>
                        <p className="text-gray-600 mb-6 font-light leading-relaxed">
                            At The Collectors Exchange, trust is our currency. Our rigorous verification process ensures that every item you purchase is genuine.
                        </p>
                    </div>
                </div>
            </section>

            {/* Institutional Registry Section */}
            <section className="py-16 sm:py-24 lg:py-32 px-6 bg-gray-100 relative">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-12 sm:mb-20 gap-6 sm:gap-8">
                        <div>
                            <Reveal>
                                <span className="text-luxury-gold text-xs font-bold tracking-[0.4em] uppercase mb-4 block">Institutional Framework</span>
                                <h2 className="text-3xl sm:text-4xl font-serif leading-tight text-heritage-charcoal">A New Standard of <span className="italic text-luxury-gold">Archival Integrity</span></h2>
                            </Reveal>
                        </div>
                        <Link to="/vision" className="group flex items-center gap-4 text-heritage-charcoal/50 hover:text-luxury-gold transition-colors text-xs font-bold tracking-widest uppercase">
                            Our Full Vision <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                        <div className="p-8 sm:p-12 lg:p-16 bg-gray-200/80 shadow-md flex flex-col items-center text-center hover:shadow-lg transition-shadow group">
                            <Archive className="text-luxury-gold w-10 h-10 sm:w-12 sm:h-12 mb-6 sm:mb-8 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                            <h3 className="text-lg sm:text-xl font-serif uppercase tracking-widest mb-4 sm:mb-6 font-bold text-heritage-charcoal">The Archive</h3>
                            <p className="text-sm text-heritage-charcoal/80 leading-relaxed font-medium">
                                Hand-picked artifacts sourced directly from the streets and private vaults. We don't list items; we archive history.
                            </p>
                        </div>
                        <div className="p-8 sm:p-12 lg:p-16 bg-gray-200/80 shadow-md flex flex-col items-center text-center hover:shadow-lg transition-shadow group">
                            <ShieldCheck className="text-luxury-gold w-10 h-10 sm:w-12 sm:h-12 mb-6 sm:mb-8 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                            <h3 className="text-lg sm:text-xl font-serif uppercase tracking-widest mb-4 sm:mb-6 font-bold text-heritage-charcoal">Verification</h3>
                            <p className="text-sm text-heritage-charcoal/80 leading-relaxed font-medium">
                                Our institutional verification process ensures that every piece is original. We restore the trust lost in the pre-owned market.
                            </p>
                        </div>
                        <div className="p-8 sm:p-12 lg:p-16 bg-gray-200/80 shadow-md flex flex-col items-center text-center hover:shadow-lg transition-shadow group">
                            <UserCheck className="text-luxury-gold w-10 h-10 sm:w-12 sm:h-12 mb-6 sm:mb-8 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                            <h3 className="text-lg sm:text-xl font-serif uppercase tracking-widest mb-4 sm:mb-6 font-bold text-heritage-charcoal">Handshake</h3>
                            <p className="text-sm text-heritage-charcoal/80 leading-relaxed font-medium">
                                Sellers are vetted with archival rigor. We ensure every agreement is honored and every transaction is backed by integrity.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Authenticated Heritage Section */}
            <section className="py-16 sm:py-24 lg:py-32 px-6 bg-white overflow-hidden">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col lg:flex-row items-center gap-12 sm:gap-16 lg:gap-24">
                        <div className="lg:w-1/2 space-y-6 sm:space-y-10 relative">
                            <h2 className="text-3xl sm:text-4xl font-serif text-heritage-charcoal leading-[1.1] tracking-tighter uppercase relative z-10">
                                The Truth Of <br />
                                <span className="text-luxury-gold">Heritage</span>
                            </h2>
                            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-heritage-charcoal font-sans font-medium leading-relaxed max-w-xl relative z-10">
                                Trust is our only currency. Our verification process is not a check; it is a commitment to the preservation of truth.
                            </p>
                            <ul className="space-y-4 sm:space-y-6 relative z-10">
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
                                <img loading="lazy" width="600" height="600" src={verificationAuthenticity} alt="Heritage Verification" className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-heritage-charcoal/5 to-transparent"></div>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-luxury-gold/10 rounded-full blur-3xl -z-0"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sell with Confidence Section */}
            <section className="py-16 sm:py-24 lg:py-32 px-6 bg-heritage-charcoal text-white text-center border-t border-white/5">
                <div className="container mx-auto max-w-6xl">
                    <Reveal>
                        <span className="text-luxury-gold text-xs font-bold tracking-[0.4em] uppercase mb-6 sm:mb-8 block">Global Outreach</span>
                        <h2 className="text-3xl sm:text-4xl font-serif mb-12 sm:mb-20 leading-tight">Sell with Confidence</h2>
                    </Reveal>

                    <div className="bg-[#0A0D12] border border-white/5 p-6 sm:p-12 lg:p-24 grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 text-left max-w-5xl mx-auto shadow-heritage relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                        <div className="space-y-6 sm:space-y-10 relative z-10">
                            <h3 className="text-xl sm:text-2xl font-serif text-luxury-gold flex items-center gap-4">
                                <div className="w-8 h-px bg-luxury-gold/50"></div>
                                Individual Sellers
                            </h3>
                            <ul className="space-y-4 sm:space-y-6">
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
                        <div className="space-y-6 sm:space-y-10 relative z-10">
                            <h3 className="text-xl sm:text-2xl font-serif text-luxury-gold flex items-center gap-4">
                                <div className="w-8 h-px bg-luxury-gold/50"></div>
                                Company Sellers
                            </h3>
                            <ul className="space-y-4 sm:space-y-6">
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

                    <div className="mt-12 sm:mt-24">
                        <Link to="/account" className="inline-flex items-center gap-4 sm:gap-6 text-white border border-white/20 px-8 sm:px-12 py-4 sm:py-6 hover:bg-white hover:text-black transition-all duration-500 font-sans text-[10px] sm:text-xs tracking-[0.4em] uppercase font-black group">
                            Start Selling <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform duration-500" />
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
                <Reveal>
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-px w-8 bg-luxury-gold/40"></div>
                        <span className="text-luxury-gold tracking-[0.3em] text-xs font-bold uppercase">Testimonials</span>
                        <div className="h-px w-8 bg-luxury-gold/40"></div>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-serif text-heritage-charcoal mb-10">What Our <span className="text-luxury-gold italic font-light">Collectors</span> Say</h2>
                </Reveal>
                <div className="bg-white p-8 sm:p-12 shadow-sm border border-gray-100 relative">
                    <Quote className="text-luxury-gold/20 absolute top-4 left-4 w-12 h-12 sm:w-16 sm:h-16" />
                    <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-sans italic mb-6 relative z-10">{"\u201C"}{t.content}{"\u201D"}</p>
                    {t.images?.length > 0 && (
                        <div className="flex justify-center gap-3 mb-4 overflow-x-auto">
                            {t.images.map((img, i) => (
                                <img key={i} loading="lazy" width="96" height="96" src={img} alt={`${t.authorName}'s collectible`} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded border border-gray-200 flex-shrink-0" />
                            ))}
                        </div>
                    )}
                    <div className="flex items-center justify-center gap-1 mb-3">
                        {[1,2,3,4,5].map(i => (
                            <span key={i} className={`text-lg ${i <= t.rating ? 'text-amber-400' : 'text-gray-200'}`} aria-label={`${i <= t.rating ? 'Filled star' : 'Empty star'}`}>&#9733;</span>
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
