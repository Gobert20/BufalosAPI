import { apiClient } from '../api/client';
import {
  AuthResponse,
  DecodedToken,
  LoginCredentials,
  RegistroRequest,
  RegistroResponse,
  RolDto,
  Usuario,
} from '../types/auth';

const TOKEN_KEY = 'bufalos_auth_token';
const USER_KEY = 'bufalos_auth_user';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/usuarios/login', credentials);
    return response.data;
  },

  async registro(data: RegistroRequest): Promise<RegistroResponse> {
    const response = await apiClient.post<RegistroResponse>('/usuarios/registro', data);
    return response.data;
  },

  async getRoles(): Promise<RolDto[]> {
    try {
      const response = await apiClient.get<RolDto[]>('/usuarios/roles');
      return response.data;
    } catch {
      return [
        { id_Rol: 2, nombre: 'Cliente' },
        { id_Rol: 3, nombre: 'Técnico' },
        { id_Rol: 1, nombre: 'Administrador' },
      ];
    }
  },

  getStoredToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): Usuario | null {
    const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      return null;
    }
  },

  setAuthSession(token: string, user: Usuario, remember = false): void {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearAuthSession(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  decodeToken(token: string): DecodedToken | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload as DecodedToken;
    } catch {
      return null;
    }
  },

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
  },
};
