import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ShieldCheck } from 'lucide-react';
import { getUser } from '../utils/storage';
import { useCart, useAddToCart } from '../hooks/api/useCart';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '../hooks/api/useWishlist';
import { useToast } from './Toast';

const ProductCard = ({ product, onUpdate }) => {
    const user = getUser();
    const navigate = useNavigate();
    const showToast = useToast();
    const { data: cartItems = [] } = useCart(user?.id);
    const addToCartMutation = useAddToCart();
    const { data: wishlistItems = [] } = useWishlist(user?.id);
    const addToWishlistMutation = useAddToWishlist();
    const removeFromWishlistMutation = useRemoveFromWishlist();

    const inCart = cartItems.some(item => item.productId === product.id);
    const inWishlist = wishlistItems.some(item => (item.product?.id === product.id) || item.productId === product.id);

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            showToast('Please sign in to add to wishlist', 'error');
            return;
        }

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
        } catch (err) {
            showToast(err?.response?.data?.message || 'Failed to add to cart', 'error');
        }
    };

    const title = product.title || product.name;

    return (
        <div className="bg-white border border-gray-100 group hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
            <Link to={`/product/${product.id}`} className="block relative aspect-square bg-gray-100 overflow-hidden cursor-pointer shrink-0">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200">
                        No Image
                    </div>
                )}

                <button
                    onClick={handleWishlistToggle}
                    className={`absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm transition-colors z-10 ${inWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                    <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
                </button>

                {product.isVerified && (
                    <div className="absolute bottom-4 left-4 bg-black text-white text-xs px-3 py-1 font-sans tracking-widest uppercase flex items-center gap-1">
                        <ShieldCheck size={12} /> Verified
                    </div>
                )}
            </Link>

            <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">{product.category}</div>
                    <Link to={`/product/${product.id}`} className="block hover:text-luxury-gold transition-colors">
                        <h3 className="font-serif text-lg font-medium mb-2">{title}</h3>
                    </Link>
                    <p className="text-luxury-gold font-sans font-semibold mb-4">₹{product.price?.toLocaleString()}</p>
                </div>

                <button
                    onClick={inCart ? () => navigate('/cart') : handleAddToCart}
                    disabled={addToCartMutation.isPending}
                    className={`w-full py-3 text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-auto ${inCart
                        ? 'bg-luxury-gold text-white cursor-pointer hover:bg-luxury-gold/90'
                        : 'bg-black text-white hover:bg-luxury-gold'
                        }`}
                >
                    <ShoppingBag size={16} />
                    {addToCartMutation.isPending ? 'Adding...' : inCart ? 'In Cart →' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
