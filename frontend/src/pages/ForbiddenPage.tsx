import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

export const ForbiddenPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as { requiredRole?: string; userRole?: string } | null;

  return (
    <div className="max-w-xl mx-auto my-12 text-center bg-white p-8 rounded-2xl shadow-sm border border-red-200">
      <div className="w-16 h-16 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto mb-5" aria-hidden="true">
        <ShieldAlert className="w-9 h-9" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
        403 - Acceso Denegado
      </h1>

      <p className="text-slate-600 text-base leading-relaxed mb-6">
        No cuenta con los privilegios requeridos para acceder a este recurso protegido.
      </p>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-sm mb-6 space-y-1.5">
        <p className="text-slate-700">
          <span className="font-semibold text-slate-900">Usuario actual:</span>{' '}
          {user?.nombreCompleto || 'Desconocido'} ({user?.correo || 'Sin correo'})
        </p>
        <p className="text-slate-700">
          <span className="font-semibold text-slate-900">Su rol asignado:</span>{' '}
          <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-xs">
            {user?.rol || state?.userRole || 'Ninguno'}
          </span>
        </p>
        {state?.requiredRole && (
          <p className="text-slate-700">
            <span className="font-semibold text-slate-900">Rol requerido para esta operación:</span>{' '}
            <span className="inline-block px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-xs">
              {state.requiredRole}
            </span>
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/productos">
          <Button variant="primary" icon={<Home className="w-4 h-4" aria-hidden="true" />}>
            Volver al Catálogo
          </Button>
        </Link>
        <Button
          variant="outline"
          icon={<ArrowLeft className="w-4 h-4" aria-hidden="true" />}
          onClick={() => window.history.back()}
        >
          Regresar a la página anterior
        </Button>
      </div>
    </div>
  );
};
