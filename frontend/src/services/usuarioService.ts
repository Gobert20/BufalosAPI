import { apiClient } from '../api/client';
import { UsuarioAdmin, BanRequest, PermisoEspecialRequest, PermisoUsuario } from '../types/usuario';

export const usuarioService = {
  // GET /api/v1/usuarios (Admin)
  getAll: async (): Promise<UsuarioAdmin[]> => {
    const response = await apiClient.get<UsuarioAdmin[]>('/usuarios');
    return response.data;
  },

  // GET /api/v1/usuarios/{id} (Admin)
  getById: async (id: number): Promise<UsuarioAdmin & { permisos: PermisoUsuario[] }> => {
    const response = await apiClient.get<UsuarioAdmin & { permisos: PermisoUsuario[] }>(`/usuarios/${id}`);
    return response.data;
  },

  // PUT /api/v1/usuarios/{id}/ban (Admin)
  ban: async (id: number, data: BanRequest): Promise<unknown> => {
    const response = await apiClient.put(`/usuarios/${id}/ban`, data);
    return response.data;
  },

  // POST /api/v1/usuarios/{id}/permisos-especiales (Admin)
  otorgarPermiso: async (id: number, data: PermisoEspecialRequest): Promise<unknown> => {
    const response = await apiClient.post(`/usuarios/${id}/permisos-especiales`, data);
    return response.data;
  },

  // DELETE /api/v1/usuarios/{id}/permisos/{permisoId} (Admin)
  revocarPermiso: async (id: number, permisoId: number): Promise<unknown> => {
    const response = await apiClient.delete(`/usuarios/${id}/permisos/${permisoId}`);
    return response.data;
  },
};
