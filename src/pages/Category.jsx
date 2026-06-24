import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { Watch, Gem, Landmark, Gamepad2, ShieldCheck, Award, Heart, ShoppingBag, Loader2, Sparkles, Box, XCircle, Check } from 'lucide-react';
import { useProducts } from '../hooks/api/useProducts';
import { getUser } from '../utils/storage';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '../hooks/api/useWishlist';
import { useCart, useAddToCart } from '../hooks/api/useCart';
import apiClient from '../hooks/api/apiClient';
import { useToast } from '../components/Toast';
import Bullet from '../components/Bullet';
import exchangeHeroBg from '../assets/The_Exchange_Modern.png';

const CATEGORIES = [
    {
        id: 'timepieces',
        name: 'Timepieces',
        icon: Watch,
        tagline: 'The Mechanical Heartbeat',
        description: 'Your phone tells the time. A mechanical watch tells a story. In a world of flickering screens and disposable tech, we choose the "Mechanical Truth." We don\'t sell battery-powered fashion; we rescue 17-jewel heartbeats that never need a plug or an algorithm to live.',
    },
    {
        id: 'accessories',
        name: 'Accessories',
        icon: Sparkles,
        tagline: 'The Perfect Finish',
        description: 'An outfit is a statement. The right accessory makes it iconic. In a world of fast fashion and disposable trends, we choose the "Enduring Truth." We rescue the definitive finishing pieces — the cufflinks, the bags, the belts, and the heirlooms that transform the ordinary into the extraordinary.',
    },
    {
        id: 'collectables',
        name: 'Collectibles',
        icon: Box,
        tagline: 'The Curated Pulse',
        description: 'A trend lasts a season. A collectible lasts a lifetime. In a world of digital clutter and "fast-consumption," we choose the "Physical Truth." We don\'t deal in landfill-ready trinkets; we rescue the rare, the nostalgic, and the culturally significant.',
    },
    {
        id: 'antiques',
        name: 'Antiques',
        icon: Landmark,
        tagline: 'The Ancestral Anchor',
        description: 'A replica fills a space. An antique commands it. In a world of flat-pack furniture and mass-produced "vintage-look" decor, we choose the "Ancestral Truth." We rescue the weathered survivors of our history, solid objects that carry the craftsman\'s soul and the weight of the generations before us.',
    },
    {
        id: 'toys',
        name: 'Toys & Pop Culture',
        icon: Gamepad2,
        tagline: 'The Nostalgic Truth',
        description: 'A plaything is for a moment. A pop icon is for the ages. In a world of disposable plastic and "over-hyped" trends, we choose the "Cultural Truth." We rescue the definitive pieces — the action figures, the limited figurines, and the media artifacts that shaped our childhoods.',
    },
    {
        id: 'jewelry',
        name: 'Jewelry',
        icon: Gem,
        tagline: 'The TCE Original',
        description: 'A brand sells you a status. A TCE Original gives you a legacy. In a world of hollow "luxury" and gold-plated illusions, we choose the "Absolute Truth." After years of studying the ancestors and master artisans, we have moved from protecting history to creating it.',
    },
];


