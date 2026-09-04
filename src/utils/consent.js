/**
 * Consent gate for the only two third-party tracking tags on this site:
 * the Meta Pixel and Google Analytics 4.
 *
 * The rule this file enforces: **nothing is requested from
 * connect.facebook.net or googletagmanager.com until the visitor has
 * explicitly opted in.** There is no "implied consent", no pre-ticked box and
 * no soft wall — a first visit, a rejection and a later withdrawal all result
 * in zero tracking requests.
 *
 * There are two places that can start the tags:
 *   1. The tiny inline bootstrap in `index.html` (which is also copied into
 *      every prerendered static page by `scripts/prerender-blogs.mjs`). It
 *      only runs when this browser already stored `granted`, so a returning
 *      consenting visitor does not have to wait for the React bundle. It sets
 *      `window.__tceAnalyticsLoaded` so this module never double-loads.
 *   2. `grantConsent()` below, called from ConsentBanner when someone accepts.
 *      That path loads the tags immediately, with no page reload.
 *
 * Keep CONSENT_STORAGE_KEY, the two stored values and the two tag IDs in sync
 * with the inline bootstrap in index.html — it is a deliberate duplicate,
 * because it has to run before any module JavaScript exists.
 */

export const CONSENT_STORAGE_KEY = 'tce_consent_v1';
export const CONSENT_GRANTED = 'granted';
export const CONSENT_DENIED = 'denied';

/** Fired on `window` when the footer/privacy "Cookie preferences" control is used. */
export const CONSENT_OPEN_EVENT = 'tce:consent-open';

export const META_PIXEL_ID = '1814649636560455';
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-MFQBH0YJ0K';

const GA_DISABLE_KEY = `ga-disable-${GA_MEASUREMENT_ID}`;
const TRACKING_COOKIE_PATTERN = /^(_ga|_gid|_gat|_fbp|_fbc)/;

const isBrowser = () => typeof window !== 'undefined';

/**
 * Fallback for privacy modes where `localStorage` getters/setters throw.
 * The decision then lasts for the tab only, which fails closed: the banner
 * asks again next visit rather than assuming consent.
 */
let memoryConsent = null;

/** @returns {'granted'|'denied'|null} */
export function readConsent() {
  if (!isBrowser()) return null;

  let stored = null;
  try {
    stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return memoryConsent;
  }

  if (stored === CONSENT_GRANTED || stored === CONSENT_DENIED) return stored;
  return memoryConsent;
}

export function hasAnalyticsConsent() {
  return readConsent() === CONSENT_GRANTED;
}

export function hasDeclinedAnalytics() {
  return readConsent() === CONSENT_DENIED;
}

/** True once a decision of either kind exists, i.e. the banner should stay closed. */
export function hasConsentDecision() {
  return readConsent() !== null;
}

function storeConsent(value) {
  memoryConsent = value;
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Private/blocked storage — the in-memory value above still governs this tab.
  }
}

/* ------------------------------------------------------------------ */
/*  Tag loaders — only ever reached from grantConsent()                */
/* ------------------------------------------------------------------ */

let analyticsLoaded = false;

function loadMetaPixel() {
  if (typeof window.fbq === 'function') return;

  const fbq = function fbqShim(...args) {
    if (fbq.callMethod) fbq.callMethod.apply(fbq, args);
    else fbq.queue.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}

function loadGa4() {
  if (typeof window.gtag === 'function') return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  // Named `gtag` rather than an arrow so `arguments` is available, which is
  // what the GA4 snippet relies on.
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  // send_page_view stays false: route changes are reported by pageview() in
  // src/utils/gtag.js, so letting config auto-send would double-count.
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
}

/**
 * Loads both tags. Never call this directly — it does no consent check of its
 * own; `grantConsent()` is the only supported entry point.
 */
function loadAnalytics() {
  if (!isBrowser() || typeof document === 'undefined') return;
  if (analyticsLoaded || window.__tceAnalyticsLoaded === true) {
    analyticsLoaded = true;
    return;
  }
  analyticsLoaded = true;
  window.__tceAnalyticsLoaded = true;
  loadMetaPixel();
  loadGa4();
}

/* ------------------------------------------------------------------ */
/*  Withdrawal                                                         */
/* ------------------------------------------------------------------ */

/**
 * Best-effort removal of the cookies the two tags set. Cookies written by the
 * remote scripts on a parent domain cannot always be deleted from here, hence
 * "best effort": the hard guarantee is that nothing is *sent* any more.
 */
export function clearTrackingCookies() {
  if (typeof document === 'undefined' || !document.cookie) return;

  const names = document.cookie
    .split(';')
    .map((pair) => pair.split('=')[0].trim())
    .filter((name) => name && TRACKING_COOKIE_PATTERN.test(name));
  if (names.length === 0) return;

  const host = isBrowser() ? window.location.hostname : '';
  const labels = host.split('.');
  const scopes = ['', host, `.${host}`];
  if (labels.length > 2) scopes.push(`.${labels.slice(-2).join('.')}`);

  names.forEach((name) => {
    scopes.forEach((scope) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${
        scope ? `; domain=${scope}` : ''
      }`;
    });
  });
}

/**
 * Stops both tags inside the current page, without a reload:
 *  - GA4's own documented kill switch (`window['ga-disable-<ID>'] = true`)
 *  - removes `window.gtag`, so src/utils/gtag.js has nothing to call
 *  - the Pixel's documented `fbq('consent', 'revoke')`
 *  - clears the `_ga*` / `_fb*` cookies it can reach
 */
function stopAnalytics() {
  if (!isBrowser()) return;

  window[GA_DISABLE_KEY] = true;
  try {
    delete window.gtag;
  } catch {
    window.gtag = undefined;
  }
  try {
    if (typeof window.fbq === 'function') window.fbq('consent', 'revoke');
  } catch {
    // The Pixel may not have finished loading; the cookie clear below still runs.
  }
  clearTrackingCookies();
}

/* ------------------------------------------------------------------ */
/*  Public decisions                                                   */
/* ------------------------------------------------------------------ */

/** Accept: persist the decision and start both tags immediately. */
export function grantConsent() {
  storeConsent(CONSENT_GRANTED);
  if (!isBrowser()) return;

  window[GA_DISABLE_KEY] = false;
  const alreadyRunning = analyticsLoaded || window.__tceAnalyticsLoaded === true;

  if (alreadyRunning) {
    // Re-granting after a withdrawal in the same page view: the remote scripts
    // are still in the document, so re-arm them rather than injecting again.
    if (typeof window.fbq === 'function') {
      window.fbq('consent', 'grant');
      window.fbq('track', 'PageView');
    }
    if (typeof window.gtag !== 'function') loadGa4();
  } else {
    loadAnalytics();
  }
}

/** Reject, or withdraw a previous acceptance. Nothing is loaded or sent after this. */
export function denyConsent() {
  storeConsent(CONSENT_DENIED);
  stopAnalytics();
}

/** Reopens the consent banner (footer / privacy-page "Cookie preferences"). */
export function openConsentPreferences() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}

/** Test seam: resets the module's memory of what it has already injected. */
export function __resetConsentStateForTests() {
  analyticsLoaded = false;
  memoryConsent = null;
}
