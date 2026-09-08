namespace BufalosAPI.Models
{
    public class Pedido
    {
        public int Id_Pedido { get; set; }
        public int Id_Usuario { get; set; }
        public DateTime FechaPedido { get; set; } = DateTime.Now;
        public string EstadoPedido { get; set; } = "Creado";
        public string MetodoEntrega { get; set; } = string.Empty;
        public string? DireccionEnvio { get; set; }
        public decimal Total { get; set; }

        public Usuario? Usuario { get; set; }
        public List<DetallePedido> Detalles { get; set; } = new();
    }
}