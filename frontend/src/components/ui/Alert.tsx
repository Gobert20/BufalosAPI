import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const styles = {
    info: {
      bg: 'bg-blue-50 border-blue-300 text-blue-950',
      icon: <Info className="w-5 h-5 text-blue-700 shrink-0" aria-hidden="true" />,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
      icon: <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-300 text-amber-950',
      icon: <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" aria-hidden="true" />,
    },
    error: {
      bg: 'bg-red-50 border-red-300 text-red-950',
      icon: <AlertCircle className="w-5 h-5 text-red-700 shrink-0" aria-hidden="true" />,
    },
  }[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`border rounded-lg p-4 flex items-start gap-3 shadow-xs ${styles.bg} ${className}`}
    >
      {styles.icon}
      <div className="flex-1 text-sm">
        {title && <h3 className="font-semibold text-base mb-1">{title}</h3>}
        <div className="leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar notificación"
          className="p-1.5 rounded-md hover:bg-black/5 text-current transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