// Standard Product Card Component (Archive-style)
const ArchiveProductCard = ({ product }) => {
    const user = getUser();
    const navigate = useNavigate();
    const showToast = useToast();
    const { data: wishlistItems = [] } = useWishlist(user?.id);
    const addToWishlistMutation = useAddToWishlist();
    const removeFromWishlistMutation = useRemoveFromWishlist();
    const { data: cartItems = [] } = useCart(user?.id);
    const addToCartMutation = useAddToCart();
    const [cartFeedback, setCartFeedback] = useState(false);
    const [wishPulse, setWishPulse] = useState(false);
    const cartFeedbackTimer = useRef(null);

    const inCart = cartItems.some(item => item.productId === product.id);
    const inWishlist = wishlistItems.some(item => (item.product?.id === product.id) || item.productId === product.id);

    useEffect(() => {
        return () => clearTimeout(cartFeedbackTimer.current);
    }, []);

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            showToast("Please sign in to add to wishlist", 'error');
            return;
        }

        setWishPulse(true);
        setTimeout(() => setWishPulse(false), 200);

        if (inWishlist) {
            removeFromWishlistMutation.mutate({ userId: user.id, productId: product.id });
        } else {
            addToWishlistMutation.mutate({ userId: user.id, productId: product.id });
        }
    };

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
            apiClient.post('/analytics/cart', { productId: product.id, action: 'ADD' }).catch(() => {});
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

    const title = product.title || product.name;
    const CategoryIcon = CATEGORIES.find(c => c.name.toLowerCase() === product.category?.toLowerCase())?.icon || Gem;

    return (
        <div className="bg-white border border-gray-100 group hover:shadow-heritage transition-all duration-500 flex flex-col h-full">
            <Link to={`/product/${product.id}`} className="block relative aspect-square bg-heritage-beige overflow-hidden shrink-0">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={title}
                        loading="lazy"
                        width="400" height="400"
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-heritage-bronze/30 bg-heritage-cream">
                        <CategoryIcon size={28} strokeWidth={1} className="sm:w-10 sm:h-10" />
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistToggle}
                    className={`absolute top-1.5 right-1.5 sm:top-3 sm:right-3 p-1 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm transition-all duration-300 z-10 cursor-pointer ${inWishlist ? 'text-heritage-bronze opacity-100' : 'text-heritage-charcoal/40 hover:text-heritage-bronze sm:opacity-0 sm:group-hover:opacity-100'} ${wishPulse ? 'scale-125' : 'scale-100'}`}
                >
                    <Heart size={10} fill={inWishlist ? 'currentColor' : 'none'} className="sm:w-4 sm:h-4" />
                </button>

                {/* Condition Badge */}
                <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-white/90 backdrop-blur-sm text-heritage-charcoal/70 text-[8px] sm:text-[10px] px-1 sm:px-2.5 py-0.5 sm:py-1 font-sans tracking-[0.06em] sm:tracking-[0.1em] uppercase">
                    {product.condition || 'Excellent'}
                </div>

                {/* Sold Badge */}
                {product.status === 'Sold' && (
                    <div className="absolute inset-0 bg-heritage-charcoal/40 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-white/90 text-heritage-charcoal text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1 sm:py-1.5 uppercase tracking-[0.15em] shadow-lg">Sold Out</span>
                    </div>
                )}

                {/* Verified Badge */}
                {product.isVerified && (
                    <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 bg-heritage-charcoal/90 backdrop-blur-sm text-white text-[7px] sm:text-[10px] px-1 sm:px-2.5 py-0.5 sm:py-1 font-sans tracking-[0.06em] sm:tracking-[0.1em] uppercase flex items-center gap-0.5 sm:gap-1">
                        <ShieldCheck size={7} className="sm:w-[10px] sm:h-[10px]" />
                        <span className="inline">Verified</span>
                    </div>
                )}
            </Link>

            <div className="p-2 sm:p-5 flex flex-col flex-grow">
                <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-2">
                    <span className="text-[9px] sm:text-[11px] text-heritage-bronze/80 uppercase tracking-[0.08em] sm:tracking-[0.12em] truncate">{product.category}</span>
                </div>
                <Link to={`/product/${product.id}`} className="block hover:text-heritage-bronze transition-colors">
                    <h3 className="font-serif text-[11px] sm:text-base font-medium text-heritage-charcoal mb-0 sm:mb-1 leading-tight sm:leading-snug line-clamp-1 sm:line-clamp-2">{title}</h3>
                </Link>
                <p className="text-heritage-gold-muted font-sans text-[10px] sm:text-sm font-medium mb-1 sm:mb-4 mt-auto">₹{product.price?.toLocaleString()}</p>

                {/* Add to Cart / Sold Button */}
                {product.status === 'Sold' ? (
                    <div className="w-full py-1 sm:py-2.5 text-[9px] sm:text-xs uppercase tracking-[0.08em] sm:tracking-[0.15em] flex items-center justify-center gap-1 sm:gap-2 bg-gray-100 text-gray-400 cursor-default">
                        <XCircle size={10} className="sm:w-[14px] sm:h-[14px]" />
                        Sold Out
                    </div>
                ) : (
                    <button
                        onClick={inCart ? () => navigate('/cart') : cartFeedback ? undefined : handleAddToCart}
                        disabled={addToCartMutation.isPending || cartFeedback}
                        className={`w-full py-1 sm:py-2.5 text-[9px] sm:text-xs uppercase tracking-[0.08em] sm:tracking-[0.15em] transition-colors duration-300 flex items-center justify-center gap-1 sm:gap-2 active:scale-[0.97] ${cartFeedback || inCart
                            ? 'bg-luxury-gold text-white cursor-pointer hover:bg-luxury-gold/90'
                            : 'bg-heritage-charcoal text-white hover:bg-heritage-brown'
                            }`}
                    >
                        {cartFeedback ? <Check size={10} className="sm:w-[14px] sm:h-[14px]" /> : <ShoppingBag size={10} className="sm:w-[14px] sm:h-[14px]" />}
                        {addToCartMutation.isPending ? 'Adding...' : cartFeedback ? 'Added' : inCart ? 'In Cart →' : 'Add to Cart'}
                    </button>
                )}
            </div>
        </div>
    );
};

