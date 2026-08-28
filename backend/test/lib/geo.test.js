import { describe, it, expect, vi, afterEach } from 'vitest';
import { hashId, lookupLocation, normalizeIp } from '../../lib/geo.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('normalizeIp', () => {
  it('takes the first entry of x-forwarded-for lists', () => {
    expect(normalizeIp('1.2.3.4, 10.0.0.1')).toBe('1.2.3.4');
  });

  it('strips IPv4-mapped IPv6 prefix', () => {
    expect(normalizeIp('::ffff:203.0.113.9')).toBe('203.0.113.9');
  });

  it('returns null for empty input', () => {
    expect(normalizeIp('')).toBeNull();
    expect(normalizeIp(null)).toBeNull();
  });
});

describe('hashId', () => {
  it('produces a stable sha256 hex digest', () => {
    const a = hashId('test-value');
    const b = hashId('test-value');
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('lookupLocation', () => {
  it('returns geo fields on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'success',
          country: 'India',
          countryCode: 'IN',
          regionName: 'Karnataka',
          city: 'Bengaluru',
          lat: 12.97,
          lon: 77.59,
        }),
      }),
    );
    const result = await lookupLocation('203.0.113.55');
    expect(result.country).toBe('India');
    expect(result.city).toBe('Bengaluru');
    expect(result.latitude).toBe(12.97);
  });

  it('skips private IPs without calling fetch', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    for (const ip of ['127.0.0.1', '192.168.1.5', '10.0.0.3', '::1']) {
      const result = await lookupLocation(ip);
      expect(result.city).toBeNull();
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns nulls when the provider fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    const result = await lookupLocation('198.51.100.7');
    expect(result).toEqual({
      country: null,
      countryCode: null,
      region: null,
      city: null,
      latitude: null,
      longitude: null,
    });
  });
});
