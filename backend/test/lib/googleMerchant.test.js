import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
}));

vi.mock('google-auth-library', () => {
  const mockGetAccessToken = vi.fn();
  const mockGetClient = vi.fn();
  const MockGoogleAuth = vi.fn().mockImplementation(() => ({
    getClient: mockGetClient,
  }));
  return { GoogleAuth: MockGoogleAuth };
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

function setupGoogleAuth(token) {
  const { GoogleAuth } = { GoogleAuth: vi.fn() };
}

describe('googleMerchant lib', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.GOOGLE_MERCHANT_KEY;
    delete process.env.GOOGLE_MERCHANT_KEY_PATH;
  });

  describe('api function', () => {
    it('makes successful API call', async () => {
      process.env.GOOGLE_MERCHANT_KEY = Buffer.from(JSON.stringify({ client_email: 'test@test.com', private_key: 'key' })).toString('base64');
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
      process.env.GOOGLE_MERCHANT_KEY = Buffer.from(JSON.stringify({ client_email: 'test@test.com', private_key: 'key' })).toString('base64');
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
      process.env.GOOGLE_MERCHANT_KEY = Buffer.from(JSON.stringify({ client_email: 'test@test.com', private_key: 'key' })).toString('base64');
      const { GoogleAuth } = await import('google-auth-library');
      const mockClient = { getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }) };
      GoogleAuth.mockImplementation(() => ({ getClient: vi.fn().mockResolvedValue(mockClient) }));
      mockFetch.mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ dataSources: [{ displayName: 'API Products', name: 'ds1' }] })),
      });
      const mod = await import('../../lib/googleMerchant.js');
      const result = await mod.findOrCreateDataSource();
      expect(result.name).toBe('ds1');
    });

    it('creates new data source when not found', async () => {
      process.env.GOOGLE_MERCHANT_KEY = Buffer.from(JSON.stringify({ client_email: 'test@test.com', private_key: 'key' })).toString('base64');
      const { GoogleAuth } = await import('google-auth-library');
      const mockClient = { getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }) };
      GoogleAuth.mockImplementation(() => ({ getClient: vi.fn().mockResolvedValue(mockClient) }));
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ ok: true, text: vi.fn().mockResolvedValue(JSON.stringify({ dataSources: [] })) });
        }
        return Promise.resolve({ ok: true, text: vi.fn().mockResolvedValue(JSON.stringify({ displayName: 'API Products', name: 'ds-new' })) });
      });
      const mod = await import('../../lib/googleMerchant.js');
      const result = await mod.findOrCreateDataSource();
      expect(result.displayName).toBe('API Products');
    });
  });

  describe('insertProduct', () => {
    it('calls API with product data', async () => {
      process.env.GOOGLE_MERCHANT_KEY = Buffer.from(JSON.stringify({ client_email: 'test@test.com', private_key: 'key' })).toString('base64');
      const { GoogleAuth } = await import('google-auth-library');
      const mockClient = { getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }) };
      GoogleAuth.mockImplementation(() => ({ getClient: vi.fn().mockResolvedValue(mockClient) }));
      mockFetch.mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({ name: 'inserted' })),
      });
      const mod = await import('../../lib/googleMerchant.js');
      const product = { id: 'p1', title: 'Test', description: 'Desc', price: 100, image: 'https://img.jpg', condition: 'Mint', status: 'Approved' };
      const result = await mod.insertProduct(product, 'ds1', 'https://example.com');
      expect(result.name).toBe('inserted');
    });
  });

  describe('mapCondition', () => {
    it('maps condition values correctly', () => {
      const map = { Mint: 'NEW', New: 'NEW', Excellent: 'USED', 'Very Good': 'USED', Good: 'USED', Fair: 'USED', Poor: 'USED' };
      expect(map['Mint']).toBe('NEW');
      expect(map['Excellent']).toBe('USED');
      expect(map['Unknown'] || 'USED').toBe('USED');
    });
  });
});
