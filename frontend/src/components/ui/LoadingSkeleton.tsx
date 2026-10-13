import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = 'h-6 w-full',
  count = 1,
}) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando contenido..."
      className="space-y-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-slate-200 animate-pulse rounded-md ${className}`}
        />
      ))}
      <span className="sr-only">Cargando datos...</span>
    </div>
  );
};
