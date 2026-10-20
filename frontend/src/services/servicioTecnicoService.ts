import { apiClient } from '../api/client';
import { CrearOrdenServicioRequest, OrdenServicio, TipoServicio } from '../types/servicio';

export const servicioTecnicoService = {
  async getServicios(): Promise<OrdenServicio[]> {
    const response = await apiClient.get<OrdenServicio[]>('/servicios-tecnicos');
    return response.data;
  },

  async getMisServicios(idUsuario?: number, correo?: string): Promise<OrdenServicio[]> {
    const params = new URLSearchParams();
    if (idUsuario) params.append('idUsuario', idUsuario.toString());
    if (correo) params.append('correo', correo);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<OrdenServicio[]>(`/servicios-tecnicos/mis-servicios${query}`);
    return response.data;
  },

  async getTipos(): Promise<TipoServicio[]> {
    const response = await apiClient.get<TipoServicio[]>('/servicios-tecnicos/tipos');
    return response.data;
  },

  async crearServicio(req: CrearOrdenServicioRequest): Promise<{
    id_OrdenServicio: number;
    clienteNombre: string;
    tecnicoNombre: string;
    tipoServicioNombre: string;
    fechaIngreso: string;
    estado: string;
    costoTotal: number;
  }> {
    const response = await apiClient.post('/servicios-tecnicos', req);
    return response.data;
  },

  async actualizarEstadoServicio(id: number, nuevoEstado: string): Promise<{
    id_OrdenServicio: number;
    estado: string;
    mensaje: string;
  }> {
    const response = await apiClient.put(`/servicios-tecnicos/${id}/estado`, { nuevoEstado });
    return response.data;
  },
};
