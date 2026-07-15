import React, { useState } from 'react';
import Modal from './ui/Modal';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card (In-Store)' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Chandigarh',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
  'Lakshadweep',
  'Andaman and Nicobar Islands',
  'Dadra and Nagar Haveli and Daman and Diu',
];

function ManualOrderModal({ isOpen, onClose, product, isBackfill, onSubmit, isPending }) {
  const [form, setForm] = useState({
    sellingPrice: product?.price || 0,
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    shippingAddress: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'cash',
    notes: '',
    soldAt: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.sellingPrice || form.sellingPrice <= 0) errs.sellingPrice = 'Price must be positive';
    if (!form.buyerName.trim()) errs.buyerName = 'Buyer name is required';
    if (!form.buyerPhone.trim()) errs.buyerPhone = 'Buyer phone is required';
    if (!form.shippingAddress.trim()) errs.shippingAddress = 'Address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state.trim()) errs.state = 'State is required';
    if (!form.zipCode.trim()) errs.zipCode = 'Zip code is required';
    if (form.buyerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.buyerEmail)) {
      errs.buyerEmail = 'Invalid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      productId: product.id,
      sellingPrice: Number(form.sellingPrice),
      buyerName: form.buyerName.trim(),
      buyerPhone: form.buyerPhone.trim(),
      buyerEmail: form.buyerEmail.trim() || undefined,
      shippingAddress: form.shippingAddress.trim(),
      city: form.city.trim(),
      state: form.state,
      zipCode: form.zipCode.trim(),
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim() || undefined,
      soldAt: form.soldAt || undefined,
    });
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-colors ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isBackfill ? 'Create Order Record (Backfill)' : 'Punch Manual Order'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Info */}
        <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
          {product?.image && (
            <img
              src={product.image}
              alt={product.title}
              className="w-16 h-16 object-cover rounded border border-gray-200"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-heritage-charcoal truncate">{product?.title}</p>
            <p className="text-sm text-gray-500">
              Listed Price:{' '}
              <span className="font-medium text-heritage-charcoal">
                ₹{product?.price?.toLocaleString()}
              </span>
              {product?.commissionPercent ? (
                <span className="ml-2 text-xs text-gray-400">
                  ({product.commissionPercent}% commission)
                </span>
              ) : null}
            </p>
          </div>
        </div>

        {/* Selling Price */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Selling Price (₹) *
          </label>
          <input
            type="number"
            value={form.sellingPrice}
            onChange={(e) => handleChange('sellingPrice', e.target.value)}
            className={inputClass('sellingPrice')}
            min="1"
            step="0.01"
          />
          {errors.sellingPrice && (
            <p className="text-xs text-red-500 mt-1">{errors.sellingPrice}</p>
          )}
        </div>

        {/* Buyer Info */}
        <div className="border-t pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Buyer Information
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Name *</label>
              <input
                type="text"
                value={form.buyerName}
                onChange={(e) => handleChange('buyerName', e.target.value)}
                placeholder="Full name"
                className={inputClass('buyerName')}
              />
              {errors.buyerName && <p className="text-xs text-red-500 mt-1">{errors.buyerName}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Phone *</label>
              <input
                type="tel"
                value={form.buyerPhone}
                onChange={(e) => handleChange('buyerPhone', e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className={inputClass('buyerPhone')}
              />
              {errors.buyerPhone && (
                <p className="text-xs text-red-500 mt-1">{errors.buyerPhone}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                value={form.buyerEmail}
                onChange={(e) => handleChange('buyerEmail', e.target.value)}
                placeholder="buyer@example.com"
                className={inputClass('buyerEmail')}
              />
              {errors.buyerEmail && (
                <p className="text-xs text-red-500 mt-1">{errors.buyerEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="border-t pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Address
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Address *</label>
              <input
                type="text"
                value={form.shippingAddress}
                onChange={(e) => handleChange('shippingAddress', e.target.value)}
                placeholder="Street address (or 'Walk-in / In-store')"
                className={inputClass('shippingAddress')}
              />
              {errors.shippingAddress && (
                <p className="text-xs text-red-500 mt-1">{errors.shippingAddress}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">City *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="City"
                  className={inputClass('city')}
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">State *</label>
                <select
                  value={form.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className={inputClass('state')}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Zip Code *</label>
                <input
                  type="text"
                  value={form.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                  placeholder="XXXXXX"
                  className={inputClass('zipCode')}
                />
                {errors.zipCode && <p className="text-xs text-red-500 mt-1">{errors.zipCode}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Date */}
        <div className="border-t pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Payment &amp; Details
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => handleChange('paymentMethod', e.target.value)}
                className={inputClass('paymentMethod')}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            {isBackfill && (
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Actual Sale Date
                </label>
                <input
                  type="datetime-local"
                  value={form.soldAt}
                  onChange={(e) => handleChange('soldAt', e.target.value)}
                  className={inputClass('soldAt')}
                />
              </div>
            )}
          </div>
          <div className="mt-4">
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Internal Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any internal notes about this sale..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-luxury-gold outline-none resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 bg-luxury-gold text-white rounded-md hover:bg-luxury-gold/90 disabled:opacity-50 font-medium transition-colors"
          >
            {isPending ? 'Creating...' : isBackfill ? 'Create Order Record' : 'Punch Order'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ManualOrderModal;
