export interface TipoServicio {
  id_TipoServicio: number;
  nombre: string;
  costoBase: number;
  tiempoEstimadoDias: number;
}

export interface DetalleParcheCustomDto {
  textoPersonalizado?: string | null;
  dimensiones?: string | null;
  tipoBordado?: string | null;
  cantidad?: number;
  observacionesDiseno?: string | null;
}

export interface OrdenServicio {
  id_OrdenServicio: number;
  id_Cliente: number;
  clienteNombre: string;
  clienteCorreo: string;
  id_TecnicoAsignado?: number;
  tecnicoNombre?: string;
  id_TipoServicio: number;
  tipoServicioNombre: string;
  fechaIngreso: string;
  fechaEstimadaEntrega?: string;
  estado: string;
  descripcionProblemaOrItem: string;
  costoTotal: number;
  detalleParche?: DetalleParcheCustomDto | null;
}

export interface CrearOrdenServicioRequest {
  id_Cliente?: number;
  clienteCorreo?: string;
  id_TecnicoAsignado?: number;
  id_TipoServicio: number;
  fechaEstimadaEntrega?: string;
  estado?: string;
  descripcionProblemaOrItem: string;
  costoTotal: number;
  textoParche?: string;
  dimensionesParche?: string;
  tipoBordado?: string;
  cantidadParches?: number;
  observacionesParche?: string;
}
