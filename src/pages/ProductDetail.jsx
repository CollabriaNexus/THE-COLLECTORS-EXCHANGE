import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEO, { ProductSchema, BreadcrumbSchema } from '../components/SEO';
import { ShieldCheck, Heart, ShoppingBag, ChevronRight, Share2, Info, Loader2, Check, ArrowRight, Gem, Award, ImageOff, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useProduct, useProducts } from '../hooks/api/useProducts';
import { useAddToCart, useCart } from '../hooks/api/useCart';
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from '../hooks/api/useWishlist';
import { getUser } from '../utils/storage';
import apiClient from '../hooks/api/apiClient';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';

const ProductDetail = () => {
    const { id } = useParams();
    const { data: product, isLoading } = useProduct(id);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [cartFeedback, setCartFeedback] = useState(false);

    const currentUser = getUser();
    const showToast = useToast();
    const confirm = useConfirm();
    const { data: cartItems = [] } = useCart(currentUser?.id);
    const { data: wishlistItems = [] } = useWishlist(currentUser?.id);
    const addToCartMutation = useAddToCart();
    const addToWishlistMutation = useAddToWishlist();
    const removeFromWishlistMutation = useRemoveFromWishlist();

    const inCart = cartItems.some(item => item.productId === product?.id);
    const inWishlist = wishlistItems.some(item => item.productId === product?.id);

    const cartFeedbackTimer = useRef(null);

    const handleAddToCart = async () => {
        if (!product || !currentUser) return;
        try {
            await addToCartMutation.mutateAsync({ userId: currentUser.id, productId: product.id });
            apiClient.post('/analytics/cart', { productId: product.id, action: 'ADD' }).catch(() => {});
            setCartFeedback(true);
            clearTimeout(cartFeedbackTimer.current);
            cartFeedbackTimer.current = setTimeout(() => setCartFeedback(false), 2000);
        } catch (err) {
            if (err?.response?.status === 401) {
                showToast('Please sign in to add items to cart', 'error');
            } else {
                showToast(err?.response?.data?.message || 'Failed to add to cart', 'error');
            }
        }
    };

    useEffect(() => {
        return () => clearTimeout(cartFeedbackTimer.current);
    }, []);

    const handleWishlistToggle = async () => {
        if (!product || !currentUser) return;
        if (inWishlist && !(await confirm('Remove this item from your wishlist?'))) return;
        try {
            if (inWishlist) {
                await removeFromWishlistMutation.mutateAsync({ userId: currentUser.id, productId: product.id });
            } else {
                await addToWishlistMutation.mutateAsync({ userId: currentUser.id, productId: product.id });
            }
        } catch (err) {
            showToast(err?.response?.data?.message || 'Failed to update wishlist', 'error');
        }
    };

    // Track product view
    const tracked = useRef(false);
    useEffect(() => {
        tracked.current = false;
        if (product && !tracked.current) {
            tracked.current = true;
            apiClient.post('/analytics/view', {
                productId: product.id,
                sessionId: localStorage.getItem('session_id') || `anon_${Date.now()}`,
            }).catch(() => {});
        }
    }, [product?.id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <Helmet><title>Product — The Collectors Exchange</title></Helmet>
                <Loader2 className="animate-spin text-luxury-gold mb-4" size={48} />
                <p className="text-gray-500 font-serif text-xl italic">Retrieving Item Records...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Helmet><title>Product — The Collectors Exchange</title></Helmet>
                <div className="text-center">
                    <h2 className="text-2xl font-serif text-gray-400">Item Not Found</h2>
                    <Link to="/category" className="text-luxury-gold hover:underline mt-4 inline-block">
                        Return to The Exchange
                    </Link>
                </div>
            </div>
        );
    }

    const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
    const keywords = product.keywords || [];

    const breadcrumbItems = [
        { name: 'Home', url: '/' },
        { name: 'The Exchange', url: '/category' },
        { name: product.category },
        { name: product.title },
    ];

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title={product.title}
                description={(product.description?.replace(/<[^>]*>/g, '')?.substring(0, 160)) || `Authentic ${product.category} collectible at ₹${product.price?.toLocaleString()}. Verified by The Collectors Exchange.`}
                canonical={`/product/${product.id}`}
                image={product.images?.[0] || product.image}
                ogType="product"
            />
            <ProductSchema product={product} />
            <BreadcrumbSchema items={breadcrumbItems} />
            {/* Breadcrumbs */}
            <div className="border-b border-gray-100 bg-gray-50/50">
                <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center text-xs text-gray-500 uppercase tracking-widest gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
                        <Link to="/" className="hover:text-luxury-gold shrink-0">Home</Link>
                        <ChevronRight size={10} className="sm:w-3 sm:h-3 shrink-0" />
                        <Link to="/category" className="hover:text-luxury-gold shrink-0">The Exchange</Link>
                        <ChevronRight size={10} className="sm:w-3 sm:h-3 shrink-0" />
                        <span className="text-gray-800 font-medium truncate">{product.category}</span>
                    </div>
                </div>
            </div>

            {/* Top Row */}
            <div className="container mx-auto px-4 sm:px-6 pt-4 sm:pt-12 md:pt-20">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-12 lg:gap-16">
                    {/* Left: Main Image + Thumbnails */}
                    <div className="w-full lg:w-3/5 flex gap-2 sm:gap-4 order-1">
                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex flex-col gap-1 sm:gap-3 w-12 sm:w-16 md:w-20 shrink-0">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`aspect-square border-2 transition-all ${activeImageIndex === idx ? 'border-luxury-gold ring-1 ring-luxury-gold/50' : 'border-gray-100 hover:border-gray-300'}`}
                                    >
                                        <img loading="lazy" width="80" height="80" src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                        {/* Main Image */}
                        <div className="relative flex-1 aspect-[4/3] bg-gray-50 overflow-hidden shadow-sm border border-gray-100 group">
                            {images.length > 0 ? (
                                <>
                                    {/* Desktop zoom version */}
                                    <div
                                        className="w-full h-full hidden lg:block"
                                        onMouseMove={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const x = ((e.clientX - rect.left) / rect.width) * 100;
                                            const y = ((e.clientY - rect.top) / rect.height) * 100;
                                            e.currentTarget.querySelector('img').style.transformOrigin = `${x}% ${y}%`;
                                        }}
                                    >
                                        <img
                                            width="800" height="600"
                                            src={images[activeImageIndex]}
                                            alt={product.title}
                                            className="w-full h-full object-contain p-2 sm:p-6 md:p-8 transition-transform duration-300 ease-out lg:group-hover:scale-150"
                                        />
                                    </div>
                                    {/* Mobile fallback */}
                                    <img
                                        width="800" height="600"
                                        src={images[activeImageIndex]}
                                        alt={product.title}
                                        className="w-full h-full object-contain p-2 sm:p-6 md:p-8 block lg:hidden"
                                    />
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <ImageOff size={48} strokeWidth={1} />
                                </div>
                            )}
                            {product.isVerified && (
                                <div className="absolute top-2 sm:top-6 left-2 sm:left-6 bg-white/90 backdrop-blur-sm border border-gray-200 px-2 sm:px-4 py-1 sm:py-2 flex items-center gap-1 sm:gap-2 shadow-sm">
                                    <ShieldCheck size={12} className="sm:w-4 sm:h-4 text-green-700" />
                                    <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-gray-800">Verified Authentic</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="w-full lg:w-2/5 order-2">
                        <div className="mb-4 sm:mb-8">
                            <div className="flex items-center flex-wrap gap-1.5 sm:gap-3 mb-2 sm:mb-4">
                                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-heritage-cream text-heritage-bronze text-[9px] sm:text-xs font-bold uppercase tracking-widest">
                                    {product.category}
                                </span>
                                {product.condition && (
                                    <span className="text-[9px] sm:text-xs text-gray-500 uppercase tracking-widest border border-gray-200 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                                        {product.condition}
                                    </span>
                                )}
                                {product.listingCategory && product.listingCategory !== 'normal' && (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-widest font-semibold ${product.listingCategory === 'most_rare' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {product.listingCategory}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-lg sm:text-3xl md:text-4xl lg:text-5xl font-serif text-heritage-charcoal leading-tight mb-2 sm:mb-6">
                                {product.title}
                            </h1>
                            <p className="text-lg sm:text-3xl font-light text-heritage-charcoal">
                                ₹{product.price?.toLocaleString()}
                            </p>
                            {product.brand && (
                                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 uppercase tracking-wider">{product.brand}</p>
                            )}
                        </div>

                        {/* Seller Info */}
                        {product.seller && (
                            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 border border-gray-100">
                                <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1">Brokered By</p>
                                <p className="font-serif text-sm sm:text-base font-medium text-heritage-charcoal">
                                    {product.seller.role === 'admin' || product.seller.role === 'superadmin' || product.seller.role === 'curator'
                                        ? 'THE COLLECTORS EXCHANGE'
                                        : (product.seller.name || 'The Collectors Exchange')}
                                </p>
                                {product.seller.type === 'company' && (
                                    <span className="text-[9px] sm:text-[10px] text-luxury-gold uppercase tracking-wider">Verified Company</span>
                                )}
                                {product.seller.vendor && product.seller.vendor.ratingCount > 0 && (
                                    <div className="flex items-center gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span key={star} className={`text-xs ${star <= Math.round(product.seller.vendor.rating) ? 'text-amber-400' : 'text-gray-300'}`}>&#9733;</span>
                                        ))}
                                        <span className="text-[10px] text-gray-400 ml-1">({product.seller.vendor.ratingCount})</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 sm:gap-4">
                            {product.status === 'Sold' ? (
                                <div className="flex-1 py-3 sm:py-5 text-[10px] sm:text-sm uppercase tracking-widest font-medium flex items-center justify-center gap-1.5 sm:gap-3 bg-gray-100 text-gray-400 cursor-default">
                                    <XCircle size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    Sold Out
                                </div>
                            ) : !currentUser ? (
                                <Link
                                    to="/account"
                                    className="flex-1 py-3 sm:py-5 text-[10px] sm:text-sm uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-3 bg-heritage-charcoal text-white hover:bg-luxury-gold shadow-lg"
                                >
                                    <ShoppingBag size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    Sign In to Acquire
                                </Link>
                            ) : inCart ? (
                                <Link
                                    to="/cart"
                                    className="flex-1 py-3 sm:py-5 text-[10px] sm:text-sm uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-3 bg-gray-100 text-gray-400 hover:bg-luxury-gold hover:text-white shadow-lg"
                                >
                                    <Check size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    View in Cart
                                </Link>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addToCartMutation.isPending}
                                    className={`flex-1 py-3 sm:py-5 text-[10px] sm:text-sm uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-3 ${cartFeedback
                                        ? 'bg-green-50 text-green-700 cursor-default'
                                        : 'bg-heritage-charcoal text-white hover:bg-luxury-gold shadow-lg'
                                        }`}
                                >
                                    {addToCartMutation.isPending ? (
                                        <Loader2 size={14} className="animate-spin sm:w-[18px] sm:h-[18px]" />
                                    ) : cartFeedback ? (
                                        <Check size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    ) : (
                                        <ShoppingBag size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    )}
                                    {cartFeedback ? 'Added!' : 'Acquire Now'}
                                </button>
                            )}
                            <button
                                onClick={handleWishlistToggle}
                                disabled={!currentUser || addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
                                className={`px-3 sm:px-6 border transition-colors ${inWishlist
                                    ? 'border-red-200 bg-red-50 text-red-600'
                                    : 'border-gray-200 hover:border-heritage-charcoal text-gray-500 hover:text-heritage-charcoal'
                                    } disabled:opacity-40`}
                            >
                                <Heart size={16} className="sm:w-5 sm:h-5" fill={inWishlist ? 'currentColor' : 'none'} />
                            </button>
                        </div>

                        {/* Trust Indicators */}
                        <div className="grid grid-cols-1 gap-2 sm:gap-3 mt-4 sm:mt-6">
                            <div className="flex gap-2 sm:gap-3 items-start" title="Every item is verified by our expert team before shipping.">
                                <ShieldCheck size={16} className="sm:w-5 sm:h-5 text-luxury-gold flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-serif text-xs sm:text-sm font-medium text-black">Authenticity Guarantee</h4>
                                    <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed">Every item is verified by our expert team before shipping.</p>
                                </div>
                            </div>
                            <div className="flex gap-2 sm:gap-3 items-start" title="Insured shipping and secure ownership transfer.">
                                <Share2 size={16} className="sm:w-5 sm:h-5 text-luxury-gold flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-serif text-xs sm:text-sm font-medium text-black">Secure Transfer</h4>
                                    <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed">Insured shipping and secure ownership transfer.</p>
                                </div>
                            </div>
                            <div className="flex gap-2 sm:gap-3 items-start" title="Detailed condition assessment available on request.">
                                <Info size={16} className="sm:w-5 sm:h-5 text-luxury-gold flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-serif text-xs sm:text-sm font-medium text-black">Condition Report</h4>
                                    <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed">Detailed condition assessment available on request.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Below: Full-width content */}
            <div className="container mx-auto px-4 sm:px-6 pb-12 md:pb-20">
                <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 mt-8 sm:mt-16 pt-8 sm:pt-16 border-t border-gray-100">
                    {/* Provenance & Story */}
                    <div>
                        <h3 className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 sm:mb-6">Provenance & Story</h3>
                        <div className="font-serif text-gray-700 text-sm sm:text-lg leading-relaxed">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    p: ({ children }) => <p className="mb-4 sm:mb-6 last:mb-0">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc pl-5 sm:pl-6 mb-4 sm:mb-6 space-y-1 sm:space-y-2">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal pl-5 sm:pl-6 mb-4 sm:mb-6 space-y-1 sm:space-y-2">{children}</ol>,
                                    h1: ({ children }) => <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 mt-6 sm:mt-8">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 mt-4 sm:mt-6">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-base sm:text-lg font-bold mb-2 mt-3 sm:mt-4">{children}</h3>,
                                    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                    em: ({ children }) => <em className="italic">{children}</em>,
                                    a: ({ children, href }) => <a href={href} className="text-luxury-gold underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                                    blockquote: ({ children }) => <blockquote className="border-l-4 border-luxury-gold/30 pl-3 sm:pl-4 italic text-heritage-brown/70 my-4 sm:my-6">{children}</blockquote>,
                                    code: ({ children, className }) => {
                                        const isInline = !className;
                                        return isInline
                                            ? <code className="bg-gray-50 px-1.5 py-0.5 text-[11px] sm:text-sm rounded">{children}</code>
                                            : <pre className="bg-gray-50 p-3 sm:p-4 rounded overflow-x-auto mb-4 sm:mb-6"><code className="bg-transparent p-0 text-[11px] sm:text-sm">{children}</code></pre>;
                                    },
                                    hr: () => <hr className="border-gray-200 my-4 sm:my-6" />,
                                }}
                            >
                                {product.description}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    {product.isVerified && (
                        <div className="bg-heritage-cream border border-luxury-gold/20 p-3 sm:p-6">
                            <div className="flex items-start gap-2 sm:gap-4">
                                <ShieldCheck size={20} className="sm:w-8 sm:h-8 text-green-700 flex-shrink-0" />
                                <div>
                                    <h4 className="font-serif text-sm sm:text-lg font-medium text-heritage-charcoal mb-0.5 sm:mb-1">The Exchange's Guarantee</h4>
                                    <p className="text-[11px] sm:text-sm text-heritage-charcoal/70 leading-relaxed">
                                        This item is marked <strong>Verified Authentic</strong> by The Collectors Exchange. When you purchase this item, you receive our unconditional guarantee of authenticity — backed by our expert curation team.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Suggested Products */}
            <SuggestedProducts category={product.category} currentId={product.id} />
        </div>
    );
};

const SuggestedProducts = ({ category, currentId }) => {
    const { data, isLoading } = useProducts(category, '', 1, 8);
    const products = (data?.products || []).filter(p => p.id !== currentId).slice(0, 4);

    if (products.length === 0 && !isLoading) return null;

    return (
        <section className="py-12 sm:py-20 px-4 sm:px-6 bg-heritage-cream border-t border-gray-100">
            <div className="container mx-auto max-w-6xl">
                <div className="flex items-center justify-between mb-6 sm:mb-10">
                    <div>
                        <h2 className="text-xl sm:text-4xl font-serif text-heritage-charcoal">Suggested <span className="text-luxury-gold italic font-light">Products</span></h2>
                        <p className="text-heritage-bronze/70 font-sans text-xs sm:text-sm mt-1 sm:mt-2">You may also be interested in</p>
                    </div>
                    <Link to="/category" className="flex items-center gap-1 sm:gap-2 text-heritage-charcoal/60 hover:text-luxury-gold text-[10px] sm:text-xs uppercase tracking-widest transition-colors border-b border-transparent hover:border-luxury-gold pb-0.5">
                        View All <ArrowRight size={10} className="sm:w-[14px] sm:h-[14px]" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white border border-heritage-beige animate-pulse">
                                <div className="aspect-square bg-gray-200" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        ))
                    ) : (
                    products.map((product) => {
                        const title = product.title || product.name;
                        return (
                            <Link
                                key={product.id}
                                to={`/product/${product.id}`}
                                className="bg-white border border-heritage-beige group hover:shadow-heritage-hover transition-all duration-500"
                            >
                                <div className="relative aspect-square bg-heritage-beige overflow-hidden">
                                    {product.image ? (
                                        <img loading="lazy" width="400" height="400" src={product.image} alt={title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-heritage-bronze/30 bg-heritage-cream">
                                            <Gem size={32} strokeWidth={1} />
                                        </div>
                                    )}
                                    {product.status === 'Sold' && (
                                        <div className="absolute inset-0 bg-heritage-charcoal/40 backdrop-blur-[1px] flex items-center justify-center">
                                            <span className="bg-white/90 text-heritage-charcoal text-[10px] font-bold px-4 py-1.5 uppercase tracking-[0.15em] shadow-lg">Sold Out</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-3 left-3 bg-heritage-charcoal/90 backdrop-blur-sm text-white text-[10px] px-3 py-1.5 font-sans tracking-[0.12em] uppercase flex items-center gap-1.5">
                                        <Award size={12} strokeWidth={1.5} />
                                        <span>{product.condition || 'Excellent'}</span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-serif text-sm font-medium text-heritage-charcoal leading-snug line-clamp-1" title={title}>{title}</h3>
                                    <p className={`font-sans text-sm font-medium mt-1.5 ${product.status === 'Sold' ? 'text-gray-400 line-through' : 'text-heritage-gold-muted'}`}>₹{product.price?.toLocaleString()}</p>
                                </div>
                            </Link>
                        );
                    }))}
                </div>
            </div>
        </section>
    );
};

export default ProductDetail;
