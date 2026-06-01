import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, ChevronRight, CheckCircle } from 'lucide-react';
import { useCart } from '../hooks/api/useCart';
import { useCreateOrder, useVerifyPayment } from '../hooks/api/useCheckout';
import { getUser } from '../utils/storage';
import apiClient from '../hooks/api/apiClient';
import { useToast } from '../components/Toast';

const Checkout = () => {
    const navigate = useNavigate();
    const currentUser = getUser();
    const { data: cartItems = [], isLoading: cartLoading } = useCart(currentUser?.id);
    const showToast = useToast();
    const createOrderMutation = useCreateOrder();
    const verifyPaymentMutation = useVerifyPayment();

    const [orderSuccess, setOrderSuccess] = useState(null);
    const [form, setForm] = useState({
        shippingAddress: '',
        recipientName: currentUser?.name || '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        phone: currentUser?.phone || '',
    });
    const [errors, setErrors] = useState({});

    // Load Razorpay script
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [razorpayError, setRazorpayError] = useState(false);
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setRazorpayLoaded(true);
        script.onerror = () => setRazorpayError(true);
        document.body.appendChild(script);
        return () => document.body.removeChild(script);
    }, []);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0), 0);
    const total = subtotal;

    const validate = () => {
        const newErrors = {};
        if (!form.recipientName.trim()) newErrors.recipientName = 'Recipient name is required';
        if (!form.shippingAddress.trim()) newErrors.shippingAddress = 'Address is required';
        if (!form.city.trim()) newErrors.city = 'City is required';
        if (!form.state.trim()) newErrors.state = 'State is required';
        if (!form.zipCode.trim()) newErrors.zipCode = 'PIN code is required';
        if (!form.country.trim()) newErrors.country = 'Country is required';
        if (!form.phone.trim() || form.phone.length < 10) newErrors.phone = 'Valid phone number is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const orderPayload = {
                ...form,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    quantity: 1,
                })),
            };

            const orderData = await createOrderMutation.mutateAsync(orderPayload);

            // Track checkout events for each product
            cartItems.forEach(item => {
                apiClient.post('/analytics/checkout', {
                    productId: item.productId,
                    orderId: orderData.orderId,
                }).catch(() => {});
            });

            if (orderData.isMock) {
                // Mock mode: skip Razorpay, directly verify
                const verifyData = await verifyPaymentMutation.mutateAsync({
                    orderId: orderData.orderId,
                    razorpayOrderId: orderData.razorpayOrderId,
                    razorpayPaymentId: `pay_mock_${Date.now()}`,
                    razorpaySignature: `sig_mock_${Date.now()}`,
                });
                setOrderSuccess(verifyData.order);
                return;
            }

            if (!razorpayLoaded) {
                showToast('Payment gateway failed to load. Please disable ad blockers or try again.', 'error');
                return;
            }

            // Live Razorpay flow
            const options = {
                key: orderData.keyId,
                amount: Math.round(orderData.amount * 100),
                currency: 'INR',
                name: 'The Collectors Exchange',
                description: 'Secure Acquisition',
                order_id: orderData.razorpayOrderId,
                prefill: {
                    name: orderData.user.name,
                    email: orderData.user.email,
                    contact: orderData.user.phone,
                },
                theme: { color: '#D4AF37' },
                handler: async (response) => {
                    try {
                        const verifyData = await verifyPaymentMutation.mutateAsync({
                            orderId: orderData.orderId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        setOrderSuccess(verifyData.order);
                    } catch {
                        showToast('Payment verification failed. Please contact support.', 'error');
                    }
                },
                modal: {
                    ondismiss: () => {
                        // User closed the modal — order stays Pending
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            showToast(err?.response?.data?.error || err.message || 'Failed to create order', 'error');
        }
    };

    // Redirect if not logged in
    if (!currentUser) {
        return (
            <div className="container mx-auto py-20 px-6 text-center">
                <Helmet><title>Checkout — The Collectors Exchange</title></Helmet>
                <h1 className="text-2xl font-serif mb-4">Please Sign In</h1>
                <p className="text-gray-500 mb-6">You need to be logged in to checkout.</p>
                <Link to="/account" className="bg-black text-white px-6 py-3 uppercase tracking-widest text-sm hover:bg-luxury-gold transition-colors">
                    Sign In
                </Link>
            </div>
        );
    }

    if (cartLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Helmet><title>Checkout — The Collectors Exchange</title></Helmet>
                <Loader2 className="animate-spin text-luxury-gold mb-4" size={48} />
                <p className="text-gray-500 font-serif text-xl italic">Preparing Checkout...</p>
            </div>
        );
    }

    if (cartItems.length === 0 && !orderSuccess) {
        return (
            <div className="container mx-auto py-20 px-6 text-center">
                <Helmet><title>Checkout — The Collectors Exchange</title></Helmet>
                <h1 className="text-2xl font-serif mb-4">Your cart is empty</h1>
                <Link to="/category" className="bg-black text-white px-6 py-3 uppercase tracking-widest text-sm hover:bg-luxury-gold transition-colors">
                    Explore The Exchange
                </Link>
            </div>
        );
    }

    // Order success screen
    if (orderSuccess) {
        return (
            <div className="container mx-auto py-20 px-6 max-w-lg text-center">
                <Helmet><title>Checkout — The Collectors Exchange</title></Helmet>
                <div className="bg-white border border-gray-100 shadow-heritage p-12">
                    <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
                    <h1 className="text-3xl font-serif mb-3 text-heritage-charcoal">Order Confirmed</h1>
                    <p className="text-gray-500 mb-6">
                        Your acquisition is being processed. You will receive a confirmation shortly.
                    </p>
                    <div className="bg-gray-50 border border-gray-100 p-4 mb-8 text-left space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500 uppercase tracking-widest text-xs">Order ID</span>
                            <span className="font-mono text-xs text-gray-700">{orderSuccess.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 uppercase tracking-widest text-xs">Status</span>
                            <span className="font-medium text-green-600">{orderSuccess.status}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 uppercase tracking-widest text-xs">Total</span>
                            <span className="font-semibold">₹{orderSuccess.totalAmount?.toLocaleString()}</span>
                        </div>
                    </div>
                    <Link
                        to="/"
                        className="inline-block bg-black text-white px-8 py-4 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors"
                    >
                        Return to The Exchange
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12 px-6">
            <Helmet><title>Checkout — The Collectors Exchange</title></Helmet>
            {/* Breadcrumb */}
            <div className="flex items-center text-xs text-gray-500 uppercase tracking-widest gap-2 mb-8">
                <Link to="/cart" className="hover:text-luxury-gold">Cart</Link>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-medium">Checkout</span>
            </div>

            <h1 className="text-4xl font-serif mb-10 text-heritage-charcoal">Secure Checkout</h1>

            <form onSubmit={handlePlaceOrder}>
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Shipping Form */}
                    <div className="w-full lg:w-3/5 space-y-6">
                        <div className="bg-white border border-gray-100 shadow-sm p-8">
                            <h2 className="text-xl font-serif font-bold text-heritage-charcoal mb-6">Shipping Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="recipientName" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Recipient Name</label>
                                    <input
                                        id="recipientName"
                                        type="text"
                                        value={form.recipientName}
                                        onChange={e => setForm({ ...form, recipientName: e.target.value })}
                                        placeholder="Full name"
                                        className={`w-full p-4 bg-gray-50 border focus:outline-none focus:border-luxury-gold transition-colors ${errors.recipientName ? 'border-red-400' : 'border-gray-200'}`}
                                    />
                                    {errors.recipientName && <p className="text-red-500 text-xs mt-1">{errors.recipientName}</p>}
                                </div>

                                <div>
                                    <label htmlFor="shippingAddress" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                        Street Address
                                    </label>
                                    <input
                                        id="shippingAddress"
                                        type="text"
                                        value={form.shippingAddress}
                                        onChange={e => setForm({ ...form, shippingAddress: e.target.value })}
                                        placeholder="House / Flat No., Street, Area"
                                        className={`w-full p-4 bg-gray-50 border focus:outline-none focus:border-luxury-gold transition-colors ${errors.shippingAddress ? 'border-red-400' : 'border-gray-200'}`}
                                    />
                                    {errors.shippingAddress && <p className="text-red-500 text-xs mt-1">{errors.shippingAddress}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="city" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">City</label>
                                        <input
                                            id="city"
                                            type="text"
                                            value={form.city}
                                            onChange={e => setForm({ ...form, city: e.target.value })}
                                            placeholder="Mumbai"
                                            className={`w-full p-4 bg-gray-50 border focus:outline-none focus:border-luxury-gold transition-colors ${errors.city ? 'border-red-400' : 'border-gray-200'}`}
                                        />
                                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="state" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">State</label>
                                        <input
                                            id="state"
                                            type="text"
                                            value={form.state}
                                            onChange={e => setForm({ ...form, state: e.target.value })}
                                            placeholder="Maharashtra"
                                            className={`w-full p-4 bg-gray-50 border focus:outline-none focus:border-luxury-gold transition-colors ${errors.state ? 'border-red-400' : 'border-gray-200'}`}
                                        />
                                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="zipCode" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">PIN Code</label>
                                        <input
                                            id="zipCode"
                                            type="text"
                                            value={form.zipCode}
                                            onChange={e => setForm({ ...form, zipCode: e.target.value })}
                                            placeholder="400001"
                                            className={`w-full p-4 bg-gray-50 border focus:outline-none focus:border-luxury-gold transition-colors ${errors.zipCode ? 'border-red-400' : 'border-gray-200'}`}
                                        />
                                        {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="country" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Country</label>
                                        <input
                                            id="country"
                                            type="text"
                                            value={form.country}
                                            onChange={e => setForm({ ...form, country: e.target.value })}
                                            placeholder="India"
                                            className={`w-full p-4 bg-gray-50 border focus:outline-none focus:border-luxury-gold transition-colors ${errors.country ? 'border-red-400' : 'border-gray-200'}`}
                                        />
                                        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Phone</label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                            placeholder="9876543210"
                                            className={`w-full p-4 bg-gray-50 border focus:outline-none focus:border-luxury-gold transition-colors ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                                        />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { icon: ShieldCheck, label: 'Secure Payment', sub: 'Razorpay encrypted' },
                                { icon: ShieldCheck, label: 'Authenticity', sub: 'Expert verified' },
                                { icon: ShieldCheck, label: 'Insured Shipping', sub: 'Full coverage' },
                            ].map(({ icon: Icon, label, sub }) => (
                                <div key={label} className="bg-white border border-gray-100 p-4 text-center">
                                    <Icon size={20} className="mx-auto text-luxury-gold mb-2" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-700">{label}</p>
                                    <p className="text-xs text-gray-400 mt-1">{sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-2/5">
                        <div className="bg-white border border-gray-100 shadow-sm p-8 sticky top-24">
                            <h2 className="text-xl font-serif font-bold text-heritage-charcoal mb-6">Order Summary</h2>

                            {/* Items */}
                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <img
                                            src={item.product?.image || 'https://via.placeholder.com/60'}
                                            alt={item.product?.title}
                                            className="w-14 h-14 object-cover border border-gray-100"
                                        />
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm font-serif font-medium truncate">{item.product?.title}</p>
                                            <p className="text-xs text-gray-500">{item.product?.condition}</p>
                                        </div>
                                        <p className="text-sm font-semibold whitespace-nowrap">₹{item.product?.price?.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="border-t border-gray-100 pt-4 space-y-3 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4 border-t border-gray-100 font-serif font-bold text-lg mt-4 mb-8">
                                <span>Total</span>
                                <span>₹{total.toLocaleString('en-IN')}</span>
                            </div>

                            {razorpayError && (
                                <p className="text-xs text-red-600 text-center mb-2">Payment gateway failed to load. Please disable ad blockers and refresh.</p>
                            )}
                            <button
                                type="submit"
                                disabled={createOrderMutation.isPending || verifyPaymentMutation.isPending}
                                className="w-full bg-black text-white py-5 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors duration-300 flex items-center justify-center gap-3 disabled:opacity-60"
                            >
                                {(createOrderMutation.isPending || verifyPaymentMutation.isPending) ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={18} />
                                        Place Order & Pay
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Checkout;
