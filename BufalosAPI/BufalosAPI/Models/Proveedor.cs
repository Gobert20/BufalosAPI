namespace BufalosAPI.Models
{
    public class Proveedor
    {
        public int Id_Proveedor { get; set; }
        public string NombreEmpresa { get; set; } = string.Empty;
        public string? Contacto { get; set; }
        public string? Telefono { get; set; }
        public string? Correo { get; set; }

        // Navegación
        public ICollection<ProveedorProducto> ProveedoresProductos { get; set; } = new List<ProveedorProducto>();
    }
}
