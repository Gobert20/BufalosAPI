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

export interface EstadisticasResponse {
  totalProductos: number;
  totalStock: number;
  valorInventario: number;
  stockBajoCount: number;
  stockCriticoCount: number;
  porCategoria: CategoriaEstadistica[];
  topVendidos: ProductoVendido[];
  alertasStock: AlertaStock[];
}

