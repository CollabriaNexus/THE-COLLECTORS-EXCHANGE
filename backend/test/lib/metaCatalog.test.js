import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('metaCatalog lib', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.META_CATALOG_ACCESS_TOKEN;
    delete process.env.AWS_LAMBDA_FUNCTION_NAME;
  });

  describe('mapCondition', () => {
    it.each(['Mint', 'Excellent', 'Very Good', 'Good', 'Fair', 'Poor', 'Unknown'])(
      'maps the pre-owned grade %s to used',
      async (condition) => {
        const { mapCondition } = await import('../../lib/metaCatalog.js');
        expect(mapCondition(condition)).toBe('used');
      },
    );

    it.each(['New', ' new ', 'NEW'])(
      'maps only an explicitly new condition (%s) to new',
      async (condition) => {
        const { mapCondition } = await import('../../lib/metaCatalog.js');
        expect(mapCondition(condition)).toBe('new');
      },
    );
  });

  describe('mapAvailability', () => {
    it('maps Sold products to mark_as_sold regardless of isPublished', async () => {
      const { mapAvailability } = await import('../../lib/metaCatalog.js');
      expect(mapAvailability({ status: 'Sold', isPublished: true })).toBe('mark_as_sold');
      expect(mapAvailability({ status: 'Sold', isPublished: false })).toBe('mark_as_sold');
    });

    it('maps Approved + published products to in stock', async () => {
      const { mapAvailability } = await import('../../lib/metaCatalog.js');
      expect(mapAvailability({ status: 'Approved', isPublished: true })).toBe('in stock');
    });

    it('maps everything else (rejected, unpublished, pending) to discontinued', async () => {
      const { mapAvailability } = await import('../../lib/metaCatalog.js');
      expect(mapAvailability({ status: 'Approved', isPublished: false })).toBe('discontinued');
      expect(mapAvailability({ status: 'Rejected', isPublished: false })).toBe('discontinued');
      expect(mapAvailability({ status: 'Pending', isPublished: false })).toBe('discontinued');
    });
  });

  describe('syncProductToMeta', () => {
    const product = {
      id: 'p1',
      title: 'Vintage Watch',
      description: 'Desc',
      price: 1000,
      image: 'https://img.jpg',
      condition: 'Excellent',
      status: 'Approved',
      isPublished: true,
    };

    it('upserts via retailer_id and omits a missing brand', async () => {
      process.env.META_CATALOG_ACCESS_TOKEN = 'test-token';
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ id: '999' }),
      });
      const { syncProductToMeta } = await import('../../lib/metaCatalog.js');

      const result = await syncProductToMeta(product, 'https://example.com');
      expect(result.id).toBe('999');

      const [url, request] = mockFetch.mock.calls[0];
      expect(url).toBe('https://graph.facebook.com/v26.0/1730162018100619/products');
      expect(request.headers.Authorization).toBe('Bearer test-token');
      const payload = JSON.parse(request.body);
      expect(payload.retailer_id).toBe('p1');
      expect(payload.url).toBe('https://example.com/product/p1/');
      expect(payload.availability).toBe('in stock');
      expect(payload.condition).toBe('used');
      expect(payload.price).toBe(100000);
      expect(payload.currency).toBe('INR');
      expect(payload).not.toHaveProperty('brand');
    });

    it('includes the actual brand when one is supplied', async () => {
      process.env.META_CATALOG_ACCESS_TOKEN = 'test-token';
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ id: '999' }),
      });
      const { syncProductToMeta } = await import('../../lib/metaCatalog.js');

      await syncProductToMeta({ ...product, brand: 'Rolex' }, 'https://example.com');

      const [, request] = mockFetch.mock.calls[0];
      expect(JSON.parse(request.body).brand).toBe('Rolex');
    });

    it('marks a sold product as mark_as_sold', async () => {
      process.env.META_CATALOG_ACCESS_TOKEN = 'test-token';
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ id: '999' }),
      });
      const { syncProductToMeta } = await import('../../lib/metaCatalog.js');

      await syncProductToMeta({ ...product, status: 'Sold' }, 'https://example.com');

      const [, request] = mockFetch.mock.calls[0];
      expect(JSON.parse(request.body).availability).toBe('mark_as_sold');
    });

    it('throws on API error', async () => {
      process.env.META_CATALOG_ACCESS_TOKEN = 'test-token';
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ error: { message: 'Bad request' } }),
      });
      const { syncProductToMeta } = await import('../../lib/metaCatalog.js');

      await expect(syncProductToMeta(product, 'https://example.com')).rejects.toThrow(
        'Bad request',
      );
    });

    it('throws when no access token is configured', async () => {
      const { syncProductToMeta } = await import('../../lib/metaCatalog.js');
      await expect(syncProductToMeta(product, 'https://example.com')).rejects.toThrow(
        'Meta Catalog access token not found.',
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('syncProductToMetaAsync', () => {
    it('never throws, even when the sync fails', async () => {
      const { syncProductToMetaAsync } = await import('../../lib/metaCatalog.js');
      expect(() =>
        syncProductToMetaAsync({ id: 'p1', title: 'X', price: 1, status: 'Approved' }),
      ).not.toThrow();
    });
  });
});
