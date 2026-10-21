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

            // GET: Consultar productos con soporte opcional de busqueda y filtro por categoria
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

            // GET: Estadisticas del inventario, ventas y categorias
            productos.MapGet("/estadisticas", async (BufalosDbContext db) =>
            {
                var categorias = await db.Categorias.ToListAsync();
                var productos = await db.Productos.ToListAsync();

                var totalProductos = productos.Count;
                var totalStock = productos.Sum(p => p.Stock);
                var valorInventario = productos.Sum(p => p.Precio * p.Stock);
                var stockBajoCount = productos.Count(p => p.Stock < 10);
                var stockCriticoCount = productos.Count(p => p.Stock < 5);

                var catDict = categorias.ToDictionary(c => c.Id_Categoria, c => c.Nombre);

                var porCategoria = productos
                    .GroupBy(p => p.Id_Categoria)
                    .Select(g => new
                    {
                        idCategoria = g.Key,
                        nombre = catDict.ContainsKey(g.Key) ? catDict[g.Key] : $"Categoria {g.Key}",
                        totalProductos = g.Count(),
                        stockTotal = g.Sum(p => p.Stock),
                        valorInventario = g.Sum(p => p.Precio * p.Stock)
                    })
                    .OrderByDescending(c => c.valorInventario)
                    .ToList();

                var ventasPorProducto = await db.DetallePedidos
                    .GroupBy(d => d.Id_Producto)
                    .Select(g => new
                    {
                        idProducto = g.Key,
                        cantidadVendida = g.Sum(x => x.Cantidad),
                        totalRecaudado = g.Sum(x => x.Cantidad * x.PrecioUnitario)
                    })
                    .OrderByDescending(x => x.cantidadVendida)
                    .Take(5)
                    .ToListAsync();

                var prodDict = productos.ToDictionary(p => p.Id_Producto, p => p.Nombre);

                var topVendidos = ventasPorProducto.Select(v => new
                {
                    idProducto = v.idProducto,
                    nombre = prodDict.ContainsKey(v.idProducto) ? prodDict[v.idProducto] : $"Producto #{v.idProducto}",
                    cantidadVendida = v.cantidadVendida,
                    totalRecaudado = v.totalRecaudado
                }).ToList();

                var alertasStock = productos
                    .Where(p => p.Stock < 10)
                    .OrderBy(p => p.Stock)
                    .Take(10)
                    .Select(p => new
                    {
                        idProducto = p.Id_Producto,
                        nombre = p.Nombre,
                        categoria = catDict.ContainsKey(p.Id_Categoria) ? catDict[p.Id_Categoria] : "General",
                        stock = p.Stock,
                        precio = p.Precio
                    })
                    .ToList();

                // Facturacion y transacciones comerciales consolidadas
                var totalFacturadoPedidos = await db.Pedidos.SumAsync(p => (decimal?)p.Total) ?? 0m;
                var totalFacturadoServicios = await db.OrdenesServicio.SumAsync(o => (decimal?)o.CostoTotal) ?? 0m;
                var totalFacturado = totalFacturadoPedidos + totalFacturadoServicios;

                var totalPedidos = await db.Pedidos.CountAsync();
                var pedidosPendientesCount = await db.Pedidos.CountAsync(p => p.EstadoPedido == "Pendiente" || p.EstadoPedido == "Creado");
                var totalServicios = await db.OrdenesServicio.CountAsync();
                var serviciosEnProcesoCount = await db.OrdenesServicio.CountAsync(o => o.Estado == "Recibido" || o.Estado == "En Proceso");

                var ultimosPedidos = await db.Pedidos
                    .Include(p => p.Usuario)
                    .OrderByDescending(p => p.FechaPedido)
                    .Take(8)
                    .Select(p => new
                    {
                        id = $"FAC-{p.Id_Pedido:D5}",
                        tipo = "Venta y Despacho",
                        cliente = p.Usuario != null ? p.Usuario.NombreCompleto : "Cliente Registrado",
                        fecha = p.FechaPedido,
                        monto = p.Total,
                        estado = p.EstadoPedido
                    })
                    .ToListAsync();

                var ultimosServicios = await db.OrdenesServicio
                    .Include(o => o.Cliente)
                    .Include(o => o.TipoServicio)
                    .OrderByDescending(o => o.FechaIngreso)
                    .Take(8)
                    .Select(o => new
                    {
                        id = $"SRV-{o.Id_OrdenServicio:D5}",
                        tipo = o.TipoServicio != null ? o.TipoServicio.Nombre : "Servicio Tecnico",
                        cliente = o.Cliente != null ? o.Cliente.NombreCompleto : "Cliente Registrado",
                        fecha = o.FechaIngreso,
                        monto = o.CostoTotal,
                        estado = o.Estado
                    })
                    .ToListAsync();

                var ultimasTransacciones = ultimosPedidos
                    .Concat(ultimosServicios)
                    .OrderByDescending(t => t.fecha)
                    .Take(10)
                    .ToList();

                return Results.Ok(new
                {
                    totalFacturado,
                    totalPedidos,
                    pedidosPendientesCount,
                    totalServicios,
                    serviciosEnProcesoCount,
                    ultimasTransacciones,
                    totalProductos,
                    totalStock,
                    valorInventario,
                    stockBajoCount,
                    stockCriticoCount,
                    porCategoria,
                    topVendidos,
                    alertasStock
                });
            });

            // GET: Producto por ID
            productos.MapGet("/{id:int}", async (int id, BufalosDbContext db) =>
            {
                var producto = await db.Productos.Include(p => p.Categoria).FirstOrDefaultAsync(p => p.Id_Producto == id);
                return producto is not null
                    ? Results.Ok(producto)
                    : Results.NotFound(new { mensaje = $"Producto con ID {id} no encontrado." });
            });

            // POST: Subir archivo de imagen para productos (requiere rol Admin - OWASP API Security)
            productos.MapPost("/upload-imagen", async (IFormFile? file, IWebHostEnvironment env) =>
            {
                if (file == null || file.Length == 0)
                {
                    return Results.BadRequest(new { error = "Debe proporcionar un archivo de imagen valido." });
                }

                // 1. Mitigacion OWASP: Limite estricto de tamano (maximo 5 MB)
                const long maxFileSize = 5 * 1024 * 1024;
                if (file.Length > maxFileSize)
                {
                    return Results.BadRequest(new { error = "El archivo excede el tamano maximo permitido de 5 MB." });
                }

                // 2. Mitigacion OWASP: Lista blanca de extensiones de imagen permitidas
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (string.IsNullOrWhiteSpace(extension) || !allowedExtensions.Contains(extension))
                {
                    return Results.BadRequest(new { error = "Extension no permitida. Solo se admiten archivos JPG, JPEG, PNG, WEBP y GIF." });
                }

                // 3. Mitigacion OWASP: Validacion estricta de Content-Type
                var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
                if (!allowedContentTypes.Contains(file.ContentType.ToLowerInvariant()))
                {
                    return Results.BadRequest(new { error = "El tipo de contenido no corresponde a una imagen valida." });
                }

                // 4. Directorio fisico seguro en wwwroot/uploads/productos
                var webRoot = env.WebRootPath;
                if (string.IsNullOrEmpty(webRoot))
                {
                    webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                }
                var targetDir = Path.Combine(webRoot, "uploads", "productos");
                if (!Directory.Exists(targetDir))
                {
                    Directory.CreateDirectory(targetDir);
                }

                // 5. Nombre de archivo desinfectado mediante GUID criptografico para prevenir Directory Traversal (OWASP)
                var uniqueFileName = $"{Guid.NewGuid():N}{extension}";
                var targetPath = Path.Combine(targetDir, uniqueFileName);

                using (var stream = new FileStream(targetPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var relativeUrl = $"/uploads/productos/{uniqueFileName}";
                return Results.Ok(new
                {
                    url = relativeUrl,
                    nombreArchivo = uniqueFileName,
                    mensaje = "Imagen subida exitosamente."
                });
            })
            .RequireAuthorization("AdminOnly")
            .DisableAntiforgery();

            // POST: Cargar y asociar imagen directamente a un producto existente (requiere rol Admin)
            productos.MapPost("/{id:int}/imagen", async (int id, IFormFile? file, IWebHostEnvironment env, BufalosDbContext db) =>
            {
                var producto = await db.Productos.FindAsync(id);
                if (producto is null)
                {
                    return Results.NotFound(new { mensaje = $"Producto con ID {id} no encontrado." });
                }

                if (file == null || file.Length == 0)
                {
                    return Results.BadRequest(new { error = "Debe proporcionar un archivo de imagen valido." });
                }

                const long maxFileSize = 5 * 1024 * 1024;
                if (file.Length > maxFileSize)
                {
                    return Results.BadRequest(new { error = "El archivo excede el tamano maximo permitido de 5 MB." });
                }

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (string.IsNullOrWhiteSpace(extension) || !allowedExtensions.Contains(extension))
                {
                    return Results.BadRequest(new { error = "Extension no permitida. Solo se admiten archivos JPG, JPEG, PNG, WEBP y GIF." });
                }

                var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
                if (!allowedContentTypes.Contains(file.ContentType.ToLowerInvariant()))
                {
                    return Results.BadRequest(new { error = "El tipo de contenido no corresponde a una imagen valida." });
                }

                var webRoot = env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var targetDir = Path.Combine(webRoot, "uploads", "productos");
                if (!Directory.Exists(targetDir))
                {
                    Directory.CreateDirectory(targetDir);
                }

                var uniqueFileName = $"{Guid.NewGuid():N}{extension}";
                var targetPath = Path.Combine(targetDir, uniqueFileName);

                using (var stream = new FileStream(targetPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                producto.ImagenUrl = $"/uploads/productos/{uniqueFileName}";
                await db.SaveChangesAsync();
                await db.Entry(producto).Reference(p => p.Categoria).LoadAsync();

                return Results.Ok(new
                {
                    mensaje = "Imagen del producto actualizada exitosamente.",
                    imagenUrl = producto.ImagenUrl,
                    producto
                });
            })
            .RequireAuthorization("AdminOnly")
            .DisableAntiforgery();

            // POST: Crear producto (requiere rol Admin)
            productos.MapPost("/", async (CreateProductoDto input, BufalosDbContext db) =>
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
                    return Results.BadRequest(new { error = "La categoria indicada no existe." });
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
                    NumeroSerie = input.NumeroSerie?.Trim(),
                    ImagenUrl = input.ImagenUrl?.Trim()
                };

                db.Productos.Add(nuevoProducto);
                await db.SaveChangesAsync();

                // Cargar la categoria asociada para la respuesta
                await db.Entry(nuevoProducto).Reference(p => p.Categoria).LoadAsync();

                return Results.Created($"/api/v1/productos/{nuevoProducto.Id_Producto}", nuevoProducto);
            })
            .RequireAuthorization("AdminOnly");

            // PUT: Actualizar producto (requiere rol Admin)
            productos.MapPut("/{id:int}", async (int id, UpdateProductoDto input, BufalosDbContext db) =>
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
                    return Results.BadRequest(new { error = "La categoria indicada no existe." });
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
                producto.ImagenUrl = input.ImagenUrl?.Trim();

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
    }

    // DTOs explicitos requeridos para la arquitectura de la API
    public record ProductoDto(
        int Id_Producto,
        string Nombre,
        string? Descripcion,
        decimal Precio,
        int Stock,
        int Id_Categoria,
        int RestriccionEdad,
        bool RequierePermiso,
        bool SoloPersonalAutorizado,
        string? NumeroSerie,
        string? ImagenUrl,
        string? CategoriaNombre
    );

    public record CreateProductoDto(
        string Nombre,
        string? Descripcion,
        decimal Precio,
        int Stock,
        int Id_Categoria,
        int RestriccionEdad,
        bool RequierePermiso,
        bool SoloPersonalAutorizado,
        string? NumeroSerie,
        string? ImagenUrl = null
    );

    public record UpdateProductoDto(
        string Nombre,
        string? Descripcion,
        decimal Precio,
        int Stock,
        int Id_Categoria,
        int RestriccionEdad,
        bool RequierePermiso,
        bool SoloPersonalAutorizado,
        string? NumeroSerie,
        string? ImagenUrl = null
    );

    public record ProductoInputDto(
        string Nombre,
        string? Descripcion,
        decimal Precio,
        int Stock,
        int Id_Categoria,
        int RestriccionEdad,
        bool RequierePermiso,
        bool SoloPersonalAutorizado,
        string? NumeroSerie,
        string? ImagenUrl = null
    );
}