const Category = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const { data, isLoading } = useProducts(selectedCategory, searchQuery, page, 20);
    const [allProducts, setAllProducts] = useState([]);

    const products = data?.products || [];
    const total = data?.total || 0;
    const totalPages = data?.totalPages || 1;

    const prevCategory = useRef(selectedCategory);
    const prevSearch = useRef(searchQuery);
    useEffect(() => {
        if (prevCategory.current !== selectedCategory || prevSearch.current !== searchQuery) {
            setPage(1);
            setAllProducts([]);
            prevCategory.current = selectedCategory;
            prevSearch.current = searchQuery;
        }
    }, [selectedCategory, searchQuery]);

    useEffect(() => {
        if (products.length > 0) {
            setAllProducts((prev) => {
                if (page === 1) return products;
                const existingIds = new Set(prev.map((p) => p.id));
                const newItems = products.filter((p) => !existingIds.has(p.id));
                return [...prev, ...newItems];
            });
        }
    }, [products, page]);

    const handleLoadMore = () => {
        if (page < totalPages) setPage((p) => p + 1);
    };



    const productsRef = useRef(null);

    const handleCategoryClick = (categoryName) => {
        const isSelected = selectedCategory === categoryName;
        setSelectedCategory(isSelected ? null : categoryName);

        // Scroll to products section when selecting a category
        if (!isSelected) {
            setTimeout(() => {
                productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    return (
        <div className="min-h-screen bg-heritage-cream">
            <SEO
                title="Archive"
                description="Browse The Collectors Exchange archive of authentic pre-owned collectibles. Shop curated timepieces, antiques, jewelry, and rare finds — all verified for authenticity."
                canonical="/category"
            />
            {/* Hero Section - The Collected Archive (Modern Dark Aesthetic) */}
            <section className="relative h-screen min-h-[500px] flex items-center justify-center overflow-hidden border-b border-heritage-beige bg-heritage-charcoal">
                {/* Visual Archive Background Layer */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={exchangeHeroBg}
                        alt="The Exchange Archive"
                        width="1920" height="1080"
                        fetchpriority="high"
                        className="w-full h-full object-cover object-center transition-transform duration-1000"
                    />
                    {/* Editorial Overlays for Readability - Dark for modern aesthetic */}
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
                </div>

                {/* Narrative Content Layer */}
                <div className="relative z-10 container mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
                    <div className="max-w-3xl">
                        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-4 sm:mb-6">
                            <div className="h-px w-8 sm:w-12 bg-[#D4AF37]/50"></div>
                            <h5 className="text-[#D4AF37] tracking-[0.3em] sm:tracking-[0.5em] font-sans text-[9px] sm:text-[11px] font-bold uppercase">
                                Archive Vision
                            </h5>
                            <div className="h-px w-8 sm:w-12 bg-[#D4AF37]/50"></div>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-serif text-white font-normal mb-4 sm:mb-6 leading-tight tracking-tighter drop-shadow-2xl">
                            The <span className="italic text-[#D4AF37] font-light font-serif">Exchange</span>
                        </h1>

                        <div className="w-16 sm:w-24 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/80 to-transparent mx-auto mb-6 sm:mb-8"></div>

                        <div className="relative mb-6 sm:mb-10">
                            <p className="text-[#E5E1DA] font-serif italic text-base sm:text-xl md:text-2xl lg:text-3xl leading-relaxed max-w-2xl mx-auto drop-shadow-md">
                                "Explore our curated archive of verified pre-owned treasures and rare collectibles."
                            </p>
                        </div>

                        {/* Heritage Values */}
                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-12 text-[8px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.35em] text-white/80 font-sans font-black">
                            <span className="flex items-center gap-2 sm:gap-3"><Bullet className="text-[#D4AF37] w-2 h-2 sm:w-2.5 sm:h-2.5" />Provenance</span>
                            <span className="flex items-center gap-2 sm:gap-3"><Bullet className="text-[#D4AF37] w-2 h-2 sm:w-2.5 sm:h-2.5" />Authenticity</span>
                            <span className="flex items-center gap-2 sm:gap-3"><Bullet className="text-[#D4AF37] w-2 h-2 sm:w-2.5 sm:h-2.5" />Continuity</span>
                        </div>
                    </div>

                </div>
            </section>

            {/* Category Icons Navigation - Polished with shadow and border */}
            <section className="py-8 md:py-10 px-6 bg-white border-b border-heritage-beige shadow-sm z-20 relative">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex justify-start md:justify-center gap-4 md:gap-8 overflow-x-auto md:overflow-visible scrollbar-hide snap-x snap-mandatory md:snap-none -mx-6 md:mx-0 px-6 md:px-0">
                        {CATEGORIES.map((category) => {
                            const IconComponent = category.icon;
                            const isSelected = selectedCategory === category.name;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category.name)}
                                    className="group flex flex-col items-center text-center snap-start shrink-0 w-[72px] md:w-auto"
                                    title={category.tagline}
                                >
                                    <div className={`w-12 h-12 md:w-20 md:h-20 rounded-full border-2 md:border-2 flex items-center justify-center transition-all duration-300 mb-2 md:mb-3 ${isSelected
                                        ? 'border-heritage-gold-muted bg-heritage-cream shadow-heritage-hover'
                                        : 'border-heritage-beige bg-heritage-cream/50 hover:border-heritage-bronze hover:shadow-heritage group-hover:bg-heritage-cream'
                                        }`}>
                                        <IconComponent
                                            size={20}
                                            strokeWidth={1.2}
                                            className={`md:w-7 md:h-7 transition-colors duration-300 ${isSelected
                                                ? 'text-heritage-gold-muted'
                                                : 'text-heritage-bronze/60 group-hover:text-heritage-bronze'
                                                }`}
                                        />
                                    </div>
                                    <span className={`text-[10px] md:text-xs tracking-[0.08em] md:tracking-[0.1em] uppercase font-sans transition-colors duration-300 leading-tight ${isSelected
                                        ? 'text-heritage-charcoal font-medium'
                                        : 'text-heritage-charcoal/60 group-hover:text-heritage-charcoal'
                                        }`}>
                                        {category.name}
                                    </span>
                                    <span className="hidden md:block text-[8px] text-heritage-bronze/50 uppercase tracking-[0.15em] mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {category.tagline}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>


            {/* All Products Grid */}
            <section ref={productsRef} className="py-10 md:py-20 px-4 sm:px-6 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-row md:flex-row justify-between items-center md:items-center mb-4 md:mb-10 gap-2 md:gap-4">
                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                            <h2 className="text-base md:text-3xl font-serif text-heritage-charcoal font-normal tracking-wide truncate">
                                {selectedCategory || 'All Listings'}
                            </h2>
                            <span className="text-heritage-bronze/60 text-[11px] md:text-sm font-sans shrink-0">
                                {total}
                            </span>
                            {selectedCategory && (
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="text-[10px] md:text-xs text-heritage-charcoal/60 uppercase tracking-[0.1em] md:tracking-[0.15em] hover:text-heritage-charcoal transition-colors border-b border-heritage-charcoal/30 pb-0.5 shrink-0"
                                >
                                    All
                                </button>
                            )}
                        </div>

                        <div className="w-[120px] md:w-64 shrink-0">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-2 py-1.5 md:px-4 md:py-2.5 border border-heritage-beige bg-white text-[11px] md:text-sm text-heritage-charcoal placeholder-heritage-bronze/40 focus:outline-none focus:border-heritage-bronze transition-colors"
                            />
                        </div>
                    </div>

                    {isLoading && allProducts.length === 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="bg-white border border-gray-100 flex flex-col animate-pulse">
                                    <div className="aspect-square bg-heritage-beige/60" />
                                    <div className="p-2 sm:p-5 space-y-2 sm:space-y-3">
                                        <div className="h-2 sm:h-2.5 bg-heritage-beige/60 rounded w-1/3" />
                                        <div className="h-3 sm:h-4 bg-heritage-beige/60 rounded w-3/4" />
                                        <div className="h-2 sm:h-3 bg-heritage-beige/60 rounded w-1/4" />
                                        <div className="h-6 sm:h-10 bg-heritage-beige/60 rounded mt-2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : allProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-6">
                                {allProducts.map((product) => (
                                    <ArchiveProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-12">
                                    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full pb-2 scrollbar-hide">
                                        <button
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1 || isLoading}
                                            className="px-4 py-2.5 border border-heritage-charcoal/20 text-heritage-charcoal text-xs uppercase tracking-[0.15em] font-medium hover:bg-heritage-charcoal hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            Prev
                                        </button>
                                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 7) {
                                                pageNum = i + 1;
                                            } else if (page <= 4) {
                                                pageNum = i + 1;
                                            } else if (page >= totalPages - 3) {
                                                pageNum = totalPages - 6 + i;
                                            } else {
                                                pageNum = page - 3 + i;
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                    disabled={isLoading}
                                                    className={`w-10 h-10 text-xs font-medium transition-all duration-300 ${page === pageNum
                                                        ? 'bg-heritage-charcoal text-white'
                                                        : 'border border-heritage-charcoal/20 text-heritage-charcoal/70 hover:bg-heritage-cream'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        {totalPages > 7 && page < totalPages - 3 && (
                                            <>
                                                <span className="text-heritage-charcoal/40 text-xs">...</span>
                                                <button
                                                    onClick={() => setPage(totalPages)}
                                                    disabled={isLoading}
                                                    className="w-10 h-10 text-xs font-medium border border-heritage-charcoal/20 text-heritage-charcoal/70 hover:bg-heritage-cream transition-all duration-300"
                                                >
                                                    {totalPages}
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages || isLoading}
                                            className="px-4 py-2.5 border border-heritage-charcoal/20 text-heritage-charcoal text-xs uppercase tracking-[0.15em] font-medium hover:bg-heritage-charcoal hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16 md:py-24 bg-heritage-cream border border-heritage-beige">
                            <Gem size={32} strokeWidth={1} className="md:w-12 md:h-12 mx-auto text-heritage-bronze/30 mb-3 md:mb-4" />
                            <p className="text-heritage-charcoal/60 font-serif text-sm md:text-lg">No items found in this collection.</p>
                            <p className="text-heritage-bronze/50 font-sans text-xs md:text-sm mt-1 md:mt-2">Check back soon for new additions.</p>
                        </div>
                    )}
                </div>
            </section>
        </div >
    );
};

export default Category;
