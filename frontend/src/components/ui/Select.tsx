import React from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: Option[];
  placeholder?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, id, options, placeholder, error, helperText, className = '', required, ...props }, ref) => {
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const describedBy = [
      error ? errorId : null,
      helperText ? helperId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className="w-full text-left">
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-slate-900 mb-1.5"
        >
          {label} {required && <span className="text-red-700" aria-hidden="true">*</span>}
        </label>
        <select
          ref={ref}
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`w-full min-h-[44px] px-3.5 py-2 rounded-lg border text-base text-slate-900 bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 cursor-pointer ${
            error
              ? 'border-red-600 focus-visible:ring-red-600'
              : 'border-slate-300 hover:border-slate-400 focus-visible:ring-blue-600'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-xs text-slate-600">
            {helperText}
          </p>
        )}
        {error && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="mt-1.5 text-xs font-semibold text-red-700"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
