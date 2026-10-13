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
};
