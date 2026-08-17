'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastType,
    options?: { duration?: number; action?: { label: string; onClick: () => void } }
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      options?: { duration?: number; action?: { label: string; onClick: () => void } }
    ) => {
      const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      const duration = options?.duration ?? (type === 'error' ? 6000 : 4000);

      const newToast: ToastItem = {
        id,
        message,
        type,
        duration,
        action: options?.action,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-md w-[calc(100vw-3rem)] pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
                isError
                  ? 'bg-red-950/90 text-red-100 border-red-800/80 shadow-red-950/30'
                  : isSuccess
                  ? 'bg-emerald-950/90 text-emerald-100 border-emerald-800/80 shadow-emerald-950/30'
                  : isWarning
                  ? 'bg-amber-950/90 text-amber-100 border-amber-800/80 shadow-amber-950/30'
                  : 'bg-zinc-900/90 text-zinc-100 border-zinc-700/80 shadow-black/30'
              }`}
              role="alert"
            >
              <div className="shrink-0 mt-0.5">
                {isError && <AlertCircle size={18} className="text-red-400" />}
                {isSuccess && <CheckCircle2 size={18} className="text-emerald-400" />}
                {isWarning && <AlertTriangle size={18} className="text-amber-400" />}
                {!isError && !isSuccess && !isWarning && <Info size={18} className="text-purple-400" />}
              </div>

              <div className="flex-1 text-xs sm:text-sm font-sans leading-snug">
                <p className="font-medium">{toast.message}</p>
                {toast.action && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action?.onClick();
                      removeToast(toast.id);
                    }}
                    className="mt-2 text-xs font-mono uppercase tracking-wider font-bold underline hover:opacity-80 transition-opacity cursor-pointer block"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 rounded-lg opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
