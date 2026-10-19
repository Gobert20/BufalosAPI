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
                    new Categoria { Nombre = "Calzado y Vestuario Táctico" },
                    new Categoria { Nombre = "Accesorios y Óptica" },
                    new Categoria { Nombre = "Defensa Personal" },
                    new Categoria { Nombre = "Parches y Personalización" },
                    new Categoria { Nombre = "Airsoft y Réplicas" }
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
                var catVestuario = context.Categorias.FirstOrDefault(c => c.Nombre == "Calzado y Vestuario Táctico")?.Id_Categoria ?? 1;
                var catAccesorios = context.Categorias.FirstOrDefault(c => c.Nombre == "Accesorios y Óptica")?.Id_Categoria ?? 2;
                var catDefensa = context.Categorias.FirstOrDefault(c => c.Nombre == "Defensa Personal")?.Id_Categoria ?? 3;
                var catParches = context.Categorias.FirstOrDefault(c => c.Nombre == "Parches y Personalización")?.Id_Categoria ?? 4;
                var catAirsoft = context.Categorias.FirstOrDefault(c => c.Nombre == "Airsoft y Réplicas")?.Id_Categoria ?? 5;

                context.Productos.AddRange(
                    new Producto
                    {
                        Nombre = "Chaqueta Militar Antirrasgaduras Ripstop",
                        Descripcion = "Chaqueta de combate impermeable con refuerzo en codos y múltiples bolsillos tácticos.",
                        Precio = 59990m,
                        Stock = 25,
                        Id_Categoria = catVestuario,
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
                        Id_Categoria = catVestuario,
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
                        Id_Categoria = catVestuario,
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
                        Id_Categoria = catAccesorios,
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
                        Id_Categoria = catDefensa,
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
                        Id_Categoria = catVestuario,
                        RestriccionEdad = 0,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "BUF-GUA-006"
                    },
                    new Producto
                    {
                        Nombre = "Rifle Airsoft AEG M4 Carbine Blowback 380 FPS",
                        Descripcion = "Réplica de asalto eléctrica con cuerpo metálico, selector de tiro y cargador hi-cap de 300 BBs.",
                        Precio = 229990m,
                        Stock = 12,
                        Id_Categoria = catAirsoft,
                        RestriccionEdad = 18,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "AIR-M4-001"
                    },
                    new Producto
                    {
                        Nombre = "Parche Moral PVC Bandera de Chile Táctica Velcro",
                        Descripcion = "Parche engomado en relieve con velcro de alta adherencia para mochilas y gorros.",
                        Precio = 5990m,
                        Stock = 60,
                        Id_Categoria = catParches,
                        RestriccionEdad = 0,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "PAR-CHI-001"
                    }
                );
                context.SaveChanges();
            }
        }
    }
}
