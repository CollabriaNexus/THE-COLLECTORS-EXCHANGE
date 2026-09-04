import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import {
  CONSENT_OPEN_EVENT,
  denyConsent,
  grantConsent,
  hasConsentDecision,
} from '../utils/consent';
import { pageview } from '../utils/gtag';

/**
 * Consent gate UI for the Meta Pixel and Google Analytics 4.
 *
 * Deliberate properties:
 *  - Reject and Accept are the same size, the same weight and the same style.
 *    Reject is listed first. Nothing is pre-selected, and closing the banner is
 *    not treated as consent.
 *  - It is `position: fixed`, and the "should I show?" answer is read
 *    synchronously during the first render, so it neither shifts layout nor
 *    flashes for someone who already decided.
 *  - It does not trap focus, dim the page or block scrolling — a visitor can
 *    ignore it and keep browsing.
 */
const ConsentBanner = () => {
  // Read synchronously on first render: no effect, so no post-paint pop-in.
  const [isOpen, setIsOpen] = useState(() => !hasConsentDecision());
  const [wasReopened, setWasReopened] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleOpen = () => {
      setWasReopened(true);
      setIsOpen(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, handleOpen);
  }, []);

  // Only when the visitor asked for it (footer / privacy page) do we move
  // focus — never on a first page load, where stealing focus would be hostile.
  useEffect(() => {
    if (isOpen && wasReopened) panelRef.current?.focus();
  }, [isOpen, wasReopened]);

  const handleAccept = useCallback(() => {
    grantConsent();
    // Tags are live from this moment on, with no reload: record the page the
    // visitor is actually on as the first pageview.
    pageview(`${window.location.pathname}${window.location.search}`);
    setIsOpen(false);
    setWasReopened(false);
  }, []);

  const handleReject = useCallback(() => {
    denyConsent();
    setIsOpen(false);
    setWasReopened(false);
  }, []);

  // Escape closes the panel only when it was reopened over an existing
  // decision — on a first visit there is nothing to fall back to, so Escape
  // must not be a silent third answer.
  useEffect(() => {
    if (!isOpen || !wasReopened) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setWasReopened(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, wasReopened]);

  if (!isOpen) return null;

  const buttonClass =
    'w-full rounded-full border border-obsidian bg-obsidian px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-white transition-all duration-300 hover:bg-luxury-gold hover:border-luxury-gold hover:text-obsidian';

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-banner-title"
      aria-describedby="consent-banner-description"
      style={{ '--consent-offset': 'calc(5.5rem + env(safe-area-inset-bottom))' }}
      className="fixed bottom-[var(--consent-offset)] left-3 right-3 z-[60] mx-auto max-w-xl rounded-2xl border border-black/10 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.18)] sm:p-6 lg:bottom-6 lg:left-auto lg:right-6 lg:mx-0"
    >
      <div className="flex items-start gap-3">
        <ShieldCheck
          size={18}
          strokeWidth={1.5}
          className="mt-0.5 shrink-0 text-luxury-gold"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h2
            id="consent-banner-title"
            className="font-serif text-base font-semibold text-black sm:text-lg"
          >
            Analytics &amp; advertising cookies
          </h2>
          <p
            id="consent-banner-description"
            className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm"
          >
            We would like to load Google Analytics and the Meta Pixel to see how this site is used.
            They are not loaded and nothing leaves your browser unless you choose Accept. You can
            change this at any time from &ldquo;Cookie preferences&rdquo; in the footer. See our{' '}
            <Link
              to="/privacy"
              className="font-medium text-black underline decoration-luxury-gold underline-offset-4 transition-colors duration-300 hover:text-luxury-gold"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" onClick={handleReject} className={buttonClass}>
          Reject
        </button>
        <button type="button" onClick={handleAccept} className={buttonClass}>
          Accept
        </button>
      </div>
    </div>
  );
};

export default ConsentBanner;
