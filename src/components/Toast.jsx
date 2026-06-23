import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm" role="alert" aria-live="polite">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-start gap-3 px-5 py-4 rounded-sm shadow-lg text-sm font-sans animate-slide-up ${
                            toast.type === 'success'
                                ? 'bg-green-900 text-white'
                                : toast.type === 'error'
                                ? 'bg-red-900 text-white'
                                : 'bg-heritage-charcoal text-white'
                        }`}
                    >
                        <span className="flex-1">{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} className="text-white/70 hover:text-white flex-shrink-0" aria-label="Close notification">&times;</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}