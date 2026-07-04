import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ShieldCheck, Loader2, CheckCircle, Tag, Percent, X } from 'lucide-react';
import { useCart } from '../hooks/api/useCart';
import { useCreateOrder, useVerifyPayment, useValidateCoupon } from '../hooks/api/useCheckout';
import { getUser } from '../utils/storage';
import apiClient from '../hooks/api/apiClient';
import { useToast } from '../components/Toast';
import { Reveal, Magnetic } from '../components/Motion';

const Checkout = () => {
  const currentUser = getUser();
  const { data: cartItems = [], isLoading: cartLoading } = useCart(currentUser?.id);
  const showToast = useToast();
  const createOrderMutation = useCreateOrder();
  const verifyPaymentMutation = useVerifyPayment();
  const validateCouponMutation = useValidateCoupon();

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
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [couponInput, setCouponInput] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
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
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const total = Math.max(0, subtotal - discountAmount);

  const validate = () => {
    const newErrors = {};
    if (!form.recipientName.trim()) newErrors.recipientName = 'Recipient name is required';
    if (!form.shippingAddress.trim()) newErrors.shippingAddress = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.zipCode.trim()) newErrors.zipCode = 'PIN code is required';
    if (!form.country.trim()) newErrors.country = 'Country is required';
    if (!form.phone.trim() || form.phone.length < 10)
      newErrors.phone = 'Valid phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const orderPayload = {
        ...form,
        paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: 1,
        })),
      };
      if (couponCode.trim()) {
        orderPayload.couponCode = couponCode.trim();
      }

      const orderData = await createOrderMutation.mutateAsync(orderPayload);

      // Set applied coupon state if coupon was applied
      if (orderData.couponApplied) {
        setAppliedCoupon({
          discountPercent: orderData.discountPercent,
          discountAmount: orderData.discountAmount,
        });
      }

      // Track checkout events for each product
      cartItems.forEach((item) => {
        apiClient
          .post('/analytics/checkout', {
            productId: item.productId,
            orderId: orderData.orderId,
          })
          .catch(() => {});
      });

      // COD: skip Razorpay, verify directly
      if (orderData.isCOD) {
        const verifyData = await verifyPaymentMutation.mutateAsync({
          orderId: orderData.orderId,
          razorpayOrderId: `cod_${orderData.orderId}`,
          razorpayPaymentId: `cod_${orderData.orderId}`,
          razorpaySignature: `cod_${orderData.orderId}`,
        });
        setOrderSuccess(verifyData.order);
        return;
      }

      // Mock mode: skip Razorpay, directly verify
      if (orderData.isMock) {
        const verifyData = await verifyPaymentMutation.mutateAsync({
          orderId: orderData.orderId,
          razorpayOrderId: orderData.razorpayOrderId,
          razorpayPaymentId: `pay_mock_${orderData.orderId}`,
          razorpaySignature: `sig_mock_${orderData.orderId}`,
        });
        setOrderSuccess(verifyData.order);
        return;
      }

      if (!razorpayLoaded) {
        showToast(
          'Payment gateway failed to load. Please disable ad blockers or try again.',
          'error',
        );
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
        <SEO
          title="Checkout"
          description="Securely complete your purchase of authentic collectibles on The Collectors Exchange."
          canonical="/checkout"
          noindex
        />
        <h1 className="text-2xl sm:text-4xl font-serif mb-4">Please Sign In</h1>
        <p className="text-gray-500 mb-6">You need to be logged in to checkout.</p>
        <Link
          to="/account"
          className="bg-black text-white px-6 py-3 uppercase tracking-widest text-sm hover:bg-luxury-gold transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <SEO
          title="Checkout"
          description="Securely complete your purchase of authentic collectibles on The Collectors Exchange."
          canonical="/checkout"
          noindex
        />
        <Loader2 className="animate-spin text-luxury-gold mb-4" size={48} />
        <p className="text-gray-500 font-serif text-xl italic">Preparing Checkout...</p>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="container mx-auto py-20 px-6 text-center">
        <SEO
          title="Checkout"
          description="Securely complete your purchase of authentic collectibles on The Collectors Exchange."
          canonical="/checkout"
          noindex
        />
        <h1 className="text-2xl sm:text-4xl font-serif mb-4">Your cart is empty</h1>
        <Link
          to="/category"
          className="bg-black text-white px-6 py-3 uppercase tracking-widest text-sm hover:bg-luxury-gold transition-colors"
        >
          Explore The Exchange
        </Link>
      </div>
    );
  }

  // Order success screen
  if (orderSuccess) {
    return (
      <div className="container mx-auto py-12 px-6 max-w-lg text-center">
        <SEO
          title="Checkout"
          description="Securely complete your purchase of authentic collectibles on The Collectors Exchange."
          canonical="/checkout"
          noindex
        />
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 mb-12">
          {[
            { label: 'Cart', step: 1 },
            { label: 'Checkout', step: 2 },
            { label: 'Confirmation', step: 3 },
          ].map((item, i) => (
            <React.Fragment key={item.label}>
              {i > 0 && (
                <div className={`w-12 sm:w-20 h-px ${i <= 3 ? 'bg-luxury-gold' : 'bg-gray-200'}`} />
              )}
              <div
                className={`flex flex-col items-center gap-1.5 ${i <= 3 ? 'text-luxury-gold' : 'text-gray-300'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300 ${
                    i < 3
                      ? 'bg-luxury-gold border-luxury-gold text-white'
                      : i === 3
                        ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold'
                        : 'border-gray-200 text-gray-300'
                  }`}
                >
                  {i < 3 ? '\u2713' : item.step}
                </div>
                <span className="text-[10px] uppercase tracking-widest font-medium">
                  {item.label}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="bg-white border border-gray-100 shadow-heritage p-6 sm:p-12">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
          <h1 className="text-2xl sm:text-4xl font-serif mb-3 text-heritage-charcoal">
            Order Confirmed
          </h1>
          <p className="text-gray-500 mb-6">
            {orderSuccess.paymentMethod === 'cod'
              ? 'Your order has been placed. Keep cash ready for delivery.'
              : 'Your acquisition is being processed. You will receive a confirmation shortly.'}
          </p>
          <div className="bg-gray-50 border border-gray-100 p-4 mb-8 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 uppercase tracking-widest text-xs">Order ID</span>
              <span className="font-mono text-xs text-gray-700">
                {orderSuccess.displayId || orderSuccess.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 uppercase tracking-widest text-xs">Payment</span>
              <span className="font-medium">
                {orderSuccess.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 uppercase tracking-widest text-xs">Status</span>
              <span className="font-medium text-green-600">{orderSuccess.status}</span>
            </div>

            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-700 uppercase tracking-widest text-xs font-bold">
                Total Paid
              </span>
              <span className="font-semibold">
                ₹{orderSuccess.totalAmount?.toLocaleString('en-IN')}
              </span>
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
    <div className="container mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <SEO
        title="Checkout"
        description="Securely complete your purchase of authentic vintage watches and collectibles on The Collectors Exchange."
        canonical="/checkout"
        noindex
      />
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-0 mb-8 sm:mb-12">
        {[
          { label: 'Cart', href: '/cart', step: 1 },
          { label: 'Checkout', step: 2 },
          { label: 'Confirmation', step: 3 },
        ].map((item, i) => (
          <React.Fragment key={item.label}>
            {i > 0 && (
              <div
                className={`w-12 sm:w-20 h-px ${i <= 2 ? 'bg-luxury-gold/50' : 'bg-gray-200'}`}
              />
            )}
            {item.href ? (
              <Link
                to={item.href}
                className={`flex flex-col items-center gap-1.5 ${i <= 2 ? 'text-luxury-gold' : 'text-gray-300'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300 ${
                    i <= 2
                      ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold'
                      : 'border-gray-200 text-gray-300'
                  }`}
                >
                  {item.step}
                </div>
                <span className="text-[10px] uppercase tracking-widest font-medium">
                  {item.label}
                </span>
              </Link>
            ) : (
              <div
                className={`flex flex-col items-center gap-1.5 ${i <= 2 ? 'text-luxury-gold' : 'text-gray-300'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300 ${
                    i <= 2
                      ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold'
                      : 'border-gray-200 text-gray-300'
                  }`}
                >
                  {item.step}
                </div>
                <span className="text-[10px] uppercase tracking-widest font-medium">
                  {item.label}
                </span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif mb-10 text-heritage-charcoal">
        Secure Checkout
      </h1>

      <form onSubmit={handlePlaceOrder}>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Shipping Form */}
          <div className="w-full lg:w-3/5 space-y-6">
            <Reveal as="div" direction="left">
              <div className="bg-white border border-gray-100 shadow-sm p-5 sm:p-8">
                <h2 className="text-lg sm:text-2xl font-serif font-bold text-heritage-charcoal mb-6">
                  Shipping Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="recipientName"
                      className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
                    >
                      Recipient Name
                    </label>
                    <input
                      id="recipientName"
                      type="text"
                      value={form.recipientName}
                      onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                      placeholder="Full name"
                      className={`w-full p-4 bg-gray-50 border focus:outline-none focus:border-luxury-gold transition-colors ${errors.recipientName ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.recipientName && (
                      <p className="text-red-500 text-xs mt-1">{errors.recipientName}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="shippingAddress"
                      className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
                    >
                      Street Address
                    </label>
                    <input
                      id="shippingAddress"
                      type="text"
                      value={form.shippingAddress}
                      onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                      placeholder="House / Flat No., Street, Area"
                      className={`w-full p-4 bg-gray-50 border focus:outline-none focus:border-luxury-gold transition-colors ${errors.shippingAddress ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.shippingAddress && (
                      <p className="text-red-500 text-xs mt-1">{errors.shippingAddress}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
                      >
                        City
                      </label>
                      <input
                        id="city"
                        type="text"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder="Mumbai"
                        className={`w-full p-4 bg-gray-50 border focus:outline-none focus:border-luxury-gold transition-colors ${errors.city ? 'border-red-400' : 'border-gray-200'}`}
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label
                        htmlFor="state"
                        className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
                      >
                        State
                      </label>
                      <input
                        id="state"
                        type="text"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        placeholder="Maharashtra"
                        className={`w-full p-4 bg-gray-50 border focus:outline-none focus:border-luxury-gold transition-colors ${errors.state ? 'border-red-400' : 'border-gray-200'}`}
                      />
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="zipCode"
                        className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
                      >
                        PIN Code
                      </label>
                      <input
                        id="zipCode"
                        type="text"
                        value={form.zipCode}
                        onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                        placeholder="400001"
                        className={`w-full p-4 bg-gray-50 border focus:outline-none focus:border-luxury-gold transition-colors ${errors.zipCode ? 'border-red-400' : 'border-gray-200'}`}
                      />
                      {errors.zipCode && (
                        <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="country"
                        className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
                      >
                        Country
                      </label>
                      <input
                        id="country"
                        type="text"
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        placeholder="India"
                        className={`w-full p-4 bg-gray-50 border focus:outline-none focus:border-luxury-gold transition-colors ${errors.country ? 'border-red-400' : 'border-gray-200'}`}
                      />
                      {errors.country && (
                        <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
                      >
                        Phone
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="9876543210"
                        className={`w-full p-4 bg-gray-50 border focus:outline-none focus:border-luxury-gold transition-colors ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Payment Method */}
            <Reveal as="div" direction="left" delay={120}>
              <div className="bg-white border border-gray-100 shadow-sm p-5 sm:p-8">
                <h2 className="text-lg sm:text-2xl font-serif font-bold text-heritage-charcoal mb-6">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-luxury-gold bg-luxury-gold/5' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="w-4 h-4 text-luxury-gold focus:ring-luxury-gold"
                    />
                    <div>
                      <p className="font-medium text-heritage-charcoal">Online Payment</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        UPI, Credit/Debit Card, Net Banking via Razorpay
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-luxury-gold bg-luxury-gold/5' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 text-luxury-gold focus:ring-luxury-gold"
                    />
                    <div>
                      <p className="font-medium text-heritage-charcoal">Cash on Delivery</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Pay when your order arrives at your doorstep
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </Reveal>

            {/* Trust Badges */}
            <Reveal
              as="div"
              direction="up"
              delay={220}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {[
                { icon: ShieldCheck, label: 'Secure Payment', sub: 'Online & COD available' },
                { icon: ShieldCheck, label: 'Authenticity', sub: 'Expert verified' },
                { icon: ShieldCheck, label: 'Insured Shipping', sub: 'Full coverage' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-white border border-gray-100 p-4 text-center">
                  <Icon size={20} className="mx-auto text-luxury-gold mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-700">
                    {label}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{sub}</p>
                </div>
              ))}
            </Reveal>
          </div>

          {/* Order Summary */}
          <Reveal as="div" direction="right" className="w-full lg:w-2/5">
            <div className="bg-white border border-gray-100 shadow-sm p-5 sm:p-8 lg:sticky lg:top-24">
              <h2 className="text-lg sm:text-2xl font-serif font-bold text-heritage-charcoal mb-6">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <img
                      src={
                        item.product?.image ||
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Crect width='56' height='56' fill='%23f5f0e8'/%3E%3C/svg%3E"
                      }
                      alt={item.product?.title}
                      width="56"
                      height="56"
                      loading="lazy"
                      className="w-14 h-14 object-cover border border-gray-100 shrink-0"
                    />
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-serif font-medium truncate">
                        {item.product?.title}
                      </p>
                      <p className="text-xs text-gray-500">{item.product?.condition}</p>
                    </div>
                    <p className="text-sm font-semibold whitespace-nowrap">
                      ₹{item.product?.price?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon Code */}
              <div className="border-t border-gray-100 pt-4 mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3">
                    <div className="flex items-center gap-2">
                      <Percent size={14} className="text-green-600" />
                      <div>
                        <p className="text-xs font-semibold text-green-700">{couponCode}</p>
                        <p className="text-[10px] text-green-600">
                          {appliedCoupon.discountPercent}% off applied
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode('');
                        setCouponInput('');
                      }}
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && couponInput.trim())
                          document.getElementById('apply-coupon-btn').click();
                      }}
                      placeholder="Enter coupon code"
                      className="flex-grow p-3 bg-gray-50 border border-gray-200 text-xs uppercase tracking-widest focus:outline-none focus:border-luxury-gold transition-colors"
                    />
                    <button
                      id="apply-coupon-btn"
                      type="button"
                      disabled={!couponInput.trim() || validateCouponMutation.isPending}
                      onClick={async () => {
                        try {
                          const items = cartItems
                            .map((item) => ({
                              productId: item.productId,
                              price: item.product?.price,
                              quantity: 1,
                            }))
                            .filter((i) => i.price > 0);
                          if (items.length === 0) {
                            showToast('Cart is empty or invalid', 'error');
                            return;
                          }
                          const result = await validateCouponMutation.mutateAsync({
                            code: couponInput.trim(),
                            items,
                          });
                          if (result.valid) {
                            setCouponCode(couponInput.trim());
                            setAppliedCoupon({
                              discountPercent: result.discountPercent,
                              discountAmount: result.discountAmount,
                            });
                          }
                        } catch (err) {
                          showToast(err?.response?.data?.error || 'Invalid coupon code', 'error');
                        }
                      }}
                      className="bg-black text-white px-4 text-[10px] uppercase tracking-widest hover:bg-luxury-gold transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {validateCouponMutation.isPending ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon?.discountPercent}% off)</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100 font-serif font-bold text-lg mt-4 mb-1">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-gray-400 text-right mb-8">* Inclusive of all taxes</p>

              {razorpayError && paymentMethod === 'online' && (
                <p className="text-xs text-red-600 text-center mb-2">
                  Payment gateway failed to load. Please disable ad blockers and refresh.
                </p>
              )}
              <Magnetic className="block w-full">
                <button
                  type="submit"
                  disabled={createOrderMutation.isPending || verifyPaymentMutation.isPending}
                  className="w-full bg-black text-white py-5 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors duration-300 flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  {createOrderMutation.isPending || verifyPaymentMutation.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : paymentMethod === 'cod' ? (
                    <>
                      <ShieldCheck size={18} />
                      Place Order (Cash on Delivery)
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Place Order & Pay
                    </>
                  )}
                </button>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
