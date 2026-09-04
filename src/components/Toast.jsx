import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

// DESIGN.md §5.3: 5 seconds for success, persistent for errors. A single
// 4-second timer for every type meant a failure message — the one thing a user
// has to read and act on — disappeared before it could be read, on a slow
// mobile connection quite possibly before they had looked at it at all.
// `0` (or any falsy duration) means "stay until dismissed".
const DEFAULT_DURATION = {
  success: 5000,
  info: 5000,
  warning: 7000,
  error: 0,
};

const durationFor = (type, explicit) =>
  explicit === undefined ? (DEFAULT_DURATION[type] ?? 5000) : explicit;

const EXIT_MS = 200;

const ToastItem = ({ toast, onRemove }) => {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);
  const exitTimerRef = useRef(null);

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current);
    setExiting(true);
    exitTimerRef.current = setTimeout(() => onRemove(toast.id), EXIT_MS);
  }, [onRemove, toast.id]);

  useEffect(() => {
    if (!toast.duration) return undefined;
    timerRef.current = setTimeout(dismiss, toast.duration);
    return () => clearTimeout(timerRef.current);
  }, [toast.duration, dismiss]);

  useEffect(() => () => clearTimeout(exitTimerRef.current), []);

  return (
    <div
      // An `aria-live` container that also carried `role="alert"` contradicted
      // itself (alert is an assertive live region; polite is not). The
      // announcement now lives on the individual toast: assertive for errors,
      // polite status for everything else.
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl shadow-lg text-sm font-sans transition-all duration-200 ${
        exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0 animate-toast-in'
      } ${
        toast.type === 'success'
          ? 'bg-green-900 text-white'
          : toast.type === 'error'
            ? 'bg-red-900 text-white'
            : 'bg-heritage-charcoal text-white'
      }`}
    >
      <span className="flex-1">{toast.message}</span>
      {/* An SVG-only button so the global
          `button:has(svg:only-child) { min-width: 44px; min-height: 44px }`
          touch rule applies. The old content was the text glyph `&times;`,
          which missed that rule and left a ~10px tap target. */}
      <button
        type="button"
        onClick={dismiss}
        className="text-white/80 hover:text-white flex-shrink-0 rounded-full transition-colors"
        aria-label="Close notification"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration: durationFor(type, duration) }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* Top-right, under the floating nav pill (DESIGN.md §5.3). The old
          `bottom-6 right-6` position sat directly on top of the mobile tab
          bar — which lives at calc(0.75rem + safe-area) spanning left-3/right-3
          — so an "Added to cart" toast covered the Cart and Account tabs, the
          exact controls the user reaches for next. The bottom-right corner is
          also taken by Layout's WhatsApp (bottom-24 lg:bottom-8) and
          scroll-to-top (bottom-40 lg:bottom-24) buttons, so anchoring to the
          top is the only placement that clears all three. --header-h is kept
          in sync with the nav's real height by Header.jsx. */}
      <div
        style={{ top: 'calc(var(--header-h, 4rem) + 0.75rem)' }}
        className="fixed left-3 right-3 sm:left-auto sm:right-6 z-[9999] flex flex-col gap-3 sm:max-w-sm pointer-events-none"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
