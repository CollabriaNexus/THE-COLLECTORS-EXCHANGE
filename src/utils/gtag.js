import { CONSENT_DENIED, GA_MEASUREMENT_ID, readConsent } from './consent';

/**
 * Both helpers are inert unless GA4 is actually running, and GA4 only ever
 * starts from the consent gate (src/utils/consent.js — the inline bootstrap in
 * index.html and grantConsent() are its only two loaders). So:
 *
 *  - no decision yet / rejected  -> `window.gtag` was never defined  -> no-op
 *  - accepted                    -> `window.gtag` exists             -> sends
 *  - withdrawn mid-session       -> denyConsent() deletes `window.gtag` and
 *                                   sets GA's own `ga-disable-<ID>` flag, and
 *                                   the explicit CONSENT_DENIED check below is
 *                                   a second, independent stop.
 *
 * The stored-decision check is deliberately "is it denied?" rather than "is it
 * granted?": if localStorage throws (private mode) the decision cannot be read
 * back, and falling through to the `window.gtag` check is then both correct
 * and safe — that global exists only if consent was given in this tab.
 */
const trackingIsBlocked = () => readConsent() === CONSENT_DENIED;

export const pageview = (path) => {
  if (trackingIsBlocked()) return;
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, { page_path: path });
  }
};

export const event = ({ action, category, label, value }) => {
  if (trackingIsBlocked()) return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
};
