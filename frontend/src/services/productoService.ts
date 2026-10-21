import { apiClient } from '../api/client';
import { Producto, ProductoInput } from '../types/producto';

export const productoService = {
  async getProductos(q?: string, categoriaId?: number): Promise<Producto[]> {
    const params: Record<string, string | number> = {};
    if (q && q.trim()) {
      params.q = q.trim();
    }
    if (categoriaId && categoriaId > 0) {
      params.categoriaId = categoriaId;
    }

    const response = await apiClient.get<Producto[]>('/productos', { params });
    return response.data;
  },

  async getProductoById(id: number): Promise<Producto> {
    const response = await apiClient.get<Producto>(`/productos/${id}`);
    return response.data;
  },

  async createProducto(data: ProductoInput): Promise<Producto> {
    const response = await apiClient.post<Producto>('/productos', data);
    return response.data;
  },

  async updateProducto(id: number, data: ProductoInput): Promise<Producto> {
    const response = await apiClient.put<Producto>(`/productos/${id}`, data);
    return response.data;
  },

  async deleteProducto(id: number): Promise<void> {
    await apiClient.delete(`/productos/${id}`);
  },

  async uploadImagen(file: File): Promise<{ url: string; nombreArchivo: string; mensaje?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ url: string; nombreArchivo: string; mensaje?: string }>(
      '/productos/upload-imagen',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async asociarImagen(id: number, file: File): Promise<{ mensaje: string; imagenUrl: string; producto: Producto }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ mensaje: string; imagenUrl: string; producto: Producto }>(
      `/productos/${id}/imagen`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async getEstadisticas(): Promise<import('../types/producto').EstadisticasResponse> {
    const response = await apiClient.get<import('../types/producto').EstadisticasResponse>('/productos/estadisticas');
    return response.data;
  },
};
