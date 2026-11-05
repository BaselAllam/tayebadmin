import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, options?: Omit<Toast, 'id' | 'message'>) => void;
  success: (message: string, description?: string) => void;
  error:   (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  info:    (message: string, description?: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Config ───────────────────────────────────────────────────────────────────
const TOAST_CFG: Record<ToastType, { icon: React.ElementType; iconCls: string }> = {
  success: { icon: CheckCircle2,   iconCls: 'text-emerald-400' },
  error:   { icon: AlertCircle,    iconCls: 'text-rose-400'    },
  warning: { icon: AlertTriangle,  iconCls: 'text-amber-400'   },
  info:    { icon: Info,           iconCls: 'text-blue-400'    },
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const SimpleToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(p => p.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, options: Omit<Toast, 'id' | 'message'> = {}) => {
    const id       = Math.random().toString(36).slice(2);
    const duration = options.duration ?? 3000;
    setToasts(p => [...p, { id, message, type: 'success', ...options }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const success = useCallback((msg: string, description?: string) => toast(msg, { type: 'success', description }), [toast]);
  const error   = useCallback((msg: string, description?: string) => toast(msg, { type: 'error',   description, duration: 5000 }), [toast]);
  const warning = useCallback((msg: string, description?: string) => toast(msg, { type: 'warning', description }), [toast]);
  const info    = useCallback((msg: string, description?: string) => toast(msg, { type: 'info',    description }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {/* ── Viewport ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map(t => {
          const cfg  = TOAST_CFG[t.type ?? 'success'];
          const Icon = cfg.icon;
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-foreground text-background text-xs font-bold shadow-strong animate-in fade-in slide-in-from-bottom-2 duration-200 min-w-[220px] max-w-sm">
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${cfg.iconCls}`} />
              <div className="flex-1 min-w-0">
                <div>{t.message}</div>
                {t.description && (
                  <div className="font-normal opacity-70 mt-0.5">{t.description}</div>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useSimpleToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useSimpleToast must be used inside <SimpleToastProvider>');
  return ctx;
};