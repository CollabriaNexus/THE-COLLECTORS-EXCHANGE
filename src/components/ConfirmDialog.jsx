import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const ConfirmContext = createContext(null);

export const useConfirm = () => useContext(ConfirmContext);

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const CLOSED = {
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  destructive: false,
};

// `confirm()` used to take a bare string, so every dialog in the app got the
// same generic "Confirm" verb and the same neutral styling — there was no way
// to say "Delete listing" or to mark an irreversible action as destructive.
// It now also takes an options object. The string form is still supported
// verbatim and behaves exactly as before (title-less, generic labels), because
// callers outside this file pass strings.
const normalizeOptions = (input) => {
  if (typeof input === 'string' || input == null) {
    return { ...CLOSED, open: true, message: input ?? '' };
  }
  return {
    ...CLOSED,
    open: true,
    title: input.title ?? '',
    message: input.message ?? '',
    confirmLabel: input.confirmLabel ?? CLOSED.confirmLabel,
    cancelLabel: input.cancelLabel ?? CLOSED.cancelLabel,
    destructive: Boolean(input.destructive),
  };
};

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(CLOSED);
  const resolveRef = useRef(null);
  const dialogRef = useRef(null);
  // The element that had focus when the dialog opened, so focus can go back
  // there on close instead of being dumped at the top of the document.
  const previouslyFocusedRef = useRef(null);

  const handleClose = useCallback((value) => {
    setState(CLOSED);
    if (resolveRef.current) {
      resolveRef.current(value);
      resolveRef.current = null;
    }
  }, []);

  const confirm = useCallback((options) => {
    setState(normalizeOptions(options));
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  useEffect(() => {
    if (!state.open) return;

    const panel = dialogRef.current;
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusables = () => (panel ? Array.from(panel.querySelectorAll(FOCUSABLE)) : []);

    const first = focusables()[0];
    (first || panel)?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose(false);
        return;
      }
      if (e.key !== 'Tab' || !panel) return;

      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === firstEl || !panel.contains(active)) {
          e.preventDefault();
          lastEl.focus();
        }
      } else if (active === lastEl || !panel.contains(active)) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [state.open, handleClose]);

  const titleId = 'confirm-dialog-title';

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state.open && (
        <div
          className="fixed inset-0 z-[99999] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          {...(state.title
            ? { 'aria-labelledby': titleId }
            : { 'aria-label': 'Confirmation dialog' })}
        >
          <div
            className="fixed inset-0 backdrop-blur-md bg-heritage-cream/50 transition-opacity"
            onClick={() => handleClose(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              ref={dialogRef}
              tabIndex={-1}
              className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              {state.title && (
                <h2 id={titleId} className="text-heritage-charcoal font-serif text-xl mb-2">
                  {state.title}
                </h2>
              )}
              <p className="text-heritage-charcoal font-serif text-lg mb-6">{state.message}</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleClose(false)}
                  className="px-5 py-2.5 rounded-full border border-heritage-charcoal/20 text-heritage-charcoal text-xs uppercase tracking-[0.15em] font-medium hover:bg-heritage-cream transition-colors"
                >
                  {state.cancelLabel}
                </button>
                <button
                  onClick={() => handleClose(true)}
                  className={`px-5 py-2.5 rounded-full text-white text-xs uppercase tracking-[0.15em] font-medium transition-colors ${
                    state.destructive
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-heritage-charcoal hover:bg-heritage-brown'
                  }`}
                >
                  {state.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
