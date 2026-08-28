import { describe, it, expect } from 'vitest';
import { parseBrowser, parseDeviceType, parseOs } from '../../lib/userAgent.js';

describe('parseDeviceType', () => {
  it('detects mobile', () => {
    expect(
      parseDeviceType(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      ),
    ).toBe('mobile');
    expect(
      parseDeviceType(
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36',
      ),
    ).toBe('mobile');
  });

  it('detects tablet', () => {
    expect(
      parseDeviceType('Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15'),
    ).toBe('tablet');
  });

  it('defaults to desktop for plain UAs', () => {
    expect(
      parseDeviceType('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36'),
    ).toBe('desktop');
  });

  it('handles empty input', () => {
    expect(parseDeviceType('')).toBe('unknown');
    expect(parseDeviceType(null)).toBe('unknown');
  });
});

describe('parseOs', () => {
  it('parses Windows versions', () => {
    expect(parseOs('Windows NT 10.0; Win64; x64')).toBe('Windows 10/11');
    expect(parseOs('Windows NT 6.1; Win64; x64')).toBe('Windows 7');
  });

  it('parses Android major version', () => {
    expect(parseOs('Android 14; Pixel 8')).toBe('Android 14');
  });

  it('parses iOS version with underscores', () => {
    expect(parseOs('iPhone; CPU iPhone OS 17_5_1 like Mac OS X')).toBe('iOS 17.5.1');
  });

  it('parses macOS', () => {
    expect(parseOs('Macintosh; Intel Mac OS X 10_15_7')).toBe('macOS 10.15');
  });

  it('falls back to Unknown', () => {
    expect(parseOs('weird-agent')).toBe('Unknown');
    expect(parseOs('')).toBe('Unknown');
  });
});

describe('parseBrowser', () => {
  it('prefers Edge over Chrome', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2';
    expect(parseBrowser(ua)).toBe('Edge 120');
  });

  it('parses Chrome via CriOS on iOS', () => {
    expect(parseBrowser('Mozilla/5.0 (iPhone;) CriOS/121.0.6167.138')).toBe('Chrome 121');
  });

  it('parses Safari without matching Chrome first', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
    expect(parseBrowser(ua)).toBe('Safari 17');
  });

  it('parses Firefox and Samsung Internet', () => {
    expect(parseBrowser('Mozilla/5.0 Gecko/20100101 Firefox/122.0')).toBe('Firefox 122');
    expect(parseBrowser('SamsungBrowser/23.0 Chrome/115')).toBe('Samsung Internet 23');
  });
});
