import { Trash2, ShoppingBag, Loader2, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useRemoveFromCart } from '../hooks/api/useCart';
import { useProducts } from '../hooks/api/useProducts';
import { getUser } from '../utils/storage';
import apiClient from '../hooks/api/apiClient';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';

const Cart = () => {
    const user = getUser();
    const navigate = useNavigate();
    const showToast = useToast();
    const { data: cartItems = [], isLoading } = useCart(user?.id);
    const removeMutation = useRemoveFromCart();
    const confirm = useConfirm();
    const { data: featuredData } = useProducts(null, '', 1, 6);
    const featuredProducts = (featuredData?.products || []).filter(
        p => (p.listingCategory === 'featured' || p.listingCategory === 'most_rare') && p.status !== 'Sold'
    ).slice(0, 4);

    const handleRemove = async (productId) => {
        if (!user) return;
        const confirmed = await confirm('Remove this item from your cart?');
        if (!confirmed) return;
        try {
            await removeMutation.mutateAsync({ userId: user.id, productId });
            apiClient.post('/analytics/cart', { productId, action: 'REMOVE' }).catch(() => {});
        } catch {
            showToast('Failed to remove item from cart.', 'error');
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

    const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0), 0);
    const total = subtotal;

    return (
        <div className="container mx-auto py-12 px-6">
            <SEO title="Cart" description="Review your curated collection of authenticated collectibles before checkout on The Collectors Exchange." canonical="/cart" noindex />
            <h1 className="text-2xl sm:text-4xl font-serif mb-6 sm:mb-12 text-center md:text-left">Shopping Cart</h1>

            {cartItems.length > 0 ? (
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Cart Items */}
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white shadow-sm border border-gray-100">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex gap-3 sm:gap-6 p-3 sm:p-6 border-b border-gray-100 last:border-0 items-center">
                                    <img
                                        src={item.product?.image || 'https://via.placeholder.com/100'}
                                        alt={item.product?.title || 'Product'}
                                        className="w-16 sm:w-24 h-16 sm:h-24 object-cover"
                                    />
                                    <div className="flex-grow min-w-0">
                                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mb-0.5 sm:mb-1">{item.product?.category || 'Unknown'}</p>
                                        <h3 className="font-serif text-sm sm:text-lg font-medium truncate">{item.product?.title || 'Unavailable'}</h3>
                                        <p className="text-[11px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{item.product?.condition || ''}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-sans text-xs sm:text-base font-semibold mb-1 sm:mb-2">₹{item.product?.price?.toLocaleString() || '0'}</p>
                                        <button
                                            onClick={() => handleRemove(item.product?.id || item.productId)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Checkout Summary */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white p-8 shadow-sm border border-gray-100 lg:sticky lg:top-24">
                            <h3 className="text-lg sm:text-xl font-serif mb-4 sm:mb-6">Order Summary</h3>
                            <div className="space-y-4 text-sm text-gray-600 border-b border-gray-100 pb-6">
                                <div className="flex justify-between">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                            </div>
                            <div className="flex justify-between pt-6 font-serif font-bold text-lg mb-8">
                                <span>Total</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>
                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-black text-white py-4 font-sans text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors"
                            >
                                Proceed to Checkout
                            </button>
                            <div className="mt-4 text-center">
                                <p className="text-xs text-gray-400">Secure checkout with online payment or Cash on Delivery.</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16">
                    <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
                    <h3 className="text-xl font-serif text-gray-600 mb-2">Your cart is empty</h3>
                    <p className="text-gray-400 mb-8">Add items to your cart to proceed.</p>
                    <Link
                        to="/category"
                        className="inline-block bg-black text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors mb-8 sm:mb-16"
                    >
                        Explore The Exchange
                    </Link>
                    {featuredProducts.length > 0 && (
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-center gap-4 mb-8">
                                <div className="h-px w-8 bg-luxury-gold/40" />
                                <span className="text-luxury-gold tracking-[0.3em] text-xs font-bold uppercase">Curated Picks</span>
                                <div className="h-px w-8 bg-luxury-gold/40" />
                            </div>
                            <div className="flex sm:grid sm:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible scrollbar-hide snap-x snap-mandatory sm:snap-none -mx-6 sm:mx-0 px-6 sm:px-0 pb-1 sm:pb-0">
                                {featuredProducts.map((product) => (
                                    <Link
                                        key={product.id}
                                        to={`/product/${product.id}`}
                                        className="snap-start shrink-0 w-[65vw] sm:w-auto group bg-white border border-gray-100 hover:shadow-heritage-hover transition-all duration-500"
                                    >
                                        <div className="aspect-square bg-heritage-beige overflow-hidden">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.title}
                                                    loading="lazy"
                                                    width="200" height="200"
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-heritage-bronze/30">
                                                    <ShoppingBag size={24} strokeWidth={1} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 sm:p-3 text-left">
                                            <p className="text-[10px] sm:text-xs text-heritage-bronze uppercase tracking-widest truncate">{product.category}</p>
                                            <p className="font-serif text-xs sm:text-sm font-medium truncate group-hover:text-luxury-gold transition-colors">{product.title}</p>
                                            <p className="text-heritage-gold-muted text-[11px] sm:text-xs font-medium mt-0.5 sm:mt-1">₹{product.price?.toLocaleString()}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <Link
                                to="/category"
                                className="inline-flex items-center gap-2 mt-8 text-sm uppercase tracking-widest text-heritage-charcoal/60 hover:text-luxury-gold transition-colors group"
                            >
                                View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Cart;
