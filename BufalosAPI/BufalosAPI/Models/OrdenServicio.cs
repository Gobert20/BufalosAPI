namespace BufalosAPI.Models
{
    public class OrdenServicio
    {
        public int Id_OrdenServicio { get; set; }
        public int Id_Cliente { get; set; }
        public int? Id_TecnicoAsignado { get; set; }
        public int Id_TipoServicio { get; set; }
        public DateTime FechaIngreso { get; set; } = DateTime.UtcNow;
        public DateTime? FechaEstimadaEntrega { get; set; }
        public string Estado { get; set; } = "Recibido";
        public string DescripcionProblemaOrItem { get; set; } = string.Empty;
        public decimal CostoTotal { get; set; }

        public Usuario? Cliente { get; set; }
        public Usuario? TecnicoAsignado { get; set; }
        public TipoServicio? TipoServicio { get; set; }
    }
}
