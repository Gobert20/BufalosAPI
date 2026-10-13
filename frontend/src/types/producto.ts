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
