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
            const focusable = dialogRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable.length > 0) focusable[0].focus();
        }
        return () => document.removeEventListener('keydown', handleEscape);
    }, [state.open, handleClose]);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {state.open && (
                <div className="fixed inset-0 z-[99999] overflow-y-auto" role="dialog" aria-modal="true" aria-label="Confirmation dialog">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => handleClose(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div ref={dialogRef} className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                            <p className="text-gray-800 font-medium text-base mb-6">{state.message}</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => handleClose(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleClose(true)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
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
