import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ShieldCheck, Loader2, Check, Percent, X, MapPin, Package, Truck } from 'lucide-react';
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
  // The cart is invalidated the moment payment verifies, and the verify-payment
  // response returns order items without their product relation. Snapshot the
  // products at purchase time so the confirmation can still show what was bought.
  const [purchasedItems, setPurchasedItems] = useState([]);
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

    // Captured before the cart query is invalidated by verification.
    const productSnapshot = cartItems.map((item) => ({
      productId: item.productId,
      product: item.product,
    }));
    const finalizeSuccess = (verifyData) => {
      setPurchasedItems(productSnapshot);
      setOrderSuccess(verifyData.order);
    };

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
        finalizeSuccess(verifyData);
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
        finalizeSuccess(verifyData);
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
            finalizeSuccess(verifyData);
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

  // Order success screen. Also covers a duplicate verify (the backend echoes the
  // already-finalized order back with the same shape) — still a success for the buyer.
  if (orderSuccess) {
    const isCODOrder = orderSuccess.paymentMethod === 'cod';
    // verify-payment returns order items without their product relation, so join
    // each priced line back onto the snapshot taken at purchase time.
    const confirmedItems = (orderSuccess.items || []).map((item) => ({
      ...item,
      product: purchasedItems.find((p) => p.productId === item.productId)?.product,
    }));
    const orderedOn = orderSuccess.createdAt
      ? new Date(orderSuccess.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : null;
    const orderDiscount = orderSuccess.discountAmount || 0;
    const orderSubtotal =
      orderSuccess.subtotalBeforeDiscount || (orderSuccess.totalAmount || 0) + orderDiscount;

    return (
      <div className="container mx-auto py-8 sm:py-12 px-4 sm:px-6 max-w-3xl">
        <SEO
          title="Order Confirmed"
          description="Your order on The Collectors Exchange has been confirmed."
          canonical="/checkout"
          noindex
        />
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 mb-10 sm:mb-14">
          {['Cart', 'Checkout', 'Confirmation'].map((label, i) => (
            <React.Fragment key={label}>
              {i > 0 && <div className="w-12 sm:w-20 h-px bg-luxury-gold" />}
              <div className="flex flex-col items-center gap-1.5 text-luxury-gold">
                <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 bg-luxury-gold border-luxury-gold text-white">
                  <Check size={14} strokeWidth={3} aria-hidden="true" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-medium">{label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
        {/* Masthead */}
        <Reveal as="header" direction="up" className="text-center mb-8 sm:mb-10">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-luxury-gold mb-3">
            {isCODOrder ? 'Order Placed' : 'Payment Received'}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-heritage-charcoal mb-4">
            Order Confirmed
          </h1>
          <div className="w-16 h-px bg-luxury-gold mx-auto mb-5" aria-hidden="true" />
          <p className="text-sm sm:text-base text-gray-600 font-serif leading-relaxed max-w-lg mx-auto">
            {isCODOrder
              ? 'Your order is placed and now being prepared. Payment will be collected in cash when it arrives.'
              : 'Your payment has been verified and your acquisition is now being prepared for dispatch.'}
          </p>
        </Reveal>

        {/* Order reference */}
        <Reveal
          as="section"
          direction="up"
          delay={60}
          aria-labelledby="order-reference-heading"
          className="bg-heritage-cream border border-luxury-gold/20 p-5 sm:p-6 mb-6 sm:mb-8 text-center"
        >
          <h2
            id="order-reference-heading"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-heritage-bronze mb-2"
          >
            Your Order Reference
          </h2>
          <p className="font-mono text-xl sm:text-2xl font-semibold text-heritage-charcoal tracking-wider break-all">
            {orderSuccess.displayId || orderSuccess.id}
          </p>
          {orderedOn && (
            <p className="text-xs text-gray-500 mt-2">
              Placed on {orderedOn} &middot; Quote this reference in any correspondence
            </p>
          )}
        </Reveal>

        {/* What was acquired */}
        {confirmedItems.length > 0 && (
          <Reveal
            as="section"
            direction="up"
            delay={100}
            aria-labelledby="acquisition-heading"
            className="bg-white border border-gray-100 shadow-heritage p-5 sm:p-8 mb-6 sm:mb-8"
          >
            <h2
              id="acquisition-heading"
              className="flex items-center gap-2.5 text-lg sm:text-2xl font-serif font-bold text-heritage-charcoal mb-5 sm:mb-6"
            >
              <Package size={18} className="text-luxury-gold shrink-0" aria-hidden="true" />
              Your Acquisition
            </h2>

            <ul className="divide-y divide-gray-100">
              {confirmedItems.map((item) => (
                <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <img
                    src={
                      item.product?.image ||
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23f5f0e8'/%3E%3C/svg%3E"
                    }
                    alt={item.product?.title ? `${item.product.title}` : 'Item from your order'}
                    width="80"
                    height="80"
                    loading="lazy"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover border border-gray-100 shrink-0"
                  />
                  <div className="flex-grow min-w-0">
                    {item.product?.brand && (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-heritage-bronze mb-1">
                        {item.product.brand}
                      </p>
                    )}
                    <p className="font-serif text-sm sm:text-base font-medium text-heritage-charcoal leading-snug">
                      {item.product?.title || 'Item from your order'}
                    </p>
                    {item.product?.condition && (
                      <p className="text-xs text-gray-500 mt-1">{item.product.condition}</p>
                    )}
                    <p className="text-sm font-semibold text-heritage-charcoal mt-2 sm:hidden">
                      ₹{item.price?.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <p className="hidden sm:block text-sm font-semibold text-heritage-charcoal whitespace-nowrap">
                    ₹{item.price?.toLocaleString('en-IN')}
                  </p>
                </li>
              ))}
            </ul>

            {/* Payment breakdown */}
            <dl className="border-t border-gray-100 mt-5 pt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4 text-gray-600">
                <dt>Subtotal</dt>
                <dd>₹{orderSubtotal.toLocaleString('en-IN')}</dd>
              </div>
              {orderDiscount > 0 && (
                <div className="flex justify-between gap-4 text-green-700">
                  <dt className="flex items-center gap-1.5">
                    <Percent size={13} aria-hidden="true" />
                    Discount
                    {orderSuccess.discountPercent ? ` (${orderSuccess.discountPercent}% off)` : ''}
                  </dt>
                  <dd>-₹{orderDiscount.toLocaleString('en-IN')}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 text-gray-600">
                <dt>Shipping</dt>
                <dd className="text-green-700">Free</dd>
              </div>
              <div className="flex justify-between gap-4 text-gray-600">
                <dt>Payment Method</dt>
                <dd className="font-medium text-heritage-charcoal text-right">
                  {isCODOrder ? 'Cash on Delivery' : 'Online Payment'}
                </dd>
              </div>
              <div className="flex justify-between gap-4 items-baseline border-t border-gray-100 pt-4 font-serif font-bold text-base sm:text-lg text-heritage-charcoal">
                <dt>{isCODOrder ? 'Due on Delivery' : 'Amount Paid'}</dt>
                <dd>₹{orderSuccess.totalAmount?.toLocaleString('en-IN')}</dd>
              </div>
            </dl>
            <p className="text-[10px] text-gray-400 text-right mt-1">* Inclusive of all taxes</p>
          </Reveal>
        )}

        {/* Delivery details */}
        <Reveal
          as="section"
          direction="up"
          delay={140}
          aria-labelledby="delivery-heading"
          className="bg-white border border-gray-100 shadow-heritage p-5 sm:p-8 mb-6 sm:mb-8"
        >
          <h2
            id="delivery-heading"
            className="flex items-center gap-2.5 text-lg sm:text-2xl font-serif font-bold text-heritage-charcoal mb-5"
          >
            <MapPin size={18} className="text-luxury-gold shrink-0" aria-hidden="true" />
            Delivering To
          </h2>
          <address className="not-italic text-sm text-gray-700 leading-relaxed">
            {form.recipientName && (
              <span className="block font-medium text-heritage-charcoal">{form.recipientName}</span>
            )}
            <span className="block">{orderSuccess.shippingAddress}</span>
            <span className="block">
              {orderSuccess.city}, {orderSuccess.state} {orderSuccess.zipCode}
            </span>
            {orderSuccess.phone && (
              <span className="block mt-2 text-gray-500">
                <span className="text-[10px] font-bold uppercase tracking-widest">Phone</span>{' '}
                {orderSuccess.phone}
              </span>
            )}
          </address>
        </Reveal>

        {/* What happens next — timelines mirror the stated Returns & Shipping policy */}
        <Reveal
          as="section"
          direction="up"
          delay={180}
          aria-labelledby="next-heading"
          className="bg-white border border-gray-100 shadow-heritage p-5 sm:p-8 mb-6 sm:mb-8"
        >
          <h2
            id="next-heading"
            className="flex items-center gap-2.5 text-lg sm:text-2xl font-serif font-bold text-heritage-charcoal mb-6"
          >
            <Truck size={18} className="text-luxury-gold shrink-0" aria-hidden="true" />
            What Happens Next
          </h2>
          <ol className="space-y-6">
            {[
              {
                title: 'Processing & Packaging',
                body: isCODOrder
                  ? 'Orders are processed within 2-5 business days. High-value or fragile items may require additional packaging time.'
                  : 'Orders are processed within 2-5 business days after payment confirmation. High-value or fragile items may require additional packaging time.',
              },
              {
                title: 'Dispatch & Tracking',
                body: 'A tracking ID is provided once the order is shipped. You can monitor your delivery status from your account dashboard under "My Orders".',
              },
              {
                title: 'Delivery & Inspection',
                body: isCODOrder
                  ? 'Domestic deliveries typically arrive within 5-10 business days, so keep cash ready for the courier. You then have a 48-hour inspection period from delivery.'
                  : 'Domestic deliveries typically arrive within 5-10 business days. You then have a 48-hour inspection period from delivery.',
              },
            ].map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span
                  className="shrink-0 w-7 h-7 rounded-full border border-luxury-gold/40 bg-luxury-gold/5 text-luxury-gold flex items-center justify-center text-xs font-bold"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="font-serif text-sm sm:text-base font-medium text-heritage-charcoal mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="flex items-start gap-2.5 border-t border-gray-100 mt-6 pt-5 text-xs text-gray-500 leading-relaxed">
            <ShieldCheck
              size={14}
              className="text-luxury-gold shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span>
              All shipments are insured against loss or damage during transit. Read the full{' '}
              <Link to="/returns" className="text-luxury-gold hover:underline">
                returns, refunds &amp; shipping policy
              </Link>
              .
            </span>
          </p>
        </Reveal>

        {/* Onward routes */}
        <Reveal as="div" direction="up" delay={220} className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/account?tab=orders"
            className="flex-1 bg-black text-white px-6 py-4 text-sm uppercase tracking-widest text-center hover:bg-luxury-gold transition-colors"
          >
            View My Orders
          </Link>
          <Link
            to="/category"
            className="flex-1 border border-heritage-charcoal text-heritage-charcoal px-6 py-4 text-sm uppercase tracking-widest text-center hover:bg-heritage-charcoal hover:text-white transition-colors"
          >
            Continue Browsing
          </Link>
        </Reveal>

        <p className="text-center text-xs text-gray-500 mt-8">
          Questions about this order?{' '}
          <a
            href="mailto:support@thecollectorsexchange.in"
            className="text-luxury-gold hover:underline"
          >
            support@thecollectorsexchange.in
          </a>
        </p>
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
