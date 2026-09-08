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

            // GET: Consultar productos
            productos.MapGet("/", async (BufalosDbContext db) =>
            {
                var lista = await db.Productos.ToListAsync();
                return Results.Ok(lista);
            });

            // GET: Producto por ID
            productos.MapGet("/{id:int}", async (int id, BufalosDbContext db) =>
            {
                var producto = await db.Productos.FindAsync(id);
                return producto is not null ? Results.Ok(producto) : Results.NotFound(new { Mensaje = "Producto no encontrado." });
            });

            // POST: Crear producto (requiere autenticación)
            productos.MapPost("/", async (Producto producto, BufalosDbContext db) =>
            {
                db.Productos.Add(producto);
                await db.SaveChangesAsync();
                return Results.Created($"/api/productos/{producto.Id_Producto}", producto);
            })
            .RequireAuthorization();

            // DELETE: Eliminar producto (requiere autenticación)
            productos.MapDelete("/{id:int}", async (int id, BufalosDbContext db) =>
            {
                var producto = await db.Productos.FindAsync(id);
                if (producto is null) return Results.NotFound();

                db.Productos.Remove(producto);
                await db.SaveChangesAsync();
                return Results.NoContent();
            })
            .RequireAuthorization();
        }
    }
}