export type RolNombre = 'Admin' | 'Cliente' | 'Técnico' | 'Administrador' | string;

export interface Usuario {
  id: number;
  nombreCompleto: string;
  correo: string;
  rol: RolNombre;
}

export interface RolDto {
  id_Rol: number;
  nombre: string;
}

export interface RegistroRequest {
  nombreCompleto: string;
  correo: string;
  password: string;
  id_Rol?: number;
  rol?: string;
  fechaNacimiento?: string;
  esVerificado?: boolean;
}

export interface RegistroResponse {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  id_Rol: number;
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
