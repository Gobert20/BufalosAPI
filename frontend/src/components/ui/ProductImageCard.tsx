import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { getProductImageUrl, getCategorySymbol } from '../../utils/productImages';

interface ProductImageProps {
  nombre: string;
  categoriaId: number;
  className?: string;
  aspectRatio?: string;
}

export const ProductImageCard: React.FC<ProductImageProps> = ({
  nombre,
  categoriaId,
  className = 'w-full h-48',
  aspectRatio = 'aspect-4/3',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const src = getProductImageUrl(nombre, categoriaId);
  const symbol = getCategorySymbol(categoriaId);

  return (
    <div
      className={`relative overflow-hidden bg-slate-900 rounded-t-xl flex items-center justify-center ${aspectRatio} ${className}`}
    >
      {/* Símbolo o categoría flotante */}
      <div
        className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-xs flex items-center justify-center text-sm shadow-xs border border-white/10"
        title={`Categoría ${symbol}`}
        aria-hidden="true"
      >
        {symbol}
      </div>

      {/* Imagen real */}
      {!hasError ? (
        <img
          src={src}
          alt={`Fotografía representativa de ${nombre}`}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105 ${
            isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        />
      ) : (
        /* Fallback SVG elegante cuando falla la red o imagen */
        <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-blue-400">
            <Package className="w-6 h-6" aria-hidden="true" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Búfalos Táctico
          </span>
        </div>
      )}

      {/* Gradiente oscuro inferior para resaltar el texto */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
};
