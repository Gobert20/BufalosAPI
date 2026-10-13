import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { ProductosListPage } from '../pages/ProductosListPage';
import { ProductoDetailPage } from '../pages/ProductoDetailPage';
import { ProductoFormPage } from '../pages/ProductoFormPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Redirección raíz a listado de productos */}
        <Route index element={<Navigate to="/productos" replace />} />

        {/* Vista pública de login */}
        <Route path="login" element={<LoginPage />} />

        {/* Listado y detalle de productos accesibles */}
        <Route path="productos" element={<ProductosListPage />} />
        <Route path="productos/:id" element={<ProductoDetailPage />} />

        {/* Rutas protegidas: Solo rol Admin */}
        <Route
          path="productos/nuevo"
          element={
            <ProtectedRoute requiredRole="Admin">
              <ProductoFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="productos/editar/:id"
          element={
            <ProtectedRoute requiredRole="Admin">
              <ProductoFormPage />
            </ProtectedRoute>
          }
        />

        {/* Páginas de error y acceso denegado */}
        <Route path="403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
