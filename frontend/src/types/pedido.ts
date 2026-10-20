export interface DetallePedidoItem {
  id_DetallePedido: number;
  id_Producto: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id_Pedido: number;
  id_Usuario: number;
  clienteNombre: string;
  clienteCorreo: string;
  fechaPedido: string;
  estadoPedido: string;
  metodoEntrega: string;
  direccionEnvio?: string;
  total: number;
  detalles: DetallePedidoItem[];
}

export interface ItemPedidoInput {
  id_Producto: number;
  cantidad: number;
}

export interface CrearPedidoRequest {
  id_Usuario?: number;
  correo?: string;
  metodoEntrega: string;
  direccionEnvio?: string;
  items: ItemPedidoInput[];
}
