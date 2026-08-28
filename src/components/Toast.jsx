import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

const ToastItem = ({ toast, onRemove }) => {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 200);
    }, toast.duration || 4000);
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleDismiss = () => {
    clearTimeout(timerRef.current);
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  return (
    <div
      className={`flex items-start gap-3 px-5 py-4 rounded-2xl shadow-lg text-sm font-sans transition-all duration-200 ${
        exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0 animate-slide-up'
      } ${
        toast.type === 'success'
          ? 'bg-green-900 text-white'
          : toast.type === 'error'
            ? 'bg-red-900 text-white'
            : 'bg-heritage-charcoal text-white'
      }`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={handleDismiss}
        className="text-white/70 hover:text-white flex-shrink-0"
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm"
        role="alert"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
