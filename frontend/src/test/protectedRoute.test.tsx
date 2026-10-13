import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthContext, AuthContextType } from '../context/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

const renderWithAuthContext = (
  authValue: Partial<AuthContextType>,
  initialRoute = '/protected',
  requiredRole?: 'Admin' | 'Cliente'
) => {
  const defaultAuth: AuthContextType = {
    user: null,
    token: null,
    isAuthenticated: false,
    isAdmin: false,
    isCliente: false,
    isLoading: false,
    login: async () => {},
    logout: () => {},
    ...authValue,
  };

  return render(
    <AuthContext.Provider value={defaultAuth}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/login" element={<div>Vista de Login Pública</div>} />
          <Route path="/403" element={<div>Acceso Denegado 403</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiredRole={requiredRole}>
                <div>Contenido Seguro Protegido</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('ProtectedRoute Component', () => {
  it('redirige al login cuando el usuario no está autenticado', () => {
    renderWithAuthContext({ isAuthenticated: false, user: null });
    expect(screen.getByText('Vista de Login Pública')).toBeInTheDocument();
    expect(screen.queryByText('Contenido Seguro Protegido')).not.toBeInTheDocument();
  });

  it('redirige a 403 cuando el usuario es Cliente pero la ruta requiere rol Admin', () => {
    renderWithAuthContext(
      {
        isAuthenticated: true,
        user: { id: 2, nombreCompleto: 'Cliente Demo', correo: 'cliente@bufalos.cl', rol: 'Cliente' },
        isAdmin: false,
        isCliente: true,
      },
      '/protected',
      'Admin'
    );

    expect(screen.getByText('Acceso Denegado 403')).toBeInTheDocument();
    expect(screen.queryByText('Contenido Seguro Protegido')).not.toBeInTheDocument();
  });

  it('permite el acceso y renderiza el contenido cuando el usuario cuenta con el rol requerido', () => {
    renderWithAuthContext(
      {
        isAuthenticated: true,
        user: { id: 1, nombreCompleto: 'Admin Master', correo: 'admin@bufalos.cl', rol: 'Admin' },
        isAdmin: true,
        isCliente: false,
      },
      '/protected',
      'Admin'
    );

    expect(screen.getByText('Contenido Seguro Protegido')).toBeInTheDocument();
    expect(screen.queryByText('Acceso Denegado 403')).not.toBeInTheDocument();
  });
});
