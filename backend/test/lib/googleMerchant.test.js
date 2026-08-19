import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
}));

vi.mock('google-auth-library', () => {
  const mockGetClient = vi.fn();
  const MockGoogleAuth = vi.fn().mockImplementation(() => ({
    getClient: mockGetClient,
  }));
  return { GoogleAuth: MockGoogleAuth };
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('googleMerchant lib', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.GOOGLE_MERCHANT_KEY;
    delete process.env.GOOGLE_MERCHANT_KEY_PATH;
  });

  describe('api function', () => {
    it('makes successful API call', async () => {
      process.env.GOOGLE_MERCHANT_KEY = Buffer.from(
        JSON.stringify({ client_email: 'test@test.com', private_key: 'key' }),
      ).toString('base64');
      mockFetch.mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ success: true })),
      });
      const { GoogleAuth } = await import('google-auth-library');
      const mockClient = { getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }) };
      GoogleAuth.mockImplementation(() => ({ getClient: vi.fn().mockResolvedValue(mockClient) }));
      const mod = await import('../../lib/googleMerchant.js');
      const result = await mod.ensureDeveloperRegistration();
      expect(result.success).toBe(true);
    });

    it('throws on API error', async () => {
      process.env.GOOGLE_MERCHANT_KEY = Buffer.from(
        JSON.stringify({ client_email: 'test@test.com', private_key: 'key' }),
      ).toString('base64');
      const { GoogleAuth } = await import('google-auth-library');
      const mockClient = { getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }) };
      GoogleAuth.mockImplementation(() => ({ getClient: vi.fn().mockResolvedValue(mockClient) }));
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue(JSON.stringify({ error: { message: 'Bad request' } })),
      });
      const mod = await import('../../lib/googleMerchant.js');
      await expect(mod.ensureDeveloperRegistration()).rejects.toThrow('Merchant API 400');
    });
  });

  describe('findOrCreateDataSource', () => {
    it('returns existing data source', async () => {
      process.env.GOOGLE_MERCHANT_KEY = Buffer.from(
        JSON.stringify({ client_email: 'test@test.com', private_key: 'key' }),
      ).toString('base64');
      const { GoogleAuth } = await import('google-auth-library');
      const mockClient = { getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }) };
      GoogleAuth.mockImplementation(() => ({ getClient: vi.fn().mockResolvedValue(mockClient) }));
      mockFetch.mockResolvedValue({
        ok: true,
        text: vi
          .fn()
          .mockResolvedValue(
            JSON.stringify({ dataSources: [{ displayName: 'API Products', name: 'ds1' }] }),
          ),
      });
      const mod = await import('../../lib/googleMerchant.js');
      const result = await mod.findOrCreateDataSource();
      expect(result.name).toBe('ds1');
    });

    it('creates new data source when not found', async () => {
      process.env.GOOGLE_MERCHANT_KEY = Buffer.from(
        JSON.stringify({ client_email: 'test@test.com', private_key: 'key' }),
      ).toString('base64');
      const { GoogleAuth } = await import('google-auth-library');
      const mockClient = { getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }) };
      GoogleAuth.mockImplementation(() => ({ getClient: vi.fn().mockResolvedValue(mockClient) }));
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: true,
            text: vi.fn().mockResolvedValue(JSON.stringify({ dataSources: [] })),
          });
        }
        return Promise.resolve({
          ok: true,
          text: vi
            .fn()
            .mockResolvedValue(JSON.stringify({ displayName: 'API Products', name: 'ds-new' })),
        });
      });
      const mod = await import('../../lib/googleMerchant.js');
      const result = await mod.findOrCreateDataSource();
      expect(result.displayName).toBe('API Products');
    });
  });

  describe('insertProduct', () => {
    it('calls API with truthful product data and omits a missing brand', async () => {
      process.env.GOOGLE_MERCHANT_KEY = Buffer.from(
        JSON.stringify({ client_email: 'test@test.com', private_key: 'key' }),
      ).toString('base64');
      const { GoogleAuth } = await import('google-auth-library');
      const mockClient = { getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }) };
      GoogleAuth.mockImplementation(() => ({ getClient: vi.fn().mockResolvedValue(mockClient) }));
      mockFetch.mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ name: 'inserted' })),
      });
      const mod = await import('../../lib/googleMerchant.js');
      const product = {
        id: 'p1',
        title: 'Test',
        description: 'Desc',
        price: 100,
        image: 'https://img.jpg',
        condition: 'Mint',
        status: 'Approved',
        isPublished: true,
      };
      const result = await mod.insertProduct(product, 'ds1', 'https://example.com');
      expect(result.name).toBe('inserted');

      const [, request] = mockFetch.mock.calls[0];
      const payload = JSON.parse(request.body);
      expect(payload.productAttributes.link).toBe('https://example.com/product/p1/');
      expect(payload.productAttributes.condition).toBe('USED');
      expect(payload.productAttributes).not.toHaveProperty('brand');
    });

    it('includes the actual brand when one is supplied', async () => {
      process.env.GOOGLE_MERCHANT_KEY = Buffer.from(
        JSON.stringify({ client_email: 'test@test.com', private_key: 'key' }),
      ).toString('base64');
      const { GoogleAuth } = await import('google-auth-library');
      const mockClient = { getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }) };
      GoogleAuth.mockImplementation(() => ({ getClient: vi.fn().mockResolvedValue(mockClient) }));
      mockFetch.mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ name: 'inserted' })),
      });
      const mod = await import('../../lib/googleMerchant.js');

      await mod.insertProduct(
        {
          id: 'p1',
          title: 'Test',
          description: 'Desc',
          price: 100,
          image: 'https://img.jpg',
          condition: 'Excellent',
          status: 'Approved',
          isPublished: true,
          brand: 'Rolex',
        },
        'ds1',
        'https://example.com',
      );

      const [, request] = mockFetch.mock.calls[0];
      expect(JSON.parse(request.body).productAttributes.brand).toBe('Rolex');
    });

    it('rejects products that are not both approved and published before calling the API', async () => {
      const mod = await import('../../lib/googleMerchant.js');

      await expect(
        mod.insertProduct(
          {
            id: 'p1',
            title: 'Draft',
            status: 'Pending',
            isPublished: false,
            price: 100,
          },
          'ds1',
          'https://example.com',
        ),
      ).rejects.toThrow('not eligible for Merchant sync');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('deleteProduct', () => {
    it('deletes the encoded v1 product input with the exact dataSource query parameter', async () => {
      process.env.GOOGLE_MERCHANT_KEY = Buffer.from(
        JSON.stringify({ client_email: 'test@test.com', private_key: 'key' }),
      ).toString('base64');
      const { GoogleAuth } = await import('google-auth-library');
      const mockClient = { getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }) };
      GoogleAuth.mockImplementation(() => ({ getClient: vi.fn().mockResolvedValue(mockClient) }));
      mockFetch.mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(''),
      });
      const { deleteProduct } = await import('../../lib/googleMerchant.js');
      const dataSource = 'accounts/5812107292/dataSources/104628';

      await deleteProduct('sku/123', dataSource);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://merchantapi.googleapis.com/products/v1/accounts/5812107292/productInputs/ZW5-SU5-c2t1LzEyMw?dataSource=accounts%2F5812107292%2FdataSources%2F104628',
        expect.objectContaining({ method: 'DELETE' }),
      );
      expect(mockFetch.mock.calls[0][1]).not.toHaveProperty('body');
    });

    it('preserves a 404 status so the route can report an idempotent skip', async () => {
      process.env.GOOGLE_MERCHANT_KEY = Buffer.from(
        JSON.stringify({ client_email: 'test@test.com', private_key: 'key' }),
      ).toString('base64');
      const { GoogleAuth } = await import('google-auth-library');
      const mockClient = { getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }) };
      GoogleAuth.mockImplementation(() => ({ getClient: vi.fn().mockResolvedValue(mockClient) }));
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue(JSON.stringify({ error: { message: 'Not found' } })),
      });
      const { deleteProduct } = await import('../../lib/googleMerchant.js');

      await expect(
        deleteProduct('missing', 'accounts/5812107292/dataSources/104628'),
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('mapCondition', () => {
    it.each(['Mint', 'Excellent', 'Very Good', 'Good', 'Fair', 'Poor', 'Unknown'])(
      'maps the pre-owned grade %s to USED',
      async (condition) => {
        const { mapCondition } = await import('../../lib/googleMerchant.js');
        expect(mapCondition(condition)).toBe('USED');
      },
    );

    it.each(['New', ' new ', 'NEW'])(
      'maps only an explicitly new condition (%s) to NEW',
      async (condition) => {
        const { mapCondition } = await import('../../lib/googleMerchant.js');
        expect(mapCondition(condition)).toBe('NEW');
      },
    );
  });
});
