import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHash } from 'crypto';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const sha256 = (v) => createHash('sha256').update(v).digest('hex');

describe('metaConversions lib', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.META_CATALOG_ACCESS_TOKEN;
    delete process.env.AWS_LAMBDA_FUNCTION_NAME;
  });

  describe('buildUserData', () => {
    it('hashes email and phone as lowercase-trimmed SHA-256', async () => {
      const { buildUserData } = await import('../../lib/metaConversions.js');
      const result = buildUserData({ email: '  Test@Example.com  ', phone: ' +919999999999 ' });
      expect(result.em).toBe(sha256('test@example.com'));
      expect(result.ph).toBe(sha256('+919999999999'));
    });

    it('hashes externalId and passes ip/user agent through unhashed', async () => {
      const { buildUserData } = await import('../../lib/metaConversions.js');
      const result = buildUserData({
        externalId: 'user-1',
        ip: '203.0.113.5',
        userAgent: 'Mozilla/5.0',
      });
      expect(result.external_id).toBe(sha256('user-1'));
      expect(result.client_ip_address).toBe('203.0.113.5');
      expect(result.client_user_agent).toBe('Mozilla/5.0');
    });

    it('omits fields that were not supplied, never sending empty hashes', async () => {
      const { buildUserData } = await import('../../lib/metaConversions.js');
      expect(buildUserData({})).toEqual({});
      expect(buildUserData({ email: '', phone: '   ' })).toEqual({});
    });
  });

  describe('sendConversionEvent', () => {
    it('posts a well-formed event to the pixel events endpoint', async () => {
      process.env.META_CATALOG_ACCESS_TOKEN = 'test-token';
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ events_received: 1 }),
      });
      const { sendConversionEvent } = await import('../../lib/metaConversions.js');

      const result = await sendConversionEvent({
        eventName: 'Purchase',
        eventId: 'order-1',
        eventSourceUrl: 'https://example.com/checkout',
        userData: { em: 'hash' },
        customData: { value: 100, currency: 'INR' },
      });

      expect(result.events_received).toBe(1);
      const [url, request] = mockFetch.mock.calls[0];
      expect(url).toBe('https://graph.facebook.com/v26.0/1814649636560455/events');
      expect(request.headers.Authorization).toBe('Bearer test-token');
      const body = JSON.parse(request.body);
      expect(body.data[0].event_name).toBe('Purchase');
      expect(body.data[0].event_id).toBe('order-1');
      expect(body.data[0].action_source).toBe('website');
      expect(body.data[0].event_source_url).toBe('https://example.com/checkout');
      expect(body.data[0].user_data).toEqual({ em: 'hash' });
      expect(body.data[0].custom_data).toEqual({ value: 100, currency: 'INR' });
      expect(typeof body.data[0].event_time).toBe('number');
      expect(body).not.toHaveProperty('test_event_code');
    });

    it('includes test_event_code only when explicitly supplied', async () => {
      process.env.META_CATALOG_ACCESS_TOKEN = 'test-token';
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ events_received: 1 }),
      });
      const { sendConversionEvent } = await import('../../lib/metaConversions.js');

      await sendConversionEvent({
        eventName: 'Purchase',
        eventId: 'order-1',
        eventSourceUrl: 'https://example.com/checkout',
        testEventCode: 'TEST12345',
      });

      const [, request] = mockFetch.mock.calls[0];
      expect(JSON.parse(request.body).test_event_code).toBe('TEST12345');
    });

    it('throws on API error', async () => {
      process.env.META_CATALOG_ACCESS_TOKEN = 'test-token';
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ error: { message: 'Invalid parameter' } }),
      });
      const { sendConversionEvent } = await import('../../lib/metaConversions.js');

      await expect(
        sendConversionEvent({
          eventName: 'Purchase',
          eventId: 'order-1',
          eventSourceUrl: 'https://example.com/checkout',
        }),
      ).rejects.toThrow('Invalid parameter');
    });

    it('throws when no access token is configured', async () => {
      const { sendConversionEvent } = await import('../../lib/metaConversions.js');
      await expect(
        sendConversionEvent({
          eventName: 'Purchase',
          eventId: 'order-1',
          eventSourceUrl: 'https://example.com/checkout',
        }),
      ).rejects.toThrow('Meta Catalog access token not found.');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('sendConversionEventAsync', () => {
    it('never throws, even when the send fails', async () => {
      const { sendConversionEventAsync } = await import('../../lib/metaConversions.js');
      expect(() =>
        sendConversionEventAsync({
          eventName: 'Purchase',
          eventId: 'order-1',
          eventSourceUrl: 'https://example.com/checkout',
        }),
      ).not.toThrow();
    });
  });
});
