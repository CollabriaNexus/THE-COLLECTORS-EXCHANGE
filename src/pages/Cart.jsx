import React from 'react';
import { Trash2 } from 'lucide-react';

const CART_ITEMS = [
    { id: 1, name: 'Vintage 1920s Vase', category: 'Antiques', price: 1200, image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=1000' },
];

const Cart = () => {
    const subtotal = CART_ITEMS.reduce((sum, item) => sum + item.price, 0);
    const platformFee = subtotal * 0.05; // 5% fee
    const total = subtotal + platformFee;

    return (
        <div className="container mx-auto py-12 px-6">
            <h1 className="text-4xl font-serif mb-12 text-center md:text-left">Shopping Cart</h1>
            <div className="flex flex-col lg:flex-row gap-12">
                {/* Cart Items */}
                <div className="w-full lg:w-2/3">
                    <div className="bg-white shadow-sm border border-gray-100">
                        {CART_ITEMS.map(item => (
                            <div key={item.id} className="flex gap-6 p-6 border-b border-gray-100 last:border-0 items-center">
                                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover " />
                                <div className="flex-grow">
                                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{item.category}</p>
                                    <h3 className="font-serif text-lg font-medium">{item.name}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="font-sans font-semibold mb-2">${item.price.toLocaleString()}</p>
                                    <button className="text-red-500 hover:text-red-700 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Checkout Summary */}
                <div className="w-full lg:w-1/3">
                    <div className="bg-white p-8 shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="text-xl font-serif mb-6">Order Summary</h3>
                        <div className="space-y-4 text-sm text-gray-600 border-b border-gray-100 pb-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Platform Verification Fee</span>
                                <span>${platformFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span className="text-green-600">Free</span>
                            </div>
                        </div>
                        <div className="flex justify-between pt-6 font-serif font-bold text-lg mb-8">
                            <span>Total</span>
                            <span>${total.toLocaleString()}</span>
                        </div>
                        <button className="w-full bg-black text-white py-4 font-sans text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors">
                            Proceed to Checkout
                        </button>
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-400">Secure Checkout powered by Stripe (Demo)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
