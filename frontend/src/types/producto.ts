export interface Categoria {
  id_Categoria: number;
  nombre: string;
}

export interface Producto {
  id_Producto: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  id_Categoria: number;
  restriccionEdad: number;
  requierePermiso: boolean;
  soloPersonalAutorizado: boolean;
  numeroSerie: string | null;
  imagenUrl?: string | null;
  categoria?: Categoria | null;
}

export interface ProductoInput {
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  id_Categoria: number;
  restriccionEdad: number;
  requierePermiso: boolean;
  soloPersonalAutorizado: boolean;
  numeroSerie?: string | null;
  imagenUrl?: string | null;
}

export interface CategoriaEstadistica {
  idCategoria: number;
  nombre: string;
  totalProductos: number;
  stockTotal: number;
  valorInventario: number;
}

export interface ProductoVendido {
  idProducto: number;
  nombre: string;
  cantidadVendida: number;
  totalRecaudado: number;
}

export interface AlertaStock {
  idProducto: number;
  nombre: string;
  categoria: string;
  stock: number;
  precio: number;
}

export interface TransaccionComercial {
  id: string;
  tipo: string;
  cliente: string;
  fecha: string;
  monto: number;
  estado: string;
}

export interface EstadisticasResponse {
  totalProductos: number;
  totalStock: number;
  valorInventario: number;
  stockBajoCount: number;
  stockCriticoCount: number;
  totalFacturado?: number;
  totalPedidos?: number;
  pedidosPendientesCount?: number;
  totalServicios?: number;
  serviciosEnProcesoCount?: number;
  porCategoria: CategoriaEstadistica[];
  topVendidos: ProductoVendido[];
  alertasStock: AlertaStock[];
  ultimasTransacciones?: TransaccionComercial[];
}
