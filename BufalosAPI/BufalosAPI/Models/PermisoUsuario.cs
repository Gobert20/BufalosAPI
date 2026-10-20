namespace BufalosAPI.Models
{
    public class PermisoUsuario
    {
        public int Id_Permiso { get; set; }
        public int Id_Usuario { get; set; }
        public string TipoPermiso { get; set; } = string.Empty;
        public string NumeroDocumento { get; set; } = string.Empty;
        public DateTime FechaExpiracion { get; set; }
        public string Estado { get; set; } = "Pendiente";

        // Navegación
        public Usuario? Usuario { get; set; }
    }
}
