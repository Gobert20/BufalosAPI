using BufalosAPI.Models;
using BufalosAPI.Services;
using Microsoft.EntityFrameworkCore;

namespace BufalosAPI.Data
{
    public static class DbInitializer
    {
        public static void Initialize(BufalosDbContext context, AuthService auth)
        {
            context.Database.EnsureCreated();

            // 1. Sembrado de Roles
            if (!context.Roles.Any())
            {
                context.Roles.AddRange(
                    new Rol { Nombre = "Admin" },
                    new Rol { Nombre = "Cliente" }
                );
                context.SaveChanges();
            }

            var adminRol = context.Roles.FirstOrDefault(r => r.Nombre == "Admin" || r.Nombre == "Administrador")
                ?? context.Roles.First();
            var clienteRol = context.Roles.FirstOrDefault(r => r.Nombre == "Cliente")
                ?? context.Roles.Skip(1).FirstOrDefault()
                ?? adminRol;

            // 2. Sembrado de Categorías (recurso relacionado)
            if (!context.Categorias.Any())
            {
                context.Categorias.AddRange(
                    new Categoria { Nombre = "Ropa Táctica" },
                    new Categoria { Nombre = "Calzado y Botas" },
                    new Categoria { Nombre = "Mochilas y Bolsos" },
                    new Categoria { Nombre = "Protección y Seguridad" }
                );
                context.SaveChanges();
            }

            // 3. Sembrado y sincronización de Usuarios Demo (Admin y Cliente)
            var adminUser = context.Usuarios.FirstOrDefault(u => u.Correo == "admin@bufalos.cl");
            if (adminUser is null)
            {
                context.Usuarios.Add(new Usuario
                {
                    NombreCompleto = "Administrador Búfalos",
                    Correo = "admin@bufalos.cl",
                    ContrasenaHash = auth.HashPassword("Admin123!"),
                    Id_Rol = adminRol.Id_Rol,
                    FechaNacimiento = new DateTime(1990, 1, 1),
                    EsVerificado = true,
                    FechaCreacion = DateTime.UtcNow
                });
            }
            else
            {
                adminUser.ContrasenaHash = auth.HashPassword("Admin123!");
                adminUser.Id_Rol = adminRol.Id_Rol;
            }

            var clienteUser = context.Usuarios.FirstOrDefault(u => u.Correo == "cliente@bufalos.cl");
            if (clienteUser is null)
            {
                context.Usuarios.Add(new Usuario
                {
                    NombreCompleto = "Cliente Demostración",
                    Correo = "cliente@bufalos.cl",
                    ContrasenaHash = auth.HashPassword("Cliente123!"),
                    Id_Rol = clienteRol.Id_Rol,
                    FechaNacimiento = new DateTime(1998, 5, 12),
                    EsVerificado = true,
                    FechaCreacion = DateTime.UtcNow
                });
            }
            else
            {
                clienteUser.ContrasenaHash = auth.HashPassword("Cliente123!");
                clienteUser.Id_Rol = clienteRol.Id_Rol;
            }
            context.SaveChanges();

            // 4. Sembrado de Productos (recurso principal del caso de negocio)
            if (!context.Productos.Any())
            {
                var catRopa = context.Categorias.FirstOrDefault(c => c.Nombre == "Ropa Táctica")?.Id_Categoria ?? 1;
                var catCalzado = context.Categorias.FirstOrDefault(c => c.Nombre == "Calzado y Botas")?.Id_Categoria ?? 2;
                var catMochilas = context.Categorias.FirstOrDefault(c => c.Nombre == "Mochilas y Bolsos")?.Id_Categoria ?? 3;
                var catProteccion = context.Categorias.FirstOrDefault(c => c.Nombre == "Protección y Seguridad")?.Id_Categoria ?? 4;

                context.Productos.AddRange(
                    new Producto
                    {
                        Nombre = "Chaqueta Militar Antirrasgaduras Ripstop",
                        Descripcion = "Chaqueta de combate impermeable con refuerzo en codos y múltiples bolsillos tácticos.",
                        Precio = 59990m,
                        Stock = 25,
                        Id_Categoria = catRopa,
                        RestriccionEdad = 0,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "BUF-CHA-001"
                    },
                    new Producto
                    {
                        Nombre = "Pantalón Cargo Táctico Reforzado",
                        Descripcion = "Pantalón con costuras dobles, tratamiento repelente al agua y 8 compartimentos.",
                        Precio = 42990m,
                        Stock = 40,
                        Id_Categoria = catRopa,
                        RestriccionEdad = 0,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "BUF-PAN-002"
                    },
                    new Producto
                    {
                        Nombre = "Botas Tácticas con Puntera de Acero",
                        Descripcion = "Calzado ergonómico de alta resistencia para terrenos difíciles con suela antideslizante.",
                        Precio = 84990m,
                        Stock = 18,
                        Id_Categoria = catCalzado,
                        RestriccionEdad = 0,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "BUF-BOT-003"
                    },
                    new Producto
                    {
                        Nombre = "Mochila Militar Modular Assault 45L",
                        Descripcion = "Mochila táctica con sistema MOLLE, correas acolchadas y compatibilidad con vejiga de agua.",
                        Precio = 49990m,
                        Stock = 30,
                        Id_Categoria = catMochilas,
                        RestriccionEdad = 0,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "BUF-MOC-004"
                    },
                    new Producto
                    {
                        Nombre = "Chaleco Porta Placas Balísticas Nivel III-A",
                        Descripcion = "Chaleco de protección balística ajustable para personal de seguridad acreditado.",
                        Precio = 189990m,
                        Stock = 8,
                        Id_Categoria = catProteccion,
                        RestriccionEdad = 18,
                        RequierePermiso = true,
                        SoloPersonalAutorizado = true,
                        NumeroSerie = "BUF-CHA-005"
                    },
                    new Producto
                    {
                        Nombre = "Guantes Tácticos con Nudillos Reforzados",
                        Descripcion = "Guantes de cuero sintético y polímero resistente para máxima protección de manos.",
                        Precio = 22990m,
                        Stock = 50,
                        Id_Categoria = catProteccion,
                        RestriccionEdad = 0,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "BUF-GUA-006"
                    }
                );
                context.SaveChanges();
            }
        }
    }
}
