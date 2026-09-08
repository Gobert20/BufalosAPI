namespace BufalosAPI.Models
{
    public class Usuario
    {
        public int Id_Usuario { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string ContrasenaHash { get; set; } = string.Empty;
        public int Id_Rol { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public bool EsVerificado { get; set; }
        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        public Rol? Rol { get; set; }
    }
}