import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { ToastMessage } from '../../lib/types';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => onClose(toast.id), toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-has-red" />,
    info: <Info className="w-5 h-5 text-has-blue" />,
  };

  const variants = {
    success: 'border-l-4 border-green-500',
    error: 'border-l-4 border-has-red',
    info: 'border-l-4 border-has-blue',
  };

  return (
    <div
      className={cn(
        'toast animate-slide-up flex items-start gap-3',
        variants[toast.type]
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-has-text">{toast.title}</p>
        {toast.message && (
          <p className="mt-1 text-sm text-has-textMuted">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 text-has-textMuted hover:text-has-text rounded transition-colors"
        aria-label="Kapat"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Bildirimler">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};