import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Heart, ShoppingBag, ChevronRight, Tag, Share2, Info } from 'lucide-react';
import { getProductById, addToCart, isInCart, addToWishlist, removeFromWishlist, isInWishlist } from '../utils/storage';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [inCart, setInCartState] = useState(false);
    const [inWishlist, setInWishlistState] = useState(false);

    useEffect(() => {
        const foundProduct = getProductById(id);
        if (foundProduct) {
            setProduct(foundProduct);
            setInCartState(isInCart(foundProduct.id));
            setInWishlistState(isInWishlist(foundProduct.id));
        }
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product.id);
        setInCartState(true);
    };

    const handleWishlistToggle = () => {
        if (!product) return;
        if (inWishlist) {
            removeFromWishlist(product.id);
            setInWishlistState(false);
        } else {
            addToWishlist(product.id);
            setInWishlistState(true);
        }
    };

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-serif text-gray-400">Item Not Found</h2>
                    <Link to="/THE-COLLECTORS-EXCHANGE/category" className="text-luxury-gold hover:underline mt-4 inline-block">
                        Return to The Exchange
                    </Link>
                </div>
            </div>
        );
    }

    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    const keywords = product.keywords || [];

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumbs */}
            <div className="border-b border-gray-100 bg-gray-50/50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center text-xs text-gray-500 uppercase tracking-widest gap-2">
                        <Link to="/THE-COLLECTORS-EXCHANGE/" className="hover:text-luxury-gold">Home</Link>
                        <ChevronRight size={12} />
                        <Link to="/THE-COLLECTORS-EXCHANGE/category" className="hover:text-luxury-gold">The Exchange</Link>
                        <ChevronRight size={12} />
                        <span className="text-gray-800 font-medium">{product.category}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 md:py-20">
                <div className="flex flex-col lg:flex-row gap-16">

                    {/* Left Column: Gallery */}
                    <div className="w-full lg:w-3/5 space-y-6">
                        {/* Main Image */}
                        <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden shadow-sm border border-gray-100">
                            <img
                                src={images[activeImageIndex]}
                                alt={product.title}
                                className="w-full h-full object-contain mix-blend-multiply p-8"
                            />
                            {product.isVerified && (
                                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm border border-gray-200 px-4 py-2 flex items-center gap-2 shadow-sm">
                                    <ShieldCheck size={16} className="text-green-700" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-800">Verified Authentic</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`aspect-square border-2 transition-all ${activeImageIndex === idx ? 'border-luxury-gold ring-1 ring-luxury-gold/50' : 'border-gray-100 hover:border-gray-300'}`}
                                    >
                                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Trust Indicators */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
                            <div className="flex gap-4 items-start">
                                <ShieldCheck size={24} className="text-luxury-gold flex-shrink-0" />
                                <div>
                                    <h4 className="font-serif text-sm font-medium mb-1">Authenticity Guarantee</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">Every item is verified by our expert team before shipping.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <Share2 size={24} className="text-luxury-gold flex-shrink-0" />
                                <div>
                                    <h4 className="font-serif text-sm font-medium mb-1">Secure Transfer</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">Insured shipping and secure ownership transfer.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <Info size={24} className="text-luxury-gold flex-shrink-0" />
                                <div>
                                    <h4 className="font-serif text-sm font-medium mb-1">Condition Report</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">Detailed condition assessment available on request.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details & Story */}
                    <div className="w-full lg:w-2/5">
                        <div className="sticky top-32">
                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-heritage-cream text-heritage-bronze text-xs font-bold uppercase tracking-widest">
                                        {product.category}
                                    </span>
                                    {product.condition && (
                                        <span className="text-xs text-gray-500 uppercase tracking-widest border border-gray-200 px-3 py-1 rounded-full">
                                            Condition: {product.condition}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-4xl md:text-5xl font-serif text-heritage-charcoal leading-tight mb-6">
                                    {product.title}
                                </h1>
                                <p className="text-3xl font-light text-heritage-charcoal">
                                    ${product.price?.toLocaleString()}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 mb-10 pb-10 border-b border-gray-100">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={inCart}
                                    className={`flex-1 py-5 text-sm uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-3 ${inCart
                                            ? 'bg-gray-100 text-gray-400 cursor-default'
                                            : 'bg-heritage-charcoal text-white hover:bg-heritage-brown shadow-lg'
                                        }`}
                                >
                                    <ShoppingBag size={18} />
                                    {inCart ? 'Added to Cart' : 'Acquire Now'}
                                </button>
                                <button
                                    onClick={handleWishlistToggle}
                                    className={`px-6 border transition-colors ${inWishlist
                                            ? 'border-red-200 bg-red-50 text-red-600'
                                            : 'border-gray-200 hover:border-heritage-charcoal text-gray-500 hover:text-heritage-charcoal'
                                        }`}
                                >
                                    <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
                                </button>
                            </div>

                            {/* Storytelling */}
                            <div className="mb-10">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Provenance & Story</h3>
                                <div className="font-serif text-lg leading-loose text-gray-700 space-y-6">
                                    {product.description.split('\n').map((paragraph, i) => (
                                        <p key={i}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Keywords */}
                            {keywords.length > 0 && (
                                <div className="mb-10">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {keywords.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs border border-gray-100 rounded-sm">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Seller Info */}
                            <div className="bg-gray-50 p-6 border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Brokered By</p>
                                <div className="flex items-center justify-between">
                                    <p className="font-serif text-lg">{product.sellerName || 'The Collectors Exchange'}</p>
                                    {product.sellerId === 'system' ? (
                                        <ShieldCheck size={18} className="text-luxury-gold" />
                                    ) : (
                                        <span className="text-xs text-gray-500">Private Seller</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
