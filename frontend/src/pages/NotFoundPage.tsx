import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto my-12 text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-5" aria-hidden="true">
        <FileQuestion className="w-9 h-9" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
        404 - Página no encontrada
      </h1>

      <p className="text-slate-600 text-base leading-relaxed mb-6">
        La ruta solicitada no existe o ha sido movida a otra ubicación.
      </p>

      <Link to="/productos">
        <Button variant="primary" icon={<Home className="w-4 h-4" aria-hidden="true" />}>
          Ir al Catálogo de Productos
        </Button>
      </Link>
    </div>
  );
};
