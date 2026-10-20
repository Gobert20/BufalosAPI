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
    registro: vi.fn(),
    getRoles: vi.fn().mockResolvedValue([
      { id_Rol: 2, nombre: 'Cliente' },
      { id_Rol: 3, nombre: 'Técnico' },
      { id_Rol: 1, nombre: 'Administrador' },
    ]),
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

  it('permite cambiar a la pestaña de registro y muestra los campos y opciones de rol', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const registerTab = screen.getByRole('tab', { name: /crear cuenta/i });
    await user.click(registerTab);

    expect(screen.getByRole('heading', { name: /registro de nuevo usuario/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rol de usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear cuenta y registrarse/i })).toBeInTheDocument();
  });

  it('ejecuta registro de nuevo usuario con rol seleccionado exitosamente', async () => {
    const user = userEvent.setup();
    const mockRegistroResponse = {
      id: 5,
      nombre: 'Técnico Armería',
      correo: 'tecnico@bufalos.cl',
      rol: 'Técnico',
      id_Rol: 3,
    };

    vi.mocked(authService.registro).mockResolvedValueOnce(mockRegistroResponse);

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Cambiar a la pestaña de registro
    const registerTab = screen.getByRole('tab', { name: /crear cuenta/i });
    await user.click(registerTab);

    const nombreInput = screen.getByLabelText(/nombre completo/i);
    const correoInput = screen.getByLabelText(/correo electrónico/i);
    const rolSelect = screen.getByLabelText(/rol de usuario/i);
    const passInput = screen.getByLabelText(/^contraseña/i);
    const confirmPassInput = screen.getByLabelText(/confirmar contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /crear cuenta y registrarse/i });

    await user.type(nombreInput, 'Técnico Armería');
    await user.type(correoInput, 'tecnico@bufalos.cl');
    await user.selectOptions(rolSelect, 'Técnico');
    await user.type(passInput, 'Tecnico123!');
    await user.type(confirmPassInput, 'Tecnico123!');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(authService.registro).toHaveBeenCalledWith(
        expect.objectContaining({
          nombreCompleto: 'Técnico Armería',
          correo: 'tecnico@bufalos.cl',
          password: 'Tecnico123!',
          rol: 'Técnico',
          id_Rol: 3,
        })
      );
    });

    // Debe mostrar la alerta de éxito
    expect(await screen.findByText(/¡cuenta creada exitosamente!/i)).toBeInTheDocument();
  });
});
