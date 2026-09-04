import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Lives here rather than in src/utils/__tests__/ because that directory is
// owned by another agent; vitest.config.js includes src/**/*.test.js too.

const KEY = 'tce_consent_v1';

/** Fresh module instance per test — the module caches "already injected". */
async function loadConsent() {
  vi.resetModules();
  return import('./consent');
}

function resetDom() {
  window.localStorage.clear();
  delete window.fbq;
  delete window._fbq;
  delete window.gtag;
  delete window.dataLayer;
  delete window.__tceAnalyticsLoaded;
  delete window['ga-disable-G-MFQBH0YJ0K'];
  document.head.querySelectorAll('script[src]').forEach((s) => s.remove());
}

function injectedSrcs() {
  return [...document.head.querySelectorAll('script[src]')].map((s) => s.src);
}

describe('consent', () => {
  beforeEach(() => {
    resetDom();
  });

  afterEach(() => {
    resetDom();
  });

  describe('readConsent', () => {
    it('is null before any decision', async () => {
      const { readConsent, hasConsentDecision } = await loadConsent();
      expect(readConsent()).toBeNull();
      expect(hasConsentDecision()).toBe(false);
    });

    it('ignores a junk value in storage', async () => {
      window.localStorage.setItem(KEY, 'maybe');
      const { readConsent } = await loadConsent();
      expect(readConsent()).toBeNull();
    });

    it('does not throw when localStorage.getItem throws', async () => {
      const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      const { readConsent } = await loadConsent();
      expect(() => readConsent()).not.toThrow();
      expect(readConsent()).toBeNull();
      spy.mockRestore();
    });
  });

  describe('first visit / rejection', () => {
    it('loads nothing at import time', async () => {
      await loadConsent();
      expect(injectedSrcs()).toHaveLength(0);
      expect(window.fbq).toBeUndefined();
      expect(window.gtag).toBeUndefined();
    });

    it('denyConsent stores the decision and loads no tag', async () => {
      const { denyConsent, readConsent, hasAnalyticsConsent } = await loadConsent();
      denyConsent();
      expect(window.localStorage.getItem(KEY)).toBe('denied');
      expect(readConsent()).toBe('denied');
      expect(hasAnalyticsConsent()).toBe(false);
      expect(injectedSrcs()).toHaveLength(0);
      expect(window.fbq).toBeUndefined();
      expect(window.gtag).toBeUndefined();
    });

    it('denyConsent survives a throwing localStorage.setItem', async () => {
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      const { denyConsent, readConsent } = await loadConsent();
      expect(() => denyConsent()).not.toThrow();
      // Falls back to the in-memory decision for this tab.
      expect(readConsent()).toBe('denied');
      spy.mockRestore();
    });
  });

  describe('grantConsent', () => {
    it('stores the decision and injects both tags', async () => {
      const { grantConsent, hasAnalyticsConsent } = await loadConsent();
      grantConsent();

      expect(window.localStorage.getItem(KEY)).toBe('granted');
      expect(hasAnalyticsConsent()).toBe(true);

      const srcs = injectedSrcs();
      expect(srcs.some((s) => s.includes('connect.facebook.net'))).toBe(true);
      expect(srcs.some((s) => s.includes('googletagmanager.com'))).toBe(true);
      expect(typeof window.fbq).toBe('function');
      expect(typeof window.gtag).toBe('function');
    });

    it('fires the initial Pixel PageView', async () => {
      const { grantConsent } = await loadConsent();
      grantConsent();
      expect(window.fbq.queue).toContainEqual(['init', '1814649636560455']);
      expect(window.fbq.queue).toContainEqual(['track', 'PageView']);
    });

    it('does not inject the tags twice', async () => {
      const { grantConsent } = await loadConsent();
      grantConsent();
      const first = injectedSrcs().length;
      grantConsent();
      expect(injectedSrcs()).toHaveLength(first);
    });

    it('skips injection when the inline head bootstrap already loaded them', async () => {
      window.__tceAnalyticsLoaded = true;
      const { grantConsent } = await loadConsent();
      grantConsent();
      expect(injectedSrcs().some((s) => s.includes('connect.facebook.net'))).toBe(false);
    });
  });

  describe('withdrawal', () => {
    it('removes window.gtag and sets GA’s own kill switch', async () => {
      const { grantConsent, denyConsent } = await loadConsent();
      grantConsent();
      expect(typeof window.gtag).toBe('function');

      denyConsent();
      expect(window.gtag).toBeUndefined();
      expect(window['ga-disable-G-MFQBH0YJ0K']).toBe(true);
      expect(window.localStorage.getItem(KEY)).toBe('denied');
    });

    it('revokes Pixel consent', async () => {
      const { grantConsent, denyConsent } = await loadConsent();
      grantConsent();
      denyConsent();
      expect(window.fbq.queue).toContainEqual(['consent', 'revoke']);
    });

    it('clears reachable _ga / _fbp cookies and leaves others alone', async () => {
      document.cookie = '_ga=GA1.1.123; path=/';
      document.cookie = '_fbp=fb.1.456; path=/';
      document.cookie = 'cart_id=keep-me; path=/';

      const { clearTrackingCookies } = await loadConsent();
      clearTrackingCookies();

      expect(document.cookie).not.toContain('_ga=');
      expect(document.cookie).not.toContain('_fbp=');
      expect(document.cookie).toContain('cart_id=keep-me');
    });
  });

  describe('openConsentPreferences', () => {
    it('dispatches the reopen event', async () => {
      const { openConsentPreferences, CONSENT_OPEN_EVENT } = await loadConsent();
      const listener = vi.fn();
      window.addEventListener(CONSENT_OPEN_EVENT, listener);
      openConsentPreferences();
      window.removeEventListener(CONSENT_OPEN_EVENT, listener);
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('gtag helpers stay inert without consent', () => {
    it('pageview does nothing when no tag was ever loaded', async () => {
      vi.resetModules();
      const { pageview } = await import('./gtag');
      expect(() => pageview('/')).not.toThrow();
      expect(window.gtag).toBeUndefined();
    });

    it('pageview does nothing after a withdrawal, even if a gtag stub survives', async () => {
      const { denyConsent } = await loadConsent();
      denyConsent();
      const spy = vi.fn();
      window.gtag = spy; // simulate a leftover global
      const { pageview, event } = await import('./gtag');
      pageview('/home');
      event({ action: 'click' });
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
