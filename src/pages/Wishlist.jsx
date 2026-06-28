import React from 'react';
import { Heart, Trash2, ShoppingBag, ShieldCheck, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { useWishlist, useRemoveFromWishlist } from '../hooks/api/useWishlist';
import { useAddToCart, useCart } from '../hooks/api/useCart';
import { getUser } from '../utils/storage';

const Wishlist = () => {
    const user = getUser();
    const { data: wishlistData = [], isLoading } = useWishlist(user?.id);
    const removeFromWishlistMutation = useRemoveFromWishlist();
    const addToCartMutation = useAddToCart();
    const { data: cartItems = [] } = useCart(user?.id);

    const wishlistItems = wishlistData.map(item => item.product);

    const handleRemove = async (productId) => {
        if (!user?.id) return;
        try {
            await removeFromWishlistMutation.mutateAsync({ userId: user.id, productId });
        } catch (error) {
            console.error('Failed to remove from wishlist', error);
        }
    };

    const handleAddToCart = async (productId) => {
        if (!user?.id) return;
        try {
            await addToCartMutation.mutateAsync({ userId: user.id, productId });
            // Silently succeed — button state will update via query invalidation
        } catch (error) {
            console.error('Failed to add to cart', error);
        }
    };

    const isInCart = (productId) => {
        return cartItems.some(item => item.productId === productId);
    };

    if (!user) {
        return (
            <div className="container mx-auto py-20 px-6 text-center">
                <SEO title="Wishlist" description="View your saved collectibles and rare finds on The Collectors Exchange wishlist." canonical="/wishlist" noindex />
                <h1 className="text-2xl font-serif mb-4">Please Sign In</h1>
                <p className="text-gray-500 mb-6">You need to be logged in to view your wishlist.</p>
                <Link to="/account" className="bg-black text-white px-6 py-2 uppercase tracking-widest text-sm hover:bg-luxury-gold transition-colors">
                    Sign In
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-20 text-center">
                <SEO title="Wishlist" description="View your saved collectibles and rare finds on The Collectors Exchange wishlist." canonical="/wishlist" noindex />
                <Loader2 className="animate-spin mx-auto text-luxury-gold mb-4" size={40} />
                <p className="font-serif italic text-gray-400">Loading your collection...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12 px-6">
            <SEO title="Wishlist" description="View your saved collectibles and rare finds on The Collectors Exchange wishlist." canonical="/wishlist" noindex />
            <h1 className="text-4xl font-serif mb-8 text-center md:text-left">My Wishlist</h1>

            {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...wishlistItems].sort((a, b) => {
                        const aSold = a.status === 'Sold' || a.product?.status === 'Sold';
                        const bSold = b.status === 'Sold' || b.product?.status === 'Sold';
                        if (aSold && !bSold) return 1;
                        if (!aSold && bSold) return -1;
                        return 0;
                    }).map(product => (
                        <div key={product.id} className="bg-white border border-gray-100 shadow-sm group">
                            {/* Image */}
                            <div className="relative overflow-hidden">
                                <img
                                    src={product.image || 'https://via.placeholder.com/400'}
                                    alt={product.title}
                                    className="w-full h-48 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {product.isVerified && (
                                    <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 text-xs uppercase tracking-widest flex items-center gap-1">
                                        <ShieldCheck size={12} /> Verified
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-3 sm:p-6">
                                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mb-1 sm:mb-2">{product.category}</p>
                                <h3 className="font-serif text-sm sm:text-lg font-medium mb-1 sm:mb-2 line-clamp-1">{product.title}</h3>
                                <p className="text-base sm:text-xl font-semibold mb-3 sm:mb-4">₹{product.price?.toLocaleString()}</p>

                                <div className="flex gap-2 sm:gap-3">
                                    <button
                                        onClick={() => handleAddToCart(product.id)}
                                        disabled={isInCart(product.id)}
                                        className="flex-1 bg-black text-white py-2 sm:py-3 text-xs sm:text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors disabled:bg-gray-300 flex items-center justify-center gap-1 sm:gap-2"
                                    >
                                        <ShoppingBag size={13} />
                                        {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
                                    </button>
                                    <button
                                        onClick={() => handleRemove(product.id)}
                                        className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white border border-gray-100">
                    <Heart size={64} className="mx-auto text-gray-300 mb-6" />
                    <h3 className="text-xl font-serif text-gray-600 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-400 mb-6">Save items you love by clicking the heart icon.</p>
                    <Link
                        to="/category"
                        className="inline-block bg-black text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors"
                    >
                        Explore The Exchange
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Wishlist;
