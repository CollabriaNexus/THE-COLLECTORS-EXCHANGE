import React from 'react';
import { Heart } from 'lucide-react';

const ProductCard = ({ product }) => {
    return (
        <div className="bg-white border border-gray-100 group hover:shadow-lg transition-shadow duration-300">
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {/* Placeholder for image */}
                {product.image ? (
                    <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200">
                        No Image
                    </div>
                )}
                <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:text-red-500 transition-colors">
                    <Heart size={16} />
                </button>
                {product.isVerified && (
                    <div className="absolute bottom-4 left-4 bg-luxury-gold text-white text-xs px-2 py-1 font-sans tracking-widest uppercase">
                        Verified
                    </div>
                )}
            </div>
            <div className="p-6">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">{product.category}</div>
                <h3 className="font-serif text-lg font-medium mb-2">{product.name}</h3>
                <p className="text-luxury-gold font-sans font-semibold">${product.price.toLocaleString()}</p>
            </div>
        </div>
    );
};

export default ProductCard;
