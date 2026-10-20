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
        }
    }
}
