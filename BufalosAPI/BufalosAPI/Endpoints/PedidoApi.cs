using BufalosAPI.Data;
using BufalosAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BufalosAPI.Endpoints
{
    public static class PedidoApi
    {
        public static void MapPedidoApi(this WebApplication app)
        {
            var pedidos = app.MapGroup("/api/v1/pedidos").WithTags("Pedidos");

            // GET: Listado de todos los pedidos con detalle para Panel Técnico y Admin
            pedidos.MapGet("/", async (BufalosDbContext db) =>
            {
                var listado = await db.Pedidos
                    .Include(p => p.Usuario)
                    .Include(p => p.Detalles)
                        .ThenInclude(d => d.Producto)
                    .OrderByDescending(p => p.FechaPedido)
                    .Select(p => new
                    {
                        id_Pedido = p.Id_Pedido,
                        id_Usuario = p.Id_Usuario,
                        clienteNombre = p.Usuario != null ? p.Usuario.NombreCompleto : "Cliente General",
                        clienteCorreo = p.Usuario != null ? p.Usuario.Correo : "",
                        fechaPedido = p.FechaPedido,
                        estadoPedido = p.EstadoPedido,
                        metodoEntrega = p.MetodoEntrega,
                        direccionEnvio = p.DireccionEnvio,
                        total = p.Total,
                        detalles = p.Detalles.Select(d => new
                        {
                            id_DetallePedido = d.Id_DetallePedido,
                            id_Producto = d.Id_Producto,
                            productoNombre = d.Producto != null ? d.Producto.Nombre : "Producto",
                            cantidad = d.Cantidad,
                            precioUnitario = d.PrecioUnitario,
                            subtotal = d.Cantidad * d.PrecioUnitario
                        })
                    })
                    .ToListAsync();

                return Results.Ok(listado);
            });

            // GET: Pedidos del cliente autenticado
            pedidos.MapGet("/mis-pedidos", async (int? idUsuario, string? correo, BufalosDbContext db) =>
            {
                var query = db.Pedidos
                    .Include(p => p.Usuario)
                    .Include(p => p.Detalles)
                        .ThenInclude(d => d.Producto)
                    .AsQueryable();

                if (idUsuario.HasValue && idUsuario.Value > 0)
                {
                    query = query.Where(p => p.Id_Usuario == idUsuario.Value);
                }
                else if (!string.IsNullOrWhiteSpace(correo))
                {
                    var correoLimpio = correo.Trim().ToLowerInvariant();
                    query = query.Where(p => p.Usuario != null && p.Usuario.Correo.ToLower() == correoLimpio);
                }

                var listado = await query
                    .OrderByDescending(p => p.FechaPedido)
                    .Select(p => new
                    {
                        id_Pedido = p.Id_Pedido,
                        fechaPedido = p.FechaPedido,
                        estadoPedido = p.EstadoPedido,
                        metodoEntrega = p.MetodoEntrega,
                        direccionEnvio = p.DireccionEnvio,
                        total = p.Total,
                        detalles = p.Detalles.Select(d => new
                        {
                            id_DetallePedido = d.Id_DetallePedido,
                            id_Producto = d.Id_Producto,
                            productoNombre = d.Producto != null ? d.Producto.Nombre : "Producto",
                            cantidad = d.Cantidad,
                            precioUnitario = d.PrecioUnitario,
                            subtotal = d.Cantidad * d.PrecioUnitario
                        })
                    })
                    .ToListAsync();

                return Results.Ok(listado);
            });

            // POST: Creación de nuevo pedido desde la interfaz del Cliente
            pedidos.MapPost("/", async (CrearPedidoRequest req, BufalosDbContext db) =>
            {
                if (req.Items == null || !req.Items.Any())
                {
                    return Results.BadRequest(new { error = "El pedido debe contener al menos un producto." });
                }

                // Resolver usuario comprador
                Usuario? comprador = null;
                if (req.Id_Usuario.HasValue && req.Id_Usuario.Value > 0)
                {
                    comprador = await db.Usuarios.FindAsync(req.Id_Usuario.Value);
                }
                if (comprador == null && !string.IsNullOrWhiteSpace(req.Correo))
                {
                    var cLimpio = req.Correo.Trim().ToLowerInvariant();
                    comprador = await db.Usuarios.FirstOrDefaultAsync(u => u.Correo.ToLower() == cLimpio);
                }
                if (comprador == null)
                {
                    comprador = await db.Usuarios.FirstOrDefaultAsync(u => u.Rol != null && u.Rol.Nombre == "Cliente")
                                ?? await db.Usuarios.FirstOrDefaultAsync();
                }

                if (comprador == null)
                {
                    return Results.BadRequest(new { error = "No se pudo asociar un cliente válido para el pedido." });
                }

                decimal totalCalculado = 0;
                var detallesToAdd = new List<DetallePedido>();

                foreach (var item in req.Items)
                {
                    if (item.Cantidad <= 0)
                    {
                        return Results.BadRequest(new { error = "La cantidad por producto debe ser mayor a 0." });
                    }

                    var prod = await db.Productos.FindAsync(item.Id_Producto);
                    if (prod == null)
                    {
                        return Results.NotFound(new { error = $"Producto con ID {item.Id_Producto} no encontrado." });
                    }

                    if (prod.Stock < item.Cantidad)
                    {
                        return Results.BadRequest(new
                        {
                            error = $"Stock insuficiente para '{prod.Nombre}'. Stock disponible: {prod.Stock}, solicitado: {item.Cantidad}."
                        });
                    }

                    // Descontar inventario automáticamente
                    prod.Stock -= item.Cantidad;

                    var subtotal = prod.Precio * item.Cantidad;
                    totalCalculado += subtotal;

                    detallesToAdd.Add(new DetallePedido
                    {
                        Id_Producto = prod.Id_Producto,
                        Cantidad = item.Cantidad,
                        PrecioUnitario = prod.Precio
                    });
                }

                var nuevoPedido = new Pedido
                {
                    Id_Usuario = comprador.Id_Usuario,
                    FechaPedido = DateTime.UtcNow,
                    EstadoPedido = "Pendiente",
                    MetodoEntrega = string.IsNullOrWhiteSpace(req.MetodoEntrega) ? "RetiroTienda" : req.MetodoEntrega.Trim(),
                    DireccionEnvio = req.DireccionEnvio?.Trim(),
                    Total = totalCalculado
                };

                db.Pedidos.Add(nuevoPedido);
                await db.SaveChangesAsync();

                foreach (var det in detallesToAdd)
                {
                    det.Id_Pedido = nuevoPedido.Id_Pedido;
                    db.DetallePedidos.Add(det);
                }
                await db.SaveChangesAsync();

                return Results.Created($"/api/v1/pedidos/{nuevoPedido.Id_Pedido}", new
                {
                    id_Pedido = nuevoPedido.Id_Pedido,
                    id_Usuario = nuevoPedido.Id_Usuario,
                    clienteNombre = comprador.NombreCompleto,
                    fechaPedido = nuevoPedido.FechaPedido,
                    estadoPedido = nuevoPedido.EstadoPedido,
                    metodoEntrega = nuevoPedido.MetodoEntrega,
                    direccionEnvio = nuevoPedido.DireccionEnvio,
                    total = nuevoPedido.Total,
                    itemsCount = detallesToAdd.Count
                });
            });

            // PUT: Actualización de estado del pedido (Panel Técnico / Admin)
            pedidos.MapPut("/{id:int}/estado", async (int id, ActualizarEstadoPedidoRequest req, BufalosDbContext db) =>
            {
                var pedido = await db.Pedidos.FindAsync(id);
                if (pedido == null)
                {
                    return Results.NotFound(new { error = "Pedido no encontrado." });
                }

                if (string.IsNullOrWhiteSpace(req.NuevoEstado))
                {
                    return Results.BadRequest(new { error = "Debe especificar el nuevo estado del pedido." });
                }

                pedido.EstadoPedido = req.NuevoEstado.Trim();
                await db.SaveChangesAsync();

                return Results.Ok(new
                {
                    id_Pedido = pedido.Id_Pedido,
                    estadoPedido = pedido.EstadoPedido,
                    mensaje = "Estado de despacho actualizado correctamente."
                });
            });
        }

        public record ItemPedidoDto(int Id_Producto, int Cantidad);
        public record CrearPedidoRequest(
            int? Id_Usuario,
            string? Correo,
            string? MetodoEntrega,
            string? DireccionEnvio,
            List<ItemPedidoDto> Items
        );
        public record ActualizarEstadoPedidoRequest(string NuevoEstado);
    }
}
