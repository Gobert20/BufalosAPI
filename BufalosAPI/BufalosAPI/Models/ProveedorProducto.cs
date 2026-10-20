namespace BufalosAPI.Models
{
    public class ProveedorProducto
    {
        public int Id_Proveedor { get; set; }
        public int Id_Producto { get; set; }

        // Navegación
        public Proveedor? Proveedor { get; set; }
        public Producto? Producto { get; set; }
    }
}
