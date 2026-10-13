using BufalosAPI.Data;
using BufalosAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BufalosAPI.Endpoints
{
    public static class ProductoApi
    {
        public static void MapProductoApi(this WebApplication app)
        {
            var productos = app.MapGroup("/api/v1/productos").WithTags("Productos");

            // GET: Consultar productos con soporte opcional de búsqueda y filtro por categoría
            productos.MapGet("/", async (string? q, int? categoriaId, BufalosDbContext db) =>
            {
                var query = db.Productos.Include(p => p.Categoria).AsQueryable();

                if (!string.IsNullOrWhiteSpace(q))
                {
                    var search = q.Trim().ToLower();
                    query = query.Where(p => p.Nombre.ToLower().Contains(search) ||
                                             (p.Descripcion != null && p.Descripcion.ToLower().Contains(search)));
                }

                if (categoriaId.HasValue && categoriaId.Value > 0)
                {
                    query = query.Where(p => p.Id_Categoria == categoriaId.Value);
                }

                var lista = await query.OrderBy(p => p.Id_Producto).ToListAsync();
                return Results.Ok(lista);
            });

            // GET: Producto por ID
            productos.MapGet("/{id:int}", async (int id, BufalosDbContext db) =>
            {
                var producto = await db.Productos.Include(p => p.Categoria).FirstOrDefaultAsync(p => p.Id_Producto == id);
                return producto is not null
                    ? Results.Ok(producto)
                    : Results.NotFound(new { mensaje = $"Producto con ID {id} no encontrado." });
            });

            // POST: Crear producto (requiere rol Admin)
            productos.MapPost("/", async (ProductoInputDto input, BufalosDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(input.Nombre))
                {
                    return Results.BadRequest(new { error = "El nombre del producto es obligatorio." });
                }

                if (input.Precio <= 0)
                {
                    return Results.BadRequest(new { error = "El precio debe ser mayor a 0." });
                }

                if (input.Stock < 0)
                {
                    return Results.BadRequest(new { error = "El stock no puede ser negativo." });
                }

                var categoriaExiste = await db.Categorias.AnyAsync(c => c.Id_Categoria == input.Id_Categoria);
                if (!categoriaExiste)
                {
                    return Results.BadRequest(new { error = "La categoría indicada no existe." });
                }

                var nuevoProducto = new Producto
                {
                    Nombre = input.Nombre.Trim(),
                    Descripcion = input.Descripcion?.Trim(),
                    Precio = input.Precio,
                    Stock = input.Stock,
                    Id_Categoria = input.Id_Categoria,
                    RestriccionEdad = input.RestriccionEdad,
                    RequierePermiso = input.RequierePermiso,
                    SoloPersonalAutorizado = input.SoloPersonalAutorizado,
                    NumeroSerie = input.NumeroSerie?.Trim()
                };

                db.Productos.Add(nuevoProducto);
                await db.SaveChangesAsync();

                // Cargar la categoría asociada para la respuesta
                await db.Entry(nuevoProducto).Reference(p => p.Categoria).LoadAsync();

                return Results.Created($"/api/v1/productos/{nuevoProducto.Id_Producto}", nuevoProducto);
            })
            .RequireAuthorization("AdminOnly");

            // PUT: Actualizar producto (requiere rol Admin)
            productos.MapPut("/{id:int}", async (int id, ProductoInputDto input, BufalosDbContext db) =>
            {
                var producto = await db.Productos.FindAsync(id);
                if (producto is null)
                {
                    return Results.NotFound(new { mensaje = $"Producto con ID {id} no encontrado." });
                }

                if (string.IsNullOrWhiteSpace(input.Nombre))
                {
                    return Results.BadRequest(new { error = "El nombre del producto es obligatorio." });
                }

                if (input.Precio <= 0)
                {
                    return Results.BadRequest(new { error = "El precio debe ser mayor a 0." });
                }

                if (input.Stock < 0)
                {
                    return Results.BadRequest(new { error = "El stock no puede ser negativo." });
                }

                var categoriaExiste = await db.Categorias.AnyAsync(c => c.Id_Categoria == input.Id_Categoria);
                if (!categoriaExiste)
                {
                    return Results.BadRequest(new { error = "La categoría indicada no existe." });
                }

                producto.Nombre = input.Nombre.Trim();
                producto.Descripcion = input.Descripcion?.Trim();
                producto.Precio = input.Precio;
                producto.Stock = input.Stock;
                producto.Id_Categoria = input.Id_Categoria;
                producto.RestriccionEdad = input.RestriccionEdad;
                producto.RequierePermiso = input.RequierePermiso;
                producto.SoloPersonalAutorizado = input.SoloPersonalAutorizado;
                producto.NumeroSerie = input.NumeroSerie?.Trim();

                await db.SaveChangesAsync();
                await db.Entry(producto).Reference(p => p.Categoria).LoadAsync();

                return Results.Ok(producto);
            })
            .RequireAuthorization("AdminOnly");

            // DELETE: Eliminar producto (requiere rol Admin)
            productos.MapDelete("/{id:int}", async (int id, BufalosDbContext db) =>
            {
                var producto = await db.Productos.FindAsync(id);
                if (producto is null)
                {
                    return Results.NotFound(new { mensaje = $"Producto con ID {id} no encontrado." });
                }

                db.Productos.Remove(producto);
                await db.SaveChangesAsync();
                return Results.NoContent();
            })
            .RequireAuthorization("AdminOnly");
        }

        public record ProductoInputDto(
            string Nombre,
            string? Descripcion,
            decimal Precio,
            int Stock,
            int Id_Categoria,
            int RestriccionEdad,
            bool RequierePermiso,
            bool SoloPersonalAutorizado,
            string? NumeroSerie
        );
    }
}