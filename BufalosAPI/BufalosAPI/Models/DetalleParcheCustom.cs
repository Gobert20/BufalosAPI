namespace BufalosAPI.Models
{
    public class DetalleParcheCustom
    {
        public int Id_DetalleParche { get; set; }
        public int Id_OrdenServicio { get; set; }
        public string? TextoPersonalizado { get; set; }
        public string Dimensiones { get; set; } = "8x5 cm";
        public string TipoBordado { get; set; } = "Velcro Táctico";
        public int Cantidad { get; set; } = 1;
        public string? ObservacionesDiseno { get; set; }

        // Navegación
        public OrdenServicio? OrdenServicio { get; set; }
    }
}
