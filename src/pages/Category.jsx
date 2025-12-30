import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';

const MOCK_PRODUCTS = [
    { id: 1, name: 'Vintage 1920s Vase', category: 'Antiques', price: 1200, isVerified: true, image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=1000' },
    { id: 2, name: 'Limited Edition Watch', category: 'Limited Editions', price: 4500, isVerified: true, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=1000' },
    { id: 3, name: 'Signed Baseball Card', category: 'Collectibles', price: 850, isVerified: true, image: 'https://images.unsplash.com/photo-1599583236376-79c29af383b4?auto=format&fit=crop&q=80&w=1000' },
    { id: 4, name: '18th Century Map', category: 'Antiques', price: 3200, isVerified: true, image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000' },
    { id: 5, name: 'Rare Vinyl Record', category: 'Collectibles', price: 200, isVerified: true, image: 'https://images.unsplash.com/photo-1621252179027-94459d27d3ee?auto=format&fit=crop&q=80&w=1000' },
    { id: 6, name: 'Gold Coin 1900', category: 'Collectibles', price: 1500, isVerified: true, image: 'https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?auto=format&fit=crop&q=80&w=1000' },
];

const CATEGORIES = ['All', 'Antiques', 'Collectibles', 'Limited Editions'];

const Category = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredProducts = selectedCategory === 'All'
        ? MOCK_PRODUCTS
        : MOCK_PRODUCTS.filter(p => p.category === selectedCategory);

    return (
        <div className="container mx-auto py-12 px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-4xl font-serif mb-2">Explore Collection</h1>
                    <p className="text-gray-500 font-light">Discover unique items tailored for connoisseurs.</p>
                </div>
                <div className="flex items-center gap-4 mt-6 md:mt-0">
                    <span className="text-sm uppercase tracking-widest text-gray-400">Filter by:</span>
                    <div className="flex bg-white border border-gray-200 p-1">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 text-sm transition-colors ${selectedCategory === cat ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="py-20 text-center text-gray-500">
                    No products found in this category.
                </div>
            )}
        </div>
    );
};

export default Category;
