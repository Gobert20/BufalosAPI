using BufalosAPI.Data;
using BufalosAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BufalosAPI.Endpoints
{
    public static class ServicioTecnicoApi
    {
        public static void MapServicioTecnicoApi(this WebApplication app)
        {
            var servicios = app.MapGroup("/api/v1/servicios-tecnicos").WithTags("ServiciosTecnicos");

            // GET: Tipos de servicio disponibles
            servicios.MapGet("/tipos", async (BufalosDbContext db) =>
            {
                var tipos = await db.TiposServicio.ToListAsync();
                return Results.Ok(tipos);
            });

            // GET: Listado de órdenes de servicio técnico para Panel Técnico y Admin
            servicios.MapGet("/", async (BufalosDbContext db) =>
            {
                var ordenes = await db.OrdenesServicio
                    .Include(o => o.Cliente)
                    .Include(o => o.TecnicoAsignado)
                    .Include(o => o.TipoServicio)
                    .OrderByDescending(o => o.FechaIngreso)
                    .ToListAsync();

                var listado = ordenes.Select(o => new
                {
                    id_OrdenServicio = o.Id_OrdenServicio,
                    id_Cliente = o.Id_Cliente,
                    clienteNombre = o.Cliente != null ? o.Cliente.NombreCompleto : "Cliente General",
                    clienteCorreo = o.Cliente != null ? o.Cliente.Correo : "",
                    id_TecnicoAsignado = o.Id_TecnicoAsignado,
                    tecnicoNombre = o.TecnicoAsignado != null ? o.TecnicoAsignado.NombreCompleto : "Sin Asignar",
                    id_TipoServicio = o.Id_TipoServicio,
                    tipoServicioNombre = o.TipoServicio != null ? o.TipoServicio.Nombre : "Servicio General",
                    fechaIngreso = o.FechaIngreso,
                    fechaEstimadaEntrega = o.FechaEstimadaEntrega,
                    estado = o.Estado,
                    descripcionProblemaOrItem = o.DescripcionProblemaOrItem,
                    costoTotal = o.CostoTotal,
                    detalleParche = db.DetallesParchesCustom
                        .Where(dp => dp.Id_OrdenServicio == o.Id_OrdenServicio)
                        .Select(dp => new
                        {
                            textoPersonalizado = dp.TextoPersonalizado,
                            dimensiones = dp.Dimensiones,
                            tipoBordado = dp.TipoBordado,
                            cantidad = dp.Cantidad,
                            observacionesDiseno = dp.ObservacionesDiseno
                        }).FirstOrDefault()
                }).ToList();

                return Results.Ok(listado);
            });

            // GET: Mis Servicios Técnicos (Historial detallado para el Cliente autenticado)
            servicios.MapGet("/mis-servicios", async (int? idUsuario, string? correo, BufalosDbContext db) =>
            {
                var query = db.OrdenesServicio
                    .Include(o => o.Cliente)
                    .Include(o => o.TecnicoAsignado)
                    .Include(o => o.TipoServicio)
                    .AsQueryable();

                if (idUsuario.HasValue && idUsuario.Value > 0)
                {
                    query = query.Where(o => o.Id_Cliente == idUsuario.Value);
                }
                else if (!string.IsNullOrWhiteSpace(correo))
                {
                    var cLimpio = correo.Trim().ToLowerInvariant();
                    query = query.Where(o => o.Cliente != null && o.Cliente.Correo.ToLower() == cLimpio);
                }

                var ordenes = await query
                    .OrderByDescending(o => o.FechaIngreso)
                    .ToListAsync();

                var listado = ordenes.Select(o => new
                {
                    id_OrdenServicio = o.Id_OrdenServicio,
                    id_Cliente = o.Id_Cliente,
                    clienteNombre = o.Cliente != null ? o.Cliente.NombreCompleto : "Cliente",
                    clienteCorreo = o.Cliente != null ? o.Cliente.Correo : "",
                    id_TecnicoAsignado = o.Id_TecnicoAsignado,
                    tecnicoNombre = o.TecnicoAsignado != null ? o.TecnicoAsignado.NombreCompleto : "En asignación",
                    id_TipoServicio = o.Id_TipoServicio,
                    tipoServicioNombre = o.TipoServicio != null ? o.TipoServicio.Nombre : "Servicio Técnico",
                    fechaIngreso = o.FechaIngreso,
                    fechaEstimadaEntrega = o.FechaEstimadaEntrega,
                    estado = o.Estado,
                    descripcionProblemaOrItem = o.DescripcionProblemaOrItem,
                    costoTotal = o.CostoTotal,
                    detalleParche = db.DetallesParchesCustom
                        .Where(dp => dp.Id_OrdenServicio == o.Id_OrdenServicio)
                        .Select(dp => new
                        {
                            textoPersonalizado = dp.TextoPersonalizado,
                            dimensiones = dp.Dimensiones,
                            tipoBordado = dp.TipoBordado,
                            cantidad = dp.Cantidad,
                            observacionesDiseno = dp.ObservacionesDiseno
                        }).FirstOrDefault()
                }).ToList();

                return Results.Ok(listado);
            });

            // POST: Creación de nueva orden de servicio / ticket (Tanto por Cliente como por Técnico)
            servicios.MapPost("/", async (CrearOrdenServicioRequest req, BufalosDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(req.DescripcionProblemaOrItem))
                {
                    return Results.BadRequest(new { error = "La descripción del problema o trabajo requerido es obligatoria." });
                }

                // Resolver cliente
                Usuario? cliente = null;
                if (req.Id_Cliente.HasValue && req.Id_Cliente.Value > 0)
                {
                    cliente = await db.Usuarios.FindAsync(req.Id_Cliente.Value);
                }
                if (cliente == null && !string.IsNullOrWhiteSpace(req.ClienteCorreo))
                {
                    var cLimpio = req.ClienteCorreo.Trim().ToLowerInvariant();
                    cliente = await db.Usuarios.FirstOrDefaultAsync(u => u.Correo.ToLower() == cLimpio);
                }
                if (cliente == null)
                {
                    cliente = await db.Usuarios.FirstOrDefaultAsync(u => u.Rol != null && u.Rol.Nombre == "Cliente")
                              ?? await db.Usuarios.FirstOrDefaultAsync();
                }

                if (cliente == null)
                {
                    return Results.BadRequest(new { error = "No fue posible asociar el cliente para el ticket de servicio." });
                }

                var tipo = await db.TiposServicio.FindAsync(req.Id_TipoServicio);
                var costoFinal = req.CostoTotal > 0 ? req.CostoTotal : (tipo?.CostoBase ?? 25000m);

                // Resolver técnico asignado
                Usuario? tecnico = null;
                if (req.Id_TecnicoAsignado.HasValue && req.Id_TecnicoAsignado.Value > 0)
                {
                    tecnico = await db.Usuarios.FindAsync(req.Id_TecnicoAsignado.Value);
                }
                if (tecnico == null)
                {
                    tecnico = await db.Usuarios.FirstOrDefaultAsync(u => u.Rol != null && (u.Rol.Nombre == "Técnico" || u.Rol.Nombre == "Tecnico"));
                }

                var nuevaOrden = new OrdenServicio
                {
                    Id_Cliente = cliente.Id_Usuario,
                    Id_TecnicoAsignado = tecnico?.Id_Usuario,
                    Id_TipoServicio = req.Id_TipoServicio > 0 ? req.Id_TipoServicio : (tipo?.Id_TipoServicio ?? 1),
                    FechaIngreso = DateTime.UtcNow,
                    FechaEstimadaEntrega = req.FechaEstimadaEntrega ?? DateTime.UtcNow.AddDays(tipo?.TiempoEstimadoDias ?? 3),
                    Estado = string.IsNullOrWhiteSpace(req.Estado) ? "Recibido" : req.Estado.Trim(),
                    DescripcionProblemaOrItem = req.DescripcionProblemaOrItem.Trim(),
                    CostoTotal = costoFinal
                };

                db.OrdenesServicio.Add(nuevaOrden);
                await db.SaveChangesAsync();

                // Si incluye detalles de parche customizado (TB_DetallesParchesCustom)
                if (!string.IsNullOrWhiteSpace(req.TextoParche) || !string.IsNullOrWhiteSpace(req.DimensionesParche))
                {
                    var parche = new DetalleParcheCustom
                    {
                        Id_OrdenServicio = nuevaOrden.Id_OrdenServicio,
                        TextoPersonalizado = req.TextoParche?.Trim(),
                        Dimensiones = string.IsNullOrWhiteSpace(req.DimensionesParche) ? "8x5 cm" : req.DimensionesParche.Trim(),
                        TipoBordado = string.IsNullOrWhiteSpace(req.TipoBordado) ? "Velcro Táctico" : req.TipoBordado.Trim(),
                        Cantidad = req.CantidadParches > 0 ? req.CantidadParches : 1,
                        ObservacionesDiseno = req.ObservacionesParche?.Trim()
                    };
                    db.DetallesParchesCustom.Add(parche);
                    await db.SaveChangesAsync();
                }

                return Results.Created($"/api/v1/servicios-tecnicos/{nuevaOrden.Id_OrdenServicio}", new
                {
                    id_OrdenServicio = nuevaOrden.Id_OrdenServicio,
                    clienteNombre = cliente.NombreCompleto,
                    tecnicoNombre = tecnico?.NombreCompleto ?? "Sin Asignar",
                    tipoServicioNombre = tipo?.Nombre ?? "Servicio General",
                    fechaIngreso = nuevaOrden.FechaIngreso,
                    estado = nuevaOrden.Estado,
                    costoTotal = nuevaOrden.CostoTotal,
                    descripcion = nuevaOrden.DescripcionProblemaOrItem
                });
            });

            // PUT: Actualización de estado de la orden de servicio
            servicios.MapPut("/{id:int}/estado", async (int id, ActualizarEstadoServicioRequest req, BufalosDbContext db) =>
            {
                var orden = await db.OrdenesServicio.FindAsync(id);
                if (orden == null)
                {
                    return Results.NotFound(new { error = "Orden de servicio no encontrada." });
                }

                if (string.IsNullOrWhiteSpace(req.NuevoEstado))
                {
                    return Results.BadRequest(new { error = "Debe especificar el nuevo estado del servicio." });
                }

                orden.Estado = req.NuevoEstado.Trim();
                await db.SaveChangesAsync();

                return Results.Ok(new
                {
                    id_OrdenServicio = orden.Id_OrdenServicio,
                    estado = orden.Estado,
                    mensaje = "Estado de orden técnica actualizado exitosamente."
                });
            });
        }

        public record CrearOrdenServicioRequest(
            int? Id_Cliente,
            string? ClienteCorreo,
            int? Id_TecnicoAsignado,
            int Id_TipoServicio,
            DateTime? FechaEstimadaEntrega,
            string? Estado,
            string DescripcionProblemaOrItem,
            decimal CostoTotal,
            string? TextoParche = null,
            string? DimensionesParche = null,
            string? TipoBordado = null,
            int CantidadParches = 1,
            string? ObservacionesParche = null
        );

        public record ActualizarEstadoServicioRequest(string NuevoEstado);
    }
}
