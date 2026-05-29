import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ShieldCheck } from 'lucide-react';
import { addToWishlist, removeFromWishlist, isInWishlist, addToCart, isInCart } from '../utils/storage';

const ProductCard = ({ product, onUpdate }) => {
    const [inWishlist, setInWishlist] = useState(() => isInWishlist(product.id));
    const [inCart, setInCart] = useState(() => isInCart(product.id));

    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (inWishlist) {
            removeFromWishlist(product.id);
            setInWishlist(false);
        } else {
            addToWishlist(product.id);
            setInWishlist(true);
        }
        if (onUpdate) onUpdate();
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

    return (
        <div className="bg-white border border-gray-100 group hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
            <Link to={`/THE-COLLECTORS-EXCHANGE/product/${product.id}`} className="block relative aspect-square bg-gray-100 overflow-hidden cursor-pointer shrink-0">
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

                {/* Wishlist Button - Keep outside Link to prevent navigation when clicked */}
                <button
                    onClick={handleWishlistToggle}
                    className={`absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm transition-colors z-10 ${inWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                    <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
                </button>

                {/* Verified Badge */}
                {product.isVerified && (
                    <div className="absolute bottom-4 left-4 bg-black text-white text-xs px-3 py-1 font-sans tracking-widest uppercase flex items-center gap-1">
                        <ShieldCheck size={12} /> Verified
                    </div>
                )}
            </Link>

            <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">{product.category}</div>
                    <Link to={`/THE-COLLECTORS-EXCHANGE/product/${product.id}`} className="block hover:text-luxury-gold transition-colors">
                        <h3 className="font-serif text-lg font-medium mb-2">{title}</h3>
                    </Link>
                    <p className="text-luxury-gold font-sans font-semibold mb-4">₹{product.price?.toLocaleString()}</p>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={inCart}
                    className={`w-full py-3 text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-auto ${inCart
                        ? 'bg-gray-200 text-gray-500 cursor-default'
                        : 'bg-black text-white hover:bg-luxury-gold'
                        }`}
                >
                    <ShoppingBag size={16} />
                    {inCart ? 'In Cart' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
