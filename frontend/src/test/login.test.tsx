import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    getStoredToken: vi.fn().mockReturnValue(null),
    getStoredUser: vi.fn().mockReturnValue(null),
    setAuthSession: vi.fn(),
    clearAuthSession: vi.fn(),
    isTokenExpired: vi.fn().mockReturnValue(false),
  },
}));

describe('LoginPage Component', () => {
  it('renderiza correctamente el formulario de login y sus elementos accesibles', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar al sistema/i })).toBeInTheDocument();
  });

  it('muestra errores de validación en cliente cuando los campos están vacíos', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /ingresar al sistema/i });
    await user.click(submitBtn);

    expect(await screen.findByText(/el correo electrónico es requerido/i)).toBeInTheDocument();
  });

  it('ejecuta autenticación exitosa al enviar credenciales válidas', async () => {
    const user = userEvent.setup();
    const mockAuthResponse = {
      token: 'mock.jwt.token',
      usuario: {
        id: 1,
        nombreCompleto: 'Admin Test',
        correo: 'admin@bufalos.cl',
        rol: 'Admin' as const,
      },
    };

    vi.mocked(authService.login).mockResolvedValueOnce(mockAuthResponse);

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passInput = screen.getByLabelText(/contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /ingresar al sistema/i });

    await user.type(emailInput, 'admin@bufalos.cl');
    await user.type(passInput, 'Admin123!');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith(
        { correo: 'admin@bufalos.cl', password: 'Admin123!' }
      );
    });
  });
});
