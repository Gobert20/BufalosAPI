namespace BufalosAPI.Models
{
    public class Producto
    {
        public int Id_Producto { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public int Id_Categoria { get; set; }
        public int RestriccionEdad { get; set; }
        public bool RequierePermiso { get; set; }
        public bool SoloPersonalAutorizado { get; set; }
        public string? NumeroSerie { get; set; }
        public string? ImagenUrl { get; set; }

        public Categoria? Categoria { get; set; }
    }
}
