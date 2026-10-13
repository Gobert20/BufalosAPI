import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      isLoading = false,
      disabled,
      icon,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-medium text-sm rounded-lg min-h-[44px] px-4 py-2.5 transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none shadow-xs';

    const variantStyles = {
      primary:
        'bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900 focus-visible:ring-blue-600 focus-visible:ring-offset-white',
      secondary:
        'bg-slate-800 text-white hover:bg-slate-900 active:bg-black focus-visible:ring-slate-700 focus-visible:ring-offset-white',
      danger:
        'bg-red-700 text-white hover:bg-red-800 active:bg-red-900 focus-visible:ring-red-600 focus-visible:ring-offset-white',
      outline:
        'border-2 border-slate-300 bg-white text-slate-800 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-blue-600 focus-visible:ring-offset-white',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-blue-600 shadow-none',
    }[variant];

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`${baseStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current" aria-hidden="true" />
            <span>Cargando...</span>
          </>
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
