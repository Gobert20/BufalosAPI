using BufalosAPI.Data;
using BufalosAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BufalosAPI.Endpoints
{
    public static class ProveedorApi
    {
        public static void MapProveedorApi(this WebApplication app)
        {
            var grupo = app.MapGroup("/api/v1/proveedores").WithTags("Proveedores");

            // GET: Listado de proveedores oficiales
            grupo.MapGet("/", async (BufalosDbContext db) =>
            {
                var listado = await db.Proveedores
                    .Include(p => p.ProveedoresProductos)
                        .ThenInclude(pp => pp.Producto)
                    .Select(p => new
                    {
                        id_Proveedor = p.Id_Proveedor,
                        nombreEmpresa = p.NombreEmpresa,
                        contacto = p.Contacto,
                        telefono = p.Telefono,
                        correo = p.Correo,
                        totalProductosSuministrados = p.ProveedoresProductos.Count,
                        productos = p.ProveedoresProductos.Select(pp => new
                        {
                            id_Producto = pp.Id_Producto,
                            nombre = pp.Producto != null ? pp.Producto.Nombre : "Producto",
                            precio = pp.Producto != null ? pp.Producto.Precio : 0m,
                            stock = pp.Producto != null ? pp.Producto.Stock : 0
                        })
                    })
                    .ToListAsync();

                return Results.Ok(listado);
            });

            // GET /api/v1/proveedores/{id} — Detalle de un proveedor
            grupo.MapGet("/{id:int}", async (int id, BufalosDbContext db) =>
            {
                var proveedor = await db.Proveedores
                    .Include(p => p.ProveedoresProductos)
                        .ThenInclude(pp => pp.Producto)
                    .FirstOrDefaultAsync(p => p.Id_Proveedor == id);

                if (proveedor is null)
                    return Results.NotFound(new { mensaje = $"Proveedor con ID {id} no encontrado." });

                return Results.Ok(new
                {
                    id_Proveedor = proveedor.Id_Proveedor,
                    nombreEmpresa = proveedor.NombreEmpresa,
                    contacto = proveedor.Contacto,
                    telefono = proveedor.Telefono,
                    correo = proveedor.Correo,
                    totalProductosSuministrados = proveedor.ProveedoresProductos.Count,
                    productos = proveedor.ProveedoresProductos.Select(pp => new
                    {
                        id_Producto = pp.Id_Producto,
                        nombre = pp.Producto != null ? pp.Producto.Nombre : "Producto",
                        precio = pp.Producto != null ? pp.Producto.Precio : 0m,
                        stock = pp.Producto != null ? pp.Producto.Stock : 0
                    })
                });
            });

            // Endpoint para Permisos y Licencias de Usuario (TB_PermisosUsuarios)
            app.MapGet("/api/v1/usuarios/{idUsuario:int}/permisos", async (int idUsuario, BufalosDbContext db) =>
            {
                var permisos = await db.PermisosUsuarios
                    .Where(p => p.Id_Usuario == idUsuario)
                    .Select(p => new
                    {
                        id_Permiso = p.Id_Permiso,
                        tipoPermiso = p.TipoPermiso,
                        numeroDocumento = p.NumeroDocumento,
                        fechaExpiracion = p.FechaExpiracion,
                        estado = p.Estado
                    })
                    .ToListAsync();

                return Results.Ok(permisos);
            }).WithTags("PermisosUsuarios");

            // GET /api/v1/productos/{id}/proveedores — Proveedores de un producto
            app.MapGet("/api/v1/productos/{id:int}/proveedores", async (int id, BufalosDbContext db) =>
            {
                var productoExiste = await db.Productos.AnyAsync(p => p.Id_Producto == id);
                if (!productoExiste)
                    return Results.NotFound(new { mensaje = $"Producto con ID {id} no encontrado." });

                var proveedores = await db.ProveedoresProductos
                    .Where(pp => pp.Id_Producto == id)
                    .Include(pp => pp.Proveedor)
                    .Select(pp => new
                    {
                        id_Proveedor = pp.Id_Proveedor,
                        nombreEmpresa = pp.Proveedor != null ? pp.Proveedor.NombreEmpresa : "Proveedor",
                        contacto = pp.Proveedor != null ? pp.Proveedor.Contacto : null,
                        telefono = pp.Proveedor != null ? pp.Proveedor.Telefono : null,
                        correo = pp.Proveedor != null ? pp.Proveedor.Correo : null
                    })
                    .ToListAsync();

                return Results.Ok(proveedores);
            }).WithTags("Proveedores");

            // POST /api/v1/productos/{id}/proveedores — Asociar proveedor a producto (Admin)
            app.MapPost("/api/v1/productos/{id:int}/proveedores", async (int id, AsociarProveedorRequest req, BufalosDbContext db) =>
            {
                var productoExiste = await db.Productos.AnyAsync(p => p.Id_Producto == id);
                if (!productoExiste)
                    return Results.NotFound(new { mensaje = $"Producto con ID {id} no encontrado." });

                var proveedorExiste = await db.Proveedores.AnyAsync(p => p.Id_Proveedor == req.IdProveedor);
                if (!proveedorExiste)
                    return Results.NotFound(new { mensaje = $"Proveedor con ID {req.IdProveedor} no encontrado." });

                var yaAsociado = await db.ProveedoresProductos
                    .AnyAsync(pp => pp.Id_Producto == id && pp.Id_Proveedor == req.IdProveedor);

                if (yaAsociado)
                    return Results.BadRequest(new { error = "El proveedor ya está asociado a este producto." });

                var asociacion = new ProveedorProducto
                {
                    Id_Producto = id,
                    Id_Proveedor = req.IdProveedor
                };

                db.ProveedoresProductos.Add(asociacion);
                await db.SaveChangesAsync();

                return Results.Created($"/api/v1/productos/{id}/proveedores", new
                {
                    id_Producto = id,
                    id_Proveedor = req.IdProveedor,
                    mensaje = "Proveedor asociado al producto exitosamente."
                });
            })
            .RequireAuthorization("AdminOnly")
            .WithTags("Proveedores");

            // DELETE /api/v1/productos/{id}/proveedores/{provId} — Desasociar proveedor (Admin)
            app.MapDelete("/api/v1/productos/{id:int}/proveedores/{provId:int}", async (int id, int provId, BufalosDbContext db) =>
            {
                var asociacion = await db.ProveedoresProductos
                    .FirstOrDefaultAsync(pp => pp.Id_Producto == id && pp.Id_Proveedor == provId);

                if (asociacion is null)
                    return Results.NotFound(new { mensaje = $"No existe asociación entre el producto {id} y el proveedor {provId}." });

                db.ProveedoresProductos.Remove(asociacion);
                await db.SaveChangesAsync();

                return Results.NoContent();
            })
            .RequireAuthorization("AdminOnly")
            .WithTags("Proveedores");
        }

        public record AsociarProveedorRequest(int IdProveedor);
    }
}
