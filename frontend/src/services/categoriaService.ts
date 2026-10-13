import { apiClient } from '../api/client';
import { Categoria } from '../types/producto';

export const categoriaService = {
  async getCategorias(): Promise<Categoria[]> {
    const response = await apiClient.get<Categoria[]>('/categorias');
    return response.data;
  },

  async getCategoriaById(id: number): Promise<Categoria> {
    const response = await apiClient.get<Categoria>(`/categorias/${id}`);
    return response.data;
  },
};
