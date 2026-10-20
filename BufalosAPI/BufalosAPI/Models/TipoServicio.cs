namespace BufalosAPI.Models
{
    public class TipoServicio
    {
        public int Id_TipoServicio { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public decimal CostoBase { get; set; }
        public int TiempoEstimadoDias { get; set; } = 3;
    }
}
