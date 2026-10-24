import { apiClient } from '../api/client';
import { Proveedor } from '../types/proveedor';

export const proveedorService = {
  getAll: async (): Promise<Proveedor[]> => {
    const response = await apiClient.get<Proveedor[]>('/proveedores');
    return response.data;
  },

  getProveedores: async (): Promise<Proveedor[]> => {
    const response = await apiClient.get<Proveedor[]>('/proveedores');
    return response.data;
  },

  getById: async (id: number): Promise<Proveedor> => {
    const response = await apiClient.get<Proveedor>(`/proveedores/${id}`);
    return response.data;
  },

  asociarAProducto: async (idProducto: number, idProveedor: number): Promise<unknown> => {
    const response = await apiClient.post(`/productos/${idProducto}/proveedores`, { idProveedor });
    return response.data;
  },

  desasociarDeProducto: async (idProducto: number, idProveedor: number): Promise<unknown> => {
    const response = await apiClient.delete(`/productos/${idProducto}/proveedores/${idProveedor}`);
    return response.data;
  },
};
