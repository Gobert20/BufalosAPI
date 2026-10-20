import { apiClient } from '../api/client';
import { CrearPedidoRequest, Pedido } from '../types/pedido';

export const pedidoService = {
  async getPedidos(): Promise<Pedido[]> {
    const response = await apiClient.get<Pedido[]>('/pedidos');
    return response.data;
  },

  async getMisPedidos(idUsuario?: number, correo?: string): Promise<Pedido[]> {
    const params = new URLSearchParams();
    if (idUsuario) params.append('idUsuario', idUsuario.toString());
    if (correo) params.append('correo', correo);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<Pedido[]>(`/pedidos/mis-pedidos${query}`);
    return response.data;
  },

  async crearPedido(req: CrearPedidoRequest): Promise<{
    id_Pedido: number;
    id_Usuario: number;
    clienteNombre: string;
    fechaPedido: string;
    estadoPedido: string;
    total: number;
    itemsCount: number;
  }> {
    const response = await apiClient.post('/pedidos', req);
    return response.data;
  },

  async actualizarEstadoPedido(id: number, nuevoEstado: string): Promise<{
    id_Pedido: number;
    estadoPedido: string;
    mensaje: string;
  }> {
    const response = await apiClient.put(`/pedidos/${id}/estado`, { nuevoEstado });
    return response.data;
  },
};
