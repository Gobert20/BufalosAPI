import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RolNombre } from '../../types/auth';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: RolNombre | RolNombre[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-xl shadow-xs border border-slate-200" aria-live="polite">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Verificando sesión...</h2>
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  // Si no está autenticado, redirigir a login preservando la ruta solicitada
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si requiere un rol específico (e.g. Admin o Técnico) y el usuario no lo posee, redirigir a 403
  if (requiredRole) {
    const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userRole = user?.rol || '';
    const hasRole = rolesArray.some((r) => {
      if (r === userRole) return true;
      if ((r === 'Admin' || r === 'Administrador') && (userRole === 'Admin' || userRole === 'Administrador')) return true;
      if ((r === 'Técnico' || r === 'Tecnico') && (userRole === 'Técnico' || userRole === 'Tecnico')) return true;
      return false;
    });

    if (!hasRole) {
      return <Navigate to="/403" state={{ requiredRole: rolesArray.join(' o '), userRole: user?.rol }} replace />;
    }
  }

  return <>{children}</>;
};
