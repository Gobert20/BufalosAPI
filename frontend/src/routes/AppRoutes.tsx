import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { ProductosListPage } from '../pages/ProductosListPage';
import { ProductoDetailPage } from '../pages/ProductoDetailPage';
import { ProductoFormPage } from '../pages/ProductoFormPage';
import { EstadisticasPage } from '../pages/EstadisticasPage';
import { PanelTecnicoPage } from '../pages/PanelTecnicoPage';
import { MisPedidosPage } from '../pages/MisPedidosPage';
import { ServicioClientePage } from '../pages/ServicioClientePage';
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

        {/* Historial de Pedidos y Compras del Cliente */}
        <Route
          path="mis-pedidos"
          element={
            <ProtectedRoute>
              <MisPedidosPage />
            </ProtectedRoute>
          }
        />

        {/* Solicitudes de Servicio Técnico y Taller del Cliente */}
        <Route
          path="servicios-cliente"
          element={
            <ProtectedRoute>
              <ServicioClientePage />
            </ProtectedRoute>
          }
        />

        {/* Panel de Estadísticas y Negocio: Exclusivo Admin y Técnico (Bloqueado para Cliente) */}
        <Route
          path="estadisticas"
          element={
            <ProtectedRoute requiredRole={['Admin', 'Técnico']}>
              <EstadisticasPage />
            </ProtectedRoute>
          }
        />

        {/* Panel Técnico de Taller y Despacho (Técnico y Admin) */}
        <Route
          path="panel-tecnico"
          element={
            <ProtectedRoute requiredRole={['Admin', 'Técnico']}>
              <PanelTecnicoPage />
            </ProtectedRoute>
          }
        />

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
