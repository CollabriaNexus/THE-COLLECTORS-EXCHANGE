import { describe, it, expect } from 'vitest';
import {
  CreateOrderItemSchema,
  CreateOrderSchema,
  VerifyPaymentSchema,
} from '../../schemas/checkout.js';

describe('CreateOrderItemSchema', () => {
  it('passes with valid data', () => {
    expect(() => CreateOrderItemSchema.parse({ productId: 'prod-1' })).not.toThrow();
  });

  it('passes with quantity of 1', () => {
    expect(() => CreateOrderItemSchema.parse({ productId: 'prod-1', quantity: 1 })).not.toThrow();
  });

  it('rejects quantity greater than 1 (items are one-of-a-kind)', () => {
    expect(() => CreateOrderItemSchema.parse({ productId: 'prod-1', quantity: 2 })).toThrow();
  });

  it('fails without productId', () => {
    expect(() => CreateOrderItemSchema.parse({})).toThrow();
  });

  it('fails with empty productId', () => {
    expect(() => CreateOrderItemSchema.parse({ productId: '' })).toThrow();
  });

  it('fails with negative quantity', () => {
    expect(() => CreateOrderItemSchema.parse({ productId: 'p1', quantity: -1 })).toThrow();
  });

  it('fails with non-integer quantity', () => {
    expect(() => CreateOrderItemSchema.parse({ productId: 'p1', quantity: 1.5 })).toThrow();
  });

  it('defaults quantity to 1', () => {
    const result = CreateOrderItemSchema.parse({ productId: 'p1' });
    expect(result.quantity).toBe(1);
  });
});

describe('CreateOrderSchema', () => {
  const valid = {
    shippingAddress: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    phone: '9876543210',
    items: [{ productId: 'prod-1' }],
  };

  it('passes with valid data', () => {
    expect(() => CreateOrderSchema.parse(valid)).not.toThrow();
  });

  it('fails without shippingAddress', () => {
    const { shippingAddress: _omit, ...rest } = valid;
    expect(() => CreateOrderSchema.parse(rest)).toThrow();
  });

  it('fails with empty shippingAddress', () => {
    expect(() => CreateOrderSchema.parse({ ...valid, shippingAddress: '' })).toThrow();
  });

  it('fails without city', () => {
    const { city: _omit, ...rest } = valid;
    expect(() => CreateOrderSchema.parse(rest)).toThrow();
  });

  it('fails without state', () => {
    const { state: _omit, ...rest } = valid;
    expect(() => CreateOrderSchema.parse(rest)).toThrow();
  });

  it('fails without zipCode', () => {
    const { zipCode: _omit, ...rest } = valid;
    expect(() => CreateOrderSchema.parse(rest)).toThrow();
  });

  it('fails with short phone', () => {
    expect(() => CreateOrderSchema.parse({ ...valid, phone: '12345' })).toThrow();
  });

  it('fails with empty items array', () => {
    expect(() => CreateOrderSchema.parse({ ...valid, items: [] })).toThrow();
  });

  it('fails without items', () => {
    const { items: _omit, ...rest } = valid;
    expect(() => CreateOrderSchema.parse(rest)).toThrow();
  });
});

describe('VerifyPaymentSchema', () => {
  it('passes with required orderId only', () => {
    expect(() => VerifyPaymentSchema.parse({ orderId: 'order-1' })).not.toThrow();
  });

  it('passes with all fields', () => {
    expect(() =>
      VerifyPaymentSchema.parse({
        orderId: 'order-1',
        razorpayOrderId: 'rp_order_1',
        razorpayPaymentId: 'pay_1',
        razorpaySignature: 'sig_1',
      }),
    ).not.toThrow();
  });

  it('fails without orderId', () => {
    expect(() => VerifyPaymentSchema.parse({})).toThrow();
  });

  it('fails with empty orderId', () => {
    expect(() => VerifyPaymentSchema.parse({ orderId: '' })).toThrow();
  });
});
