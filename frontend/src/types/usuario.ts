export interface UsuarioAdmin {
  id_Usuario: number;
  nombreCompleto: string;
  correo: string;
  rol: string;
  esVerificado: boolean;
  estaBaneado: boolean;
  motivoBaneo: string | null;
  fechaCreacion: string;
  cantidadPermisos: number;
}

export interface PermisoUsuario {
  id_Permiso: number;
  tipoPermiso: string;
  numeroDocumento: string;
  fechaExpiracion: string;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
}

export interface BanRequest {
  esBaneado: boolean;
  motivoBaneo?: string | null;
}

export interface PermisoEspecialRequest {
  tipoPermiso: string;
  numeroDocumento: string;
  fechaExpiracion: string;
  estado: string;
}
