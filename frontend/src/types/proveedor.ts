export interface Proveedor {
  id_Proveedor: number;
  nombreEmpresa: string;
  contacto: string | null;
  telefono: string | null;
  correo: string | null;
  totalProductosSuministrados?: number;
}
