// src/components/Toast.jsx
// Global floating toast notification system.
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

const ICONS = {
  success: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
};

const STYLES = {
  success: 'bg-emerald-950/95 border-emerald-600/60 text-emerald-300',
  error:   'bg-red-950/95    border-red-600/60    text-red-300',
  info:    'bg-primary-950/95 border-primary-600/60 text-primary-300',
  warning: 'bg-amber-950/95  border-amber-600/60  text-amber-300',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, exiting: false }]);
    // Start exit animation at 3.5s, remove at 4s
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    }, 3500);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container — fixed top-right */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        style={{ maxWidth: '360px', width: 'calc(100vw - 2rem)' }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl
              backdrop-blur-sm pointer-events-auto cursor-pointer
              ${STYLES[toast.type] ?? STYLES.info}
              ${toast.exiting ? 'toast-exit' : 'toast-enter'}
            `}
            onClick={() => dismiss(toast.id)}
          >
            <span className="mt-0.5">{ICONS[toast.type]}</span>
            <p className="text-sm font-medium leading-snug flex-1">{toast.message}</p>
            <button className="opacity-50 hover:opacity-100 transition-opacity text-xs leading-none mt-0.5">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
