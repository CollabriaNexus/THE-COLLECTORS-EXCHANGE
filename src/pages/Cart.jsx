import { Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart, useRemoveFromCart } from '../hooks/api/useCart';
import { getUser } from '../utils/storage';

const Cart = () => {
    const user = getUser();
    const { data: cartItems = [], isLoading } = useCart(user?.id);
    const removeMutation = useRemoveFromCart();

    const handleRemove = async (productId) => {
        if (!user) return;
        try {
            await removeMutation.mutateAsync({ userId: user.id, productId });
        } catch {
            alert('Failed to remove item from cart.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-luxury-gold mb-4" size={48} />
                <p className="text-gray-500 font-serif text-xl italic">Loading Your Collection...</p>
            </div>
        );
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price || 0), 0);
    const platformFee = subtotal * 0.05; // 5% fee
    const total = subtotal + platformFee;

    return (
        <div className="container mx-auto py-12 px-6">
            <h1 className="text-4xl font-serif mb-12 text-center md:text-left">Shopping Cart</h1>

            {cartItems.length > 0 ? (
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Cart Items */}
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white shadow-sm border border-gray-100">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex gap-6 p-6 border-b border-gray-100 last:border-0 items-center">
                                    <img
                                        src={item.product.image || 'https://via.placeholder.com/100'}
                                        alt={item.product.title}
                                        className="w-24 h-24 object-cover"
                                    />
                                    <div className="flex-grow">
                                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{item.product.category}</p>
                                        <h3 className="font-serif text-lg font-medium">{item.product.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{item.product.condition}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-sans font-semibold mb-2">${item.product.price?.toLocaleString()}</p>
                                        <button
                                            onClick={() => handleRemove(item.product.id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
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
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>${subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Platform Verification Fee (5%)</span>
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
                                <p className="text-xs text-gray-400">Checkout is a demo. No payment will be processed.</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-white border border-gray-100">
                    <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
                    <h3 className="text-xl font-serif text-gray-600 mb-2">Your cart is empty</h3>
                    <p className="text-gray-400 mb-6">Add items to your cart to proceed.</p>
                    <Link
                        to="/THE-COLLECTORS-EXCHANGE/category"
                        className="inline-block bg-black text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors"
                    >
                        Explore The Exchange
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Cart;
