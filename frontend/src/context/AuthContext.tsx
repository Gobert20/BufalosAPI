import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { LoginCredentials, Usuario } from '../types/auth';

export interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCliente: boolean;
  isTecnico?: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials, remember?: boolean) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    authService.clearAuthSession();
    setUser(null);
    setToken(null);
  }, []);

  // Inicialización de sesión desde storage
  useEffect(() => {
    try {
      const storedToken = authService.getStoredToken();
      const storedUser = authService.getStoredUser();

      if (storedToken && storedUser) {
        if (authService.isTokenExpired(storedToken)) {
          logout();
        } else {
          setToken(storedToken);
          setUser(storedUser);
        }
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // Manejo de expiración o desautorización reactiva (OWASP API2)
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('bufalos:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('bufalos:unauthorized', handleUnauthorized);
  }, [logout]);

  const login = async (credentials: LoginCredentials, remember = false): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await authService.login(credentials);
      authService.setAuthSession(data.token, data.usuario, remember);
      setToken(data.token);
      setUser(data.usuario);
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!token && !!user && !authService.isTokenExpired(token);
  const isAdmin = user?.rol === 'Admin' || user?.rol === 'Administrador';
  const isCliente = user?.rol === 'Cliente';
  const isTecnico = user?.rol === 'Técnico' || user?.rol === 'Tecnico';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isCliente,
        isTecnico,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
