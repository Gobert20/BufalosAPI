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
                    new Rol { Nombre = "Cliente" },
                    new Rol { Nombre = "Técnico" }
                );
                context.SaveChanges();
            }

            if (!context.Roles.Any(r => r.Nombre == "Técnico" || r.Nombre == "Tecnico"))
            {
                context.Roles.Add(new Rol { Nombre = "Técnico" });
                context.SaveChanges();
            }

            var adminRol = context.Roles.FirstOrDefault(r => r.Nombre == "Admin" || r.Nombre == "Administrador")
                ?? context.Roles.First();
            var clienteRol = context.Roles.FirstOrDefault(r => r.Nombre == "Cliente")
                ?? context.Roles.Skip(1).FirstOrDefault()
                ?? adminRol;
            var tecnicoRol = context.Roles.FirstOrDefault(r => r.Nombre == "Técnico" || r.Nombre == "Tecnico");

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

            if (tecnicoRol != null)
            {
                var tecnicoUser = context.Usuarios.FirstOrDefault(u => u.Correo == "tecnico@bufalos.cl");
                if (tecnicoUser is null)
                {
                    context.Usuarios.Add(new Usuario
                    {
                        NombreCompleto = "Técnico Especialista Búfalos",
                        Correo = "tecnico@bufalos.cl",
                        ContrasenaHash = auth.HashPassword("Tecnico123!"),
                        Id_Rol = tecnicoRol.Id_Rol,
                        FechaNacimiento = new DateTime(1993, 4, 15),
                        EsVerificado = true,
                        FechaCreacion = DateTime.UtcNow
                    });
                }
                else
                {
                    tecnicoUser.ContrasenaHash = auth.HashPassword("Tecnico123!");
                    tecnicoUser.Id_Rol = tecnicoRol.Id_Rol;
                }
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
                    },
                    new Producto
                    {
                        Nombre = "Botas Militares Bates Ultralite 8\" Desert",
                        Descripcion = "Botas tácticas ligeras con cremallera lateral, tejido transpirable y suela antideslizante para todo terreno.",
                        Precio = 89990m,
                        Stock = 24,
                        Id_Categoria = catVestuario,
                        RestriccionEdad = 0,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "BOT-BAT-801"
                    },
                    new Producto
                    {
                        Nombre = "Pantalón Táctico Ripstop Ranger Coyote",
                        Descripcion = "Pantalón con costuras reforzadas de alta densidad, revestimiento de teflón hidrofóbico y 10 bolsillos funcionales.",
                        Precio = 42990m,
                        Stock = 35,
                        Id_Categoria = catVestuario,
                        RestriccionEdad = 0,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "PAN-RNG-002"
                    },
                    new Producto
                    {
                        Nombre = "Mochila Médica Táctica Trauma Bag Trauma-Kit",
                        Descripcion = "Mochila de primeros auxilios y respuesta rápida para paramédicos con paneles organizadores desprendibles y sistema Molle.",
                        Precio = 64990m,
                        Stock = 14,
                        Id_Categoria = catAccesorios,
                        RestriccionEdad = 0,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "MOC-MED-009"
                    },
                    new Producto
                    {
                        Nombre = "Mira Punto Rojo Red Dot Reflex Tactical",
                        Descripcion = "Visor holográfico de adquisición rápida con 4 retículas seleccionables, brillo ajustable y montura estándar Picatinny 20mm.",
                        Precio = 79990m,
                        Stock = 22,
                        Id_Categoria = catAccesorios,
                        RestriccionEdad = 18,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "RD-8841-X"
                    },
                    new Producto
                    {
                        Nombre = "Binoculares Militares Mil-Dot 10x50 Impermeables",
                        Descripcion = "Prismas BaK-4 con brújula telemétrica integrada, purgados con nitrógeno antiniebla para observación a larga distancia.",
                        Precio = 89990m,
                        Stock = 15,
                        Id_Categoria = catAccesorios,
                        RestriccionEdad = 0,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "BIN-MLD-012"
                    },
                    new Producto
                    {
                        Nombre = "Torniquete Táctico CAT Gen 7 Original",
                        Descripcion = "Torniquete de control de hemorragias exanguinantes con varilla de molinete reforzada y banda de registro de hora.",
                        Precio = 22500m,
                        Stock = 85,
                        Id_Categoria = catAccesorios,
                        RestriccionEdad = 0,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "TOR-CAT-014"
                    },
                    new Producto
                    {
                        Nombre = "Pistola Traumática Revolver Ekol Viper 2.5\"",
                        Descripcion = "Revólver de fogueo y proyectil traumático de goma no letal calibre 9mm PAK, tambor de 6 alvéolos con acabado pavonado.",
                        Precio = 245000m,
                        Stock = 6,
                        Id_Categoria = catDefensa,
                        RestriccionEdad = 18,
                        RequierePermiso = true,
                        SoloPersonalAutorizado = true,
                        NumeroSerie = "EV-9902-TR"
                    },
                    new Producto
                    {
                        Nombre = "Linterna Taser Eléctrica Policial Recargable",
                        Descripcion = "Dispositivo de inmovilización electroshock de 5000 kV con linterna estroboscópica y seguro contra autodescarga.",
                        Precio = 28990m,
                        Stock = 19,
                        Id_Categoria = catDefensa,
                        RestriccionEdad = 18,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "TAS-REC-017"
                    },
                    new Producto
                    {
                        Nombre = "Gas Pimienta Sabre Red Policial Spray 110g",
                        Descripcion = "Spray de gas pimienta OC fórmula militar con tinte UV para marcaje de agresores y alcance balístico de hasta 4 metros.",
                        Precio = 16990m,
                        Stock = 75,
                        Id_Categoria = catDefensa,
                        RestriccionEdad = 18,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "GAS-SAB-018"
                    },
                    new Producto
                    {
                        Nombre = "Bastón Retráctil Táctico de Acero Endurecido 26\"",
                        Descripcion = "Bastón extensible de aleación de acero templado con empuñadura de goma antideslizante y funda para cinto policial.",
                        Precio = 29990m,
                        Stock = 25,
                        Id_Categoria = catDefensa,
                        RestriccionEdad = 18,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "BAS-RET-019"
                    },
                    new Producto
                    {
                        Nombre = "Fusil Airsoft M4A1 Carabina AEG Full Metal Specna Arms",
                        Descripcion = "Réplica eléctrica de alta fidelidad, gearbox reforzado V2 con cambio rápido de resorte Enter & Convert, 380 FPS.",
                        Precio = 239990m,
                        Stock = 8,
                        Id_Categoria = catAirsoft,
                        RestriccionEdad = 18,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "SA-M4-027"
                    },
                    new Producto
                    {
                        Nombre = "Pistola Airsoft Glock 17 Gen 5 GBB Blowback Umarex",
                        Descripcion = "Réplica oficial licenciada por Glock con corredera metálica CNC, retroceso realista Gas Blowback y cargador de 22 BBs.",
                        Precio = 169990m,
                        Stock = 12,
                        Id_Categoria = catAirsoft,
                        RestriccionEdad = 18,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "UMX-G17-028"
                    },
                    new Producto
                    {
                        Nombre = "Rifle Sniper Airsoft L96 Resorte de Alta Precisión",
                        Descripcion = "Fusil de francotirador de cerrojo accionado por muelle, cañón estriado de precisión, culata ergonómica y 450 FPS.",
                        Precio = 189990m,
                        Stock = 5,
                        Id_Categoria = catAirsoft,
                        RestriccionEdad = 18,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "MB-L96-029"
                    },
                    new Producto
                    {
                        Nombre = "Subfusil Airsoft MP5A5 Tactical Blowback Cyma",
                        Descripcion = "Subfusil compacto con culata retráctil de 3 posiciones, selector de tiro semi y automático, ideal para combate CQB.",
                        Precio = 199990m,
                        Stock = 7,
                        Id_Categoria = catAirsoft,
                        RestriccionEdad = 18,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "CYM-MP5-030"
                    },
                    new Producto
                    {
                        Nombre = "Balines Airsoft 0.25g Biodegradables Bolsa 4000 BBs",
                        Descripcion = "Munición esférica de precisión pulida 5.95mm +/- 0.01mm, formulación biodegradable respetuosa con el medio ambiente.",
                        Precio = 15990m,
                        Stock = 120,
                        Id_Categoria = catAirsoft,
                        RestriccionEdad = 0,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "BAL-BIO-031"
                    },
                    new Producto
                    {
                        Nombre = "Gas Green Gas Airsoft Puff Dino 1000ml Lubricado",
                        Descripcion = "Gas propulsor de alto rendimiento a presión constante con lubricante de silicona añadido para protección de válvulas y sellos.",
                        Precio = 13990m,
                        Stock = 85,
                        Id_Categoria = catAirsoft,
                        RestriccionEdad = 0,
                        RequierePermiso = false,
                        SoloPersonalAutorizado = false,
                        NumeroSerie = "GAS-PUF-032"
                    }
                );
                context.SaveChanges();
            }

            // 5. Sembrado de Tipos de Servicio de Taller y Armería
            if (!context.TiposServicio.Any())
            {
                context.TiposServicio.AddRange(
                    new TipoServicio { Nombre = "Mantención Preventiva y Limpieza de Fusil/AEG", CostoBase = 25000m, TiempoEstimadoDias = 2 },
                    new TipoServicio { Nombre = "Calibración de Miras Ópticas y Red Dot", CostoBase = 15000m, TiempoEstimadoDias = 1 },
                    new TipoServicio { Nombre = "Reparación de Gearbox, Motor y Cambio de Resorte", CostoBase = 35000m, TiempoEstimadoDias = 3 },
                    new TipoServicio { Nombre = "Bordado y Parches Tácticos Personalizados", CostoBase = 12000m, TiempoEstimadoDias = 2 },
                    new TipoServicio { Nombre = "Ajuste de Holster y Funda Kydex a Medida", CostoBase = 18000m, TiempoEstimadoDias = 2 }
                );
                context.SaveChanges();
            }

            // 6. Sembrado de Pedidos iniciales para sincronización de paneles
            if (!context.Pedidos.Any())
            {
                var cliente = context.Usuarios.FirstOrDefault(u => u.Correo == "cliente@bufalos.cl");
                var primerProducto = context.Productos.FirstOrDefault();
                if (cliente != null && primerProducto != null)
                {
                    var pedidoDemo = new Pedido
                    {
                        Id_Usuario = cliente.Id_Usuario,
                        FechaPedido = DateTime.UtcNow.AddHours(-3),
                        EstadoPedido = "Pendiente",
                        MetodoEntrega = "Starken",
                        DireccionEnvio = "Av. Providencia 1245, Depto 402, Santiago",
                        Total = primerProducto.Precio * 2
                    };
                    context.Pedidos.Add(pedidoDemo);
                    context.SaveChanges();

                    context.DetallePedidos.Add(new DetallePedido
                    {
                        Id_Pedido = pedidoDemo.Id_Pedido,
                        Id_Producto = primerProducto.Id_Producto,
                        Cantidad = 2,
                        PrecioUnitario = primerProducto.Precio
                    });
                    context.SaveChanges();
                }
            }

            // 7. Sembrado de Órdenes de Servicio Técnico de demostración
            if (!context.OrdenesServicio.Any())
            {
                var cliente = context.Usuarios.FirstOrDefault(u => u.Correo == "cliente@bufalos.cl");
                var tecnico = context.Usuarios.FirstOrDefault(u => u.Correo == "tecnico@bufalos.cl");
                var tipoServ = context.TiposServicio.FirstOrDefault();

                if (cliente != null && tipoServ != null)
                {
                    context.OrdenesServicio.AddRange(
                        new OrdenServicio
                        {
                            Id_Cliente = cliente.Id_Usuario,
                            Id_TecnicoAsignado = tecnico?.Id_Usuario,
                            Id_TipoServicio = tipoServ.Id_TipoServicio,
                            FechaIngreso = DateTime.UtcNow.AddDays(-1),
                            FechaEstimadaEntrega = DateTime.UtcNow.AddDays(2),
                            Estado = "En Proceso",
                            DescripcionProblemaOrItem = "Fusil M4 AEG con pérdida de compresión en hop-up y lubricación de engranajes.",
                            CostoTotal = tipoServ.CostoBase + 5000m
                        },
                        new OrdenServicio
                        {
                            Id_Cliente = cliente.Id_Usuario,
                            Id_TecnicoAsignado = tecnico?.Id_Usuario,
                            Id_TipoServicio = tipoServ.Id_TipoServicio,
                            FechaIngreso = DateTime.UtcNow.AddDays(-3),
                            FechaEstimadaEntrega = DateTime.UtcNow.AddDays(-1),
                            Estado = "Finalizado",
                            DescripcionProblemaOrItem = "Bordado de 6 parches tácticos de velcro con escudo de Búfalos e indicativo de grupo sanguíneo O+.",
                            CostoTotal = 24000m
                        }
                    );
                    context.SaveChanges();
                }
            }
            // 8. Sembrado de Proveedores (TB_Proveedores - Trabajo y Base de Datos)
            if (!context.Proveedores.Any())
            {
                context.Proveedores.AddRange(
                    new Proveedor
                    {
                        NombreEmpresa = "Suministros Tácticos SpA",
                        Contacto = "Roberto Fernández",
                        Telefono = "+56912345678",
                        Correo = "contacto@suministrostacticos.cl"
                    },
                    new Proveedor
                    {
                        NombreEmpresa = "Importadora Defensiva S.A.",
                        Contacto = "Andrea Morales",
                        Telefono = "+56987654321",
                        Correo = "ventas@defensiva.cl"
                    },
                    new Proveedor
                    {
                        NombreEmpresa = "Bordados y Textil Ltda.",
                        Contacto = "Gonzalo Soto",
                        Telefono = "+56955554444",
                        Correo = "contacto@bordadostextil.cl"
                    }
                );
                context.SaveChanges();
            }

            // 9. Sembrado de Proveedores-Productos (TB_ProveedoresProductos)
            if (!context.ProveedoresProductos.Any())
            {
                var prov1 = context.Proveedores.FirstOrDefault();
                var prods = context.Productos.Take(5).ToList();
                if (prov1 != null && prods.Any())
                {
                    foreach (var prod in prods)
                    {
                        context.ProveedoresProductos.Add(new ProveedorProducto
                        {
                            Id_Proveedor = prov1.Id_Proveedor,
                            Id_Producto = prod.Id_Producto
                        });
                    }
                    context.SaveChanges();
                }
            }

            // 10. Sembrado de Permisos y Licencias de Usuarios (TB_PermisosUsuarios)
            if (!context.PermisosUsuarios.Any())
            {
                var cliente = context.Usuarios.FirstOrDefault(u => u.Correo == "cliente@bufalos.cl");
                var admin = context.Usuarios.FirstOrDefault(u => u.Correo == "admin@bufalos.cl");

                if (cliente != null)
                {
                    context.PermisosUsuarios.Add(new PermisoUsuario
                    {
                        Id_Usuario = cliente.Id_Usuario,
                        TipoPermiso = "Acreditación Balística y Defensa",
                        NumeroDocumento = "DGMN-CH-88492",
                        FechaExpiracion = DateTime.UtcNow.AddYears(2),
                        Estado = "Aprobado"
                    });
                }

                if (admin != null)
                {
                    context.PermisosUsuarios.Add(new PermisoUsuario
                    {
                        Id_Usuario = admin.Id_Usuario,
                        TipoPermiso = "Licencia de Armero y Distribuidor",
                        NumeroDocumento = "ARM-SCL-0012",
                        FechaExpiracion = DateTime.UtcNow.AddYears(3),
                        Estado = "Aprobado"
                    });
                }
                context.SaveChanges();
            }

            // 11. Sembrado de Detalles de Parches Personalizados (TB_DetallesParchesCustom)
            if (!context.DetallesParchesCustom.Any())
            {
                var ordenBordado = context.OrdenesServicio.FirstOrDefault(o => o.DescripcionProblemaOrItem.Contains("parches"));
                if (ordenBordado != null)
                {
                    context.DetallesParchesCustom.Add(new DetalleParcheCustom
                    {
                        Id_OrdenServicio = ordenBordado.Id_OrdenServicio,
                        TextoPersonalizado = "BÚFALOS TACTICAL O+",
                        Dimensiones = "8x5 cm",
                        TipoBordado = "Velcro Mil-Spec Alta Densidad",
                        Cantidad = 6,
                        ObservacionesDiseno = "Fondo coyote con letras en negro mate y ribete perimetral."
                    });
                    context.SaveChanges();
                }
            }

        }
    }
}
