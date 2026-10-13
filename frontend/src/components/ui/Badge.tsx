import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'emerald' | 'amber' | 'red' | 'slate' | 'purple';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  size = 'md',
  icon,
}) => {
  const variantStyles = {
    blue: 'bg-blue-100 text-blue-900 border-blue-200',
    emerald: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    amber: 'bg-amber-100 text-amber-950 border-amber-200',
    red: 'bg-red-100 text-red-900 border-red-200',
    slate: 'bg-slate-200 text-slate-800 border-slate-300',
    purple: 'bg-purple-100 text-purple-900 border-purple-200',
  }[variant];

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${variantStyles} ${sizeStyles}`}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
