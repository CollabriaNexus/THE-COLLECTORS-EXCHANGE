import { describe, it, expect } from 'vitest';
import { ProductSchema, ProductIdParam, AdminProductUpdateSchema, CATEGORIES } from '../../schemas/product.js';

describe('CATEGORIES', () => {
  it('contains expected categories', () => {
    expect(CATEGORIES).toContain('Timepieces');
    expect(CATEGORIES).toContain('Jewelry');
  });
});

describe('ProductSchema', () => {
  const valid = {
    title: 'Vintage Watch',
    category: 'Timepieces',
    description: 'A beautiful vintage watch',
    condition: 'Excellent',
    price: 15000,
    image: 'https://example.com/watch.jpg',
    sellerId: 'seller-123',
  };

  it('passes with valid minimal data', () => {
    expect(() => ProductSchema.parse(valid)).not.toThrow();
  });

  it('passes with all optional fields', () => {
    const data = { ...valid, id: 'prod-1', images: ['https://example.com/img2.jpg'], keywords: ['vintage', 'watch'], isVerified: true, authenticityStatus: 'Verified' };
    expect(() => ProductSchema.parse(data)).not.toThrow();
  });

  it('fails with empty title', () => {
    expect(() => ProductSchema.parse({ ...valid, title: '' })).toThrow();
  });

  it('fails with missing title', () => {
    const { title, ...rest } = valid;
    expect(() => ProductSchema.parse(rest)).toThrow();
  });

  it('fails with invalid category', () => {
    expect(() => ProductSchema.parse({ ...valid, category: 'InvalidCategory' })).toThrow();
  });

  it('fails with empty description', () => {
    expect(() => ProductSchema.parse({ ...valid, description: '' })).toThrow();
  });

  it('fails with empty condition', () => {
    expect(() => ProductSchema.parse({ ...valid, condition: '' })).toThrow();
  });

  it('fails with negative price', () => {
    expect(() => ProductSchema.parse({ ...valid, price: -100 })).toThrow();
  });

  it('fails with zero price', () => {
    expect(() => ProductSchema.parse({ ...valid, price: 0 })).toThrow();
  });

  it('fails with invalid image URL', () => {
    expect(() => ProductSchema.parse({ ...valid, image: 'not-a-url' })).toThrow();
  });

  it('fails with invalid image in images array', () => {
    expect(() => ProductSchema.parse({ ...valid, images: ['not-a-url'] })).toThrow();
  });

  it('fails without sellerId', () => {
    const { sellerId, ...rest } = valid;
    expect(() => ProductSchema.parse(rest)).toThrow();
  });

  // ---- commissionPercent ----

  it('defaults commissionPercent to 10 when not provided', () => {
    const result = ProductSchema.parse(valid);
    expect(result.commissionPercent).toBe(10);
  });

  it('passes with commissionPercent = 10 (minimum)', () => {
    expect(() => ProductSchema.parse({ ...valid, commissionPercent: 10 })).not.toThrow();
  });

  it('passes with commissionPercent = 25 (maximum)', () => {
    expect(() => ProductSchema.parse({ ...valid, commissionPercent: 25 })).not.toThrow();
  });

  it('passes with commissionPercent = 18 (mid-range)', () => {
    expect(() => ProductSchema.parse({ ...valid, commissionPercent: 18 })).not.toThrow();
  });

  it('fails with commissionPercent below 10', () => {
    expect(() => ProductSchema.parse({ ...valid, commissionPercent: 5 })).toThrow();
  });

  it('fails with commissionPercent above 25', () => {
    expect(() => ProductSchema.parse({ ...valid, commissionPercent: 30 })).toThrow();
  });

  it('fails with commissionPercent as non-integer string', () => {
    expect(() => ProductSchema.parse({ ...valid, commissionPercent: '20' })).toThrow();
  });
});

describe('AdminProductUpdateSchema — commissionPercent', () => {
  it('passes with commissionPercent = 10', () => {
    expect(() => AdminProductUpdateSchema.parse({ commissionPercent: 10 })).not.toThrow();
  });

  it('passes with commissionPercent = 25', () => {
    expect(() => AdminProductUpdateSchema.parse({ commissionPercent: 25 })).not.toThrow();
  });

  it('fails with commissionPercent = 9', () => {
    expect(() => AdminProductUpdateSchema.parse({ commissionPercent: 9 })).toThrow();
  });

  it('fails with commissionPercent = 26', () => {
    expect(() => AdminProductUpdateSchema.parse({ commissionPercent: 26 })).toThrow();
  });
});

describe('ProductIdParam', () => {
  it('passes with valid id', () => {
    expect(() => ProductIdParam.parse({ id: 'abc123' })).not.toThrow();
  });

  it('fails without id', () => {
    expect(() => ProductIdParam.parse({})).toThrow();
  });
});

describe('AdminProductUpdateSchema', () => {
  it('passes with empty object (all optional)', () => {
    expect(() => AdminProductUpdateSchema.parse({})).not.toThrow();
  });

  it('passes with valid fields', () => {
    const data = { brand: 'Rolex', category: 'Timepieces', title: 'Updated', description: 'Desc', price: 100, condition: 'Mint', image: 'https://img.jpg', images: ['https://img2.jpg'], keywords: ['luxury'], listingCategory: 'featured' };
    expect(() => AdminProductUpdateSchema.parse(data)).not.toThrow();
  });

  it('fails with invalid category', () => {
    expect(() => AdminProductUpdateSchema.parse({ category: 'Invalid' })).toThrow();
  });

  it('fails with empty title (min 1)', () => {
    expect(() => AdminProductUpdateSchema.parse({ title: '' })).toThrow();
  });

  it('fails with non-positive price', () => {
    expect(() => AdminProductUpdateSchema.parse({ price: 0 })).toThrow();
  });

  it('fails with empty condition', () => {
    expect(() => AdminProductUpdateSchema.parse({ condition: '' })).toThrow();
  });
});
