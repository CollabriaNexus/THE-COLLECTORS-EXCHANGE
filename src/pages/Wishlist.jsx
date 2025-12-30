import React from 'react';
import ProductCard from '../components/ProductCard';

const WISHLIST_ITEMS = [
    { id: 2, name: 'Limited Edition Watch', category: 'Limited Editions', price: 4500, isVerified: true, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=1000' },
    { id: 4, name: '18th Century Map', category: 'Antiques', price: 3200, isVerified: true, image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000' },
];

const Wishlist = () => {
    return (
        <div className="container mx-auto py-12 px-6">
            <h1 className="text-4xl font-serif mb-8 text-center md:text-left">My Wishlist</h1>
            {WISHLIST_ITEMS.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {WISHLIST_ITEMS.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center py-20">Your wishlist is empty.</p>
            )}
        </div>
    );
};

export default Wishlist;
