import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const ConfirmContext = createContext(null);

export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, message: '' });
  const resolveRef = useRef(null);
  const dialogRef = useRef(null);

  const handleClose = useCallback((value) => {
    setState({ open: false, message: '' });
    if (resolveRef.current) {
      resolveRef.current(value);
      resolveRef.current = null;
    }
  }, []);

  const confirm = useCallback((message) => {
    setState({ open: true, message });
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  useEffect(() => {
    if (!state.open) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') handleClose(false);
    };
    document.addEventListener('keydown', handleEscape);
    if (dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length > 0) focusable[0].focus();
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [state.open, handleClose]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state.open && (
        <div
          className="fixed inset-0 z-[99999] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmation dialog"
        >
          <div
            className="fixed inset-0 backdrop-blur-md bg-heritage-cream/50 transition-opacity"
            onClick={() => handleClose(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              ref={dialogRef}
              className="relative bg-white rounded-sm shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-heritage-charcoal font-serif text-lg mb-6">{state.message}</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleClose(false)}
                  className="px-5 py-2.5 border border-heritage-charcoal/20 text-heritage-charcoal text-xs uppercase tracking-[0.15em] font-medium hover:bg-heritage-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleClose(true)}
                  className="px-5 py-2.5 bg-heritage-charcoal text-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-heritage-brown transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
