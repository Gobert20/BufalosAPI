namespace BufalosAPI.Models
{
    public class DetallePedido
    {
        public int Id_DetallePedido { get; set; }
        public int Id_Pedido { get; set; }
        public int Id_Producto { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }

        public Producto? Producto { get; set; }
    }
}
