import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Watch, Gem, Landmark, Footprints, Gamepad2, Archive, ShieldCheck, Award, Heart, ShoppingBag, Loader2 } from 'lucide-react';
import { useProducts } from '../hooks/api/useProducts';
import { addToCart, isInCart, getUser } from '../utils/storage';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '../hooks/api/useWishlist';
import Bullet from '../components/Bullet';
import exchangeHeroBg from '../assets/The_Exchange_Modern.png';

const CATEGORIES = [
    {
        id: 'timepieces',
        name: 'Timepieces',
        icon: Watch,
        description: 'Luxury watches & vintage horology',
    },
    {
        id: 'collectables',
        name: 'Collectibles',
        icon: Gem,
        description: 'Rare artifacts & memorabilia',
    },
    {
        id: 'antiques',
        name: 'Antiques',
        icon: Landmark,
        description: 'Historical treasures & heirlooms',
    },
    {
        id: 'sneakers',
        name: 'Sneakers',
        icon: Footprints,
        description: 'Limited drops & rare editions',
    },
    {
        id: 'toys',
        name: 'Toys & Pop Culture',
        icon: Gamepad2,
        description: 'Vintage toys & collectible figures',
    },
    {
        id: 'limited-editions',
        name: 'Limited Editions',
        icon: Archive,
        description: 'Exclusive archives & rarities',
    },
];

// Featured Product Card Component (Larger, Museum-style)
const FeaturedProductCard = ({ product }) => {
    const user = getUser();
    const { data: wishlistItems = [] } = useWishlist(user?.id);
    const addToWishlistMutation = useAddToWishlist();
    const removeFromWishlistMutation = useRemoveFromWishlist();

    const inWishlist = wishlistItems.some(item => item.product.id === product.id || item.productId === product.id);

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert("Please sign in to add to wishlist");
            return;
        }

        if (inWishlist) {
            removeFromWishlistMutation.mutate({ userId: user.id, productId: product.id });
        } else {
            addToWishlistMutation.mutate({ userId: user.id, productId: product.id });
        }
    };

    const title = product.title || product.name;

    return (
        <div className="bg-heritage-cream border border-heritage-beige group hover:shadow-heritage-hover transition-all duration-500 flex flex-col h-full">
            <Link to={`/THE-COLLECTORS-EXCHANGE/product/${product.id}`} className="block relative aspect-[4/5] bg-heritage-beige overflow-hidden shrink-0">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-heritage-bronze/40 bg-heritage-beige">
                        <Gem size={48} strokeWidth={1} />
                    </div>
                )}

                {/* Wishlist Button - Prevent propagation */}
                <button
                    onClick={handleWishlistToggle}
                    className={`absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm transition-all duration-300 z-10 ${inWishlist ? 'text-heritage-bronze' : 'text-heritage-charcoal/40 hover:text-heritage-bronze'}`}
                >
                    <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
                </button>

                {/* Rarity Badge */}
                <div className="absolute bottom-4 left-4 bg-heritage-charcoal/90 backdrop-blur-sm text-white text-xs px-4 py-2 font-sans tracking-[0.15em] uppercase flex items-center gap-2">
                    <Award size={14} strokeWidth={1.5} />
                    <span>Most Rare</span>
                </div>
            </Link>

            <div className="p-6 bg-white flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-heritage-bronze uppercase tracking-[0.15em] font-medium">{product.category}</span>
                    {product.isVerified && (
                        <span className="flex items-center gap-1 text-xs text-heritage-charcoal/60">
                            <ShieldCheck size={12} /> Verified
                        </span>
                    )}
                </div>
                <Link to={`/THE-COLLECTORS-EXCHANGE/product/${product.id}`} className="block hover:text-heritage-bronze transition-colors">
                    <h3 className="font-serif text-xl font-medium text-heritage-charcoal mb-2 leading-tight">{title}</h3>
                </Link>
                <p className="text-heritage-bronze/70 text-sm font-light line-clamp-2 mb-4">{product.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-heritage-beige mt-auto">
                    <span className="text-heritage-gold-muted font-serif text-lg">${product.price?.toLocaleString()}</span>
                    <span className="text-xs text-heritage-charcoal/50 uppercase tracking-wider">
                        {product.condition || 'Excellent'}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Standard Product Card Component (Archive-style)
const ArchiveProductCard = ({ product }) => {
    const user = getUser();
    const { data: wishlistItems = [] } = useWishlist(user?.id);
    const addToWishlistMutation = useAddToWishlist();
    const removeFromWishlistMutation = useRemoveFromWishlist();
    const [inCart, setInCart] = useState(false); // Can be refactored to useCart similar to Wishlist, but keeping local for now or using props if performance hit. actually usage of storage is fine for cart for now as per plan focus on wishlist

    // Derived state for wishlist
    const inWishlist = wishlistItems.some(item => item.product.id === product.id || item.productId === product.id);

    useEffect(() => {
        setInCart(isInCart(product.id)); // Keeping local storage cart check for now as refactor is scoped to wishlist
    }, [product.id]);


    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert("Please sign in to add to wishlist");
            return;
        }

        if (inWishlist) {
            removeFromWishlistMutation.mutate({ userId: user.id, productId: product.id });
        } else {
            addToWishlistMutation.mutate({ userId: user.id, productId: product.id });
        }
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!inCart) {
            addToCart(product.id);
            setInCart(true);
        }
    };

    const title = product.title || product.name;
    const CategoryIcon = CATEGORIES.find(c => c.name.toLowerCase() === product.category?.toLowerCase())?.icon || Gem;

    return (
        <div className="bg-white border border-gray-100 group hover:shadow-heritage transition-all duration-500 flex flex-col h-full">
            <Link to={`/THE-COLLECTORS-EXCHANGE/product/${product.id}`} className="block relative aspect-square bg-heritage-beige overflow-hidden shrink-0">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-heritage-bronze/30 bg-heritage-cream">
                        <CategoryIcon size={40} strokeWidth={1} />
                    </div>
                )}

                {/* Wishlist Button - Prevent propagation */}
                <button
                    onClick={handleWishlistToggle}
                    className={`absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm transition-all duration-300 opacity-0 group-hover:opacity-100 z-10 ${inWishlist ? 'text-heritage-bronze opacity-100' : 'text-heritage-charcoal/40 hover:text-heritage-bronze'}`}
                >
                    <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
                </button>

                {/* Condition Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-heritage-charcoal/70 text-[10px] px-2.5 py-1 font-sans tracking-[0.1em] uppercase">
                    {product.condition || 'Excellent'}
                </div>

                {/* Verified Badge */}
                {product.isVerified && (
                    <div className="absolute bottom-3 left-3 bg-heritage-charcoal/90 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 font-sans tracking-[0.1em] uppercase flex items-center gap-1">
                        <ShieldCheck size={10} />
                        <span>Verified</span>
                    </div>
                )}
            </Link>

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-2">
                    <CategoryIcon size={12} className="text-heritage-bronze/60" strokeWidth={1.5} />
                    <span className="text-[11px] text-heritage-bronze/80 uppercase tracking-[0.12em]">{product.category}</span>
                </div>
                <Link to={`/THE-COLLECTORS-EXCHANGE/product/${product.id}`} className="block hover:text-heritage-bronze transition-colors">
                    <h3 className="font-serif text-base font-medium text-heritage-charcoal mb-1 leading-snug line-clamp-2">{title}</h3>
                </Link>
                <p className="text-heritage-gold-muted font-sans text-sm font-medium mb-4">${product.price?.toLocaleString()}</p>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={inCart}
                    className={`w-full py-2.5 text-xs uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-2 mt-auto ${inCart
                        ? 'bg-heritage-beige text-heritage-charcoal/50 cursor-default'
                        : 'bg-heritage-charcoal text-white hover:bg-heritage-brown'
                        }`}
                >
                    <ShoppingBag size={14} />
                    {inCart ? 'In Cart' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

const Category = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const { data: allProducts = [], isLoading } = useProducts(selectedCategory);

    // Get top 3 most expensive as "Most Rare" featured products
    const featuredProducts = [...allProducts]
        .sort((a, b) => (b.price || 0) - (a.price || 0))
        .slice(0, 3);

    const loadProducts = () => {
        // This is now handled by TanStack Query invalidation if needed
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
            {/* Hero Section - The Collected Archive (Modern Dark Aesthetic) */}
            <section className="relative h-[65vh] min-h-[500px] flex items-center justify-center overflow-hidden border-b border-heritage-beige bg-heritage-charcoal">
                {/* Visual Archive Background Layer */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={exchangeHeroBg}
                        alt="The Exchange Archive"
                        className="w-full h-full object-cover object-center transition-transform duration-1000"
                    />
                    {/* Editorial Overlays for Readability - Dark for modern aesthetic */}
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
                </div>

                {/* Narrative Content Layer */}
                <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center">
                    <div className="max-w-3xl">
                        <div className="flex items-center justify-center gap-6 mb-6">
                            <div className="h-px w-12 bg-[#D4AF37]/50"></div>
                            <h5 className="text-[#D4AF37] tracking-[0.5em] font-sans text-[11px] font-bold uppercase">
                                Archive Vision
                            </h5>
                            <div className="h-px w-12 bg-[#D4AF37]/50"></div>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif text-white font-normal mb-6 leading-tight tracking-tighter drop-shadow-2xl">
                            The <span className="italic text-[#D4AF37] font-light font-serif">Exchange</span>
                        </h1>

                        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/80 to-transparent mx-auto mb-8"></div>

                        <div className="relative mb-10">
                            <p className="text-[#E5E1DA] font-serif italic text-xl md:text-2xl lg:text-3xl leading-relaxed max-w-2xl mx-auto drop-shadow-md">
                                "Explore our curated archive of verified pre-owned treasures and rare collectibles."
                            </p>
                        </div>

                        {/* Heritage Values */}
                        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-[10px] uppercase tracking-[0.35em] text-white/80 font-sans font-black">
                            <span className="flex items-center gap-3"><Bullet className="text-[#D4AF37] w-2.5 h-2.5" />Provenance</span>
                            <span className="flex items-center gap-3"><Bullet className="text-[#D4AF37] w-2.5 h-2.5" />Authenticity</span>
                            <span className="flex items-center gap-3"><Bullet className="text-[#D4AF37] w-2.5 h-2.5" />Continuity</span>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-50">
                        <span className="text-[9px] uppercase tracking-[0.8em] text-[#D4AF37] font-bold mb-1">Scroll</span>
                        <div className="w-px h-20 bg-gradient-to-b from-[#D4AF37] to-transparent"></div>
                    </div>
                </div>
            </section>

            {/* Category Icons Navigation - Polished with shadow and border */}
            <section className="py-8 md:py-10 px-6 bg-white border-b border-heritage-beige shadow-sm z-20 relative">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-8">
                        {CATEGORIES.map((category) => {
                            const IconComponent = category.icon;
                            const isSelected = selectedCategory === category.name;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category.name)}
                                    className="group flex flex-col items-center text-center"
                                >
                                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300 mb-3 ${isSelected
                                        ? 'border-heritage-gold-muted bg-heritage-cream shadow-heritage-hover'
                                        : 'border-heritage-beige bg-heritage-cream/50 hover:border-heritage-bronze hover:shadow-heritage group-hover:bg-heritage-cream'
                                        }`}>
                                        <IconComponent
                                            size={28}
                                            strokeWidth={1.2}
                                            className={`transition-colors duration-300 ${isSelected
                                                ? 'text-heritage-gold-muted'
                                                : 'text-heritage-bronze/60 group-hover:text-heritage-bronze'
                                                }`}
                                        />
                                    </div>
                                    <span className={`text-xs tracking-[0.1em] uppercase font-sans transition-colors duration-300 ${isSelected
                                        ? 'text-heritage-charcoal font-medium'
                                        : 'text-heritage-charcoal/60 group-hover:text-heritage-charcoal'
                                        }`}>
                                        {category.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section >

            {/* "Most Rare" Featured Section */}
            {
                featuredProducts.length > 0 && (
                    <section className="py-16 md:py-20 px-6 bg-heritage-cream">
                        <div className="container mx-auto max-w-6xl">
                            <div className="text-center mb-12">
                                <div className="flex items-center justify-center gap-4 mb-4">
                                    <div className="h-px w-12 bg-heritage-bronze/30"></div>
                                    <Award size={20} strokeWidth={1} className="text-heritage-gold-muted" />
                                    <div className="h-px w-12 bg-heritage-bronze/30"></div>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-serif text-heritage-charcoal font-normal tracking-wide mb-2">
                                    Most Rare
                                </h2>
                                <p className="text-heritage-bronze/70 font-sans font-light text-sm">
                                    An exclusive, museum-style presentation
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {featuredProducts.map((product) => (
                                    <FeaturedProductCard key={product.id} product={product} onUpdate={loadProducts} />
                                ))}
                            </div>
                        </div>
                    </section>
                )
            }

            {/* All Products Grid */}
            <section ref={productsRef} className="py-16 md:py-20 px-6 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-serif text-heritage-charcoal font-normal tracking-wide">
                                {selectedCategory || 'All Listings'}
                            </h2>
                            <p className="text-heritage-bronze/60 text-sm font-sans mt-1">
                                {allProducts.length} {allProducts.length === 1 ? 'item' : 'items'} in archive
                            </p>
                        </div>

                        {selectedCategory && (
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="text-xs text-heritage-charcoal/60 uppercase tracking-[0.15em] hover:text-heritage-charcoal transition-colors border-b border-heritage-charcoal/30 pb-0.5"
                            >
                                View All
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader2 className="animate-spin text-luxury-gold mb-4" size={48} />
                            <p className="text-gray-500 font-serif text-lg italic">Accessing The Archive...</p>
                        </div>
                    ) : allProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                            {allProducts.map((product) => (
                                <ArchiveProductCard key={product.id} product={product} onUpdate={loadProducts} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-heritage-cream border border-heritage-beige">
                            <Gem size={48} strokeWidth={1} className="mx-auto text-heritage-bronze/30 mb-4" />
                            <p className="text-heritage-charcoal/60 font-serif text-lg">No items found in this collection.</p>
                            <p className="text-heritage-bronze/50 font-sans text-sm mt-2">Check back soon for new additions.</p>
                        </div>
                    )}
                </div>
            </section>
        </div >
    );
};

export default Category;
