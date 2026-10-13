export type RolNombre = 'Admin' | 'Cliente';

export interface Usuario {
  id: number;
  nombreCompleto: string;
  correo: string;
  rol: RolNombre;
}

export interface AuthResponse {
  token: string;
  usuario: {
    id: number;
    nombreCompleto: string;
    correo: string;
    rol: RolNombre;
  };
}

export interface LoginCredentials {
  correo: string;
  password: string;
}

export interface DecodedToken {
  nameid?: string;
  unique_name?: string;
  email?: string;
  role?: string;
  exp?: number;
  [key: string]: unknown;
}
