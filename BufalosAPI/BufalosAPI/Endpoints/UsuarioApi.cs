using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BufalosAPI.Data;
using BufalosAPI.Models;
using BufalosAPI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace BufalosAPI.Endpoints
{
    public static class UsuarioApi
    {
        public static void MapUsuarioApi(this WebApplication app)
        {
            var usuarios = app.MapGroup("/api/v1/usuarios").WithTags("Usuarios");

            // GET: Listado de Roles disponibles para registro y asignación
            usuarios.MapGet("/roles", async (BufalosDbContext db) =>
            {
                var roles = await db.Roles
                    .Select(r => new
                    {
                        id_Rol = r.Id_Rol,
                        nombre = r.Nombre
                    })
                    .ToListAsync();
                return Results.Ok(roles);
            });

            // POST: Registro de usuario
            usuarios.MapPost("/registro", async (RegistroRequest req, BufalosDbContext db, AuthService auth) =>
            {
                if (string.IsNullOrWhiteSpace(req.NombreCompleto) || string.IsNullOrWhiteSpace(req.Correo) || string.IsNullOrWhiteSpace(req.Password))
                {
                    return Results.BadRequest(new { error = "Nombre completo, correo y contraseña son obligatorios." });
                }

                if (req.Password.Length < 6)
                {
                    return Results.BadRequest(new { error = "La contraseña debe contener al menos 6 caracteres." });
                }

                var correoLimpio = req.Correo.Trim().ToLowerInvariant();
                var yaExiste = await db.Usuarios.AnyAsync(u => u.Correo.ToLower() == correoLimpio);
                if (yaExiste)
                {
                    return Results.BadRequest(new { error = "El correo electrónico ya se encuentra registrado." });
                }

                // Buscar y resolver el Rol asignado
                Rol? rolAsignado = null;
                if (req.Id_Rol.HasValue && req.Id_Rol.Value > 0)
                {
                    rolAsignado = await db.Roles.FirstOrDefaultAsync(r => r.Id_Rol == req.Id_Rol.Value);
                }

                if (rolAsignado == null && !string.IsNullOrWhiteSpace(req.Rol))
                {
                    var nombreRol = req.Rol.Trim();
                    rolAsignado = await db.Roles.FirstOrDefaultAsync(r =>
                        r.Nombre.ToLower() == nombreRol.ToLower() ||
                        (nombreRol.ToLower() == "administrador" && r.Nombre.ToLower() == "admin") ||
                        (nombreRol.ToLower() == "admin" && r.Nombre.ToLower() == "administrador") ||
                        ((nombreRol.ToLower() == "tecnico" || nombreRol.ToLower() == "técnico") &&
                         (r.Nombre.ToLower() == "tecnico" || r.Nombre.ToLower() == "técnico"))
                    );
                }

                if (rolAsignado == null)
                {
                    // Fallback predeterminado al rol Cliente
                    rolAsignado = await db.Roles.FirstOrDefaultAsync(r => r.Nombre == "Cliente")
                        ?? await db.Roles.FirstOrDefaultAsync();
                }

                var rolIdFinal = rolAsignado?.Id_Rol ?? 2;

                var nuevoUsuario = new Usuario
                {
                    NombreCompleto = req.NombreCompleto.Trim(),
                    Correo = correoLimpio,
                    ContrasenaHash = auth.HashPassword(req.Password),
                    Id_Rol = rolIdFinal,
                    FechaNacimiento = req.FechaNacimiento.HasValue && req.FechaNacimiento.Value != default
                        ? req.FechaNacimiento.Value
                        : DateTime.UtcNow.AddYears(-20),
                    EsVerificado = req.EsVerificado ?? true,
                    EstaBaneado = false,
                    FechaCreacion = DateTime.UtcNow
                };

                db.Usuarios.Add(nuevoUsuario);
                await db.SaveChangesAsync();

                var rolNombreFinal = rolAsignado?.Nombre ?? "Cliente";
                var rolNormalizado = (rolNombreFinal.Equals("Administrador", StringComparison.OrdinalIgnoreCase) || rolNombreFinal.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                    ? "Admin"
                    : rolNombreFinal;

                return Results.Created($"/api/v1/usuarios/{nuevoUsuario.Id_Usuario}", new
                {
                    id = nuevoUsuario.Id_Usuario,
                    id_Usuario = nuevoUsuario.Id_Usuario,
                    nombre = nuevoUsuario.NombreCompleto,
                    correo = nuevoUsuario.Correo,
                    rol = rolNormalizado,
                    id_Rol = nuevoUsuario.Id_Rol
                });
            });

            // POST: Login con JWT y Rate Limiting
            usuarios.MapPost("/login", async (LoginRequest login, BufalosDbContext db, AuthService auth, IConfiguration config) =>
            {
                if (string.IsNullOrWhiteSpace(login.Correo) || string.IsNullOrWhiteSpace(login.Password))
                {
                    return Results.BadRequest(new { error = "Debe proporcionar correo y contraseña." });
                }

                var usuario = await db.Usuarios
                    .Include(u => u.Rol)
                    .FirstOrDefaultAsync(u => u.Correo.ToLower() == login.Correo.Trim().ToLower());

                if (usuario is null || !auth.VerifyPassword(login.Password, usuario.ContrasenaHash))
                {
                    return Results.Unauthorized();
                }

                // Verificar si el usuario está baneado
                if (usuario.EstaBaneado)
                {
                    return Results.Json(new
                    {
                        error = "Tu cuenta ha sido suspendida/baneada y no puede iniciar sesión.",
                        motivo = usuario.MotivoBaneo ?? "Infracción de términos de servicio o políticas de seguridad.",
                        estaBaneado = true
                    }, statusCode: 403);
                }

                var rolDb = usuario.Rol?.Nombre ?? "Cliente";
                var rolNormalizado = (rolDb.Equals("Administrador", StringComparison.OrdinalIgnoreCase) || rolDb.Equals("Admin", StringComparison.OrdinalIgnoreCase)) ? "Admin" : rolDb;

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, usuario.Id_Usuario.ToString()),
                    new Claim(ClaimTypes.Name, usuario.NombreCompleto),
                    new Claim(ClaimTypes.Email, usuario.Correo),
                    new Claim(ClaimTypes.Role, rolNormalizado),
                    new Claim(ClaimTypes.Role, rolDb),
                    new Claim("role", rolNormalizado)
                };

                var jwtKey = config["Jwt:Key"] ?? "BufalosSuperSecretKey2026_ClaveMuySegura32Chars";
                var jwtIssuer = config["Jwt:Issuer"] ?? "BufalosApi";
                var jwtAudience = config["Jwt:Audience"] ?? "BufalosClient";

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var credenciales = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: jwtIssuer,
                    audience: jwtAudience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddHours(4),
                    signingCredentials: credenciales
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

                return Results.Ok(new
                {
                    token = tokenString,
                    usuario = new
                    {
                        id = usuario.Id_Usuario,
                        id_Usuario = usuario.Id_Usuario,
                        nombreCompleto = usuario.NombreCompleto,
                        correo = usuario.Correo,
                        rol = rolNormalizado
                    }
                });
            })
            .RequireRateLimiting("login-limiter");

            // ─────────────────────────────────────────────────────────────────────
            // ENDPOINTS ADMIN — Gestión de usuarios y permisos
            // ─────────────────────────────────────────────────────────────────────

            // GET /api/v1/usuarios — Listado completo de usuarios (Admin)
            usuarios.MapGet("/", async (BufalosDbContext db) =>
            {
                var lista = await db.Usuarios
                    .Include(u => u.Rol)
                    .Include(u => u.Permisos)
                    .OrderBy(u => u.Id_Usuario)
                    .Select(u => new
                    {
                        id = u.Id_Usuario,
                        id_Usuario = u.Id_Usuario,
                        nombreCompleto = u.NombreCompleto,
                        correo = u.Correo,
                        rol = u.Rol != null ? u.Rol.Nombre : "Sin Rol",
                        esVerificado = u.EsVerificado,
                        estaBaneado = u.EstaBaneado,
                        motivoBaneo = u.MotivoBaneo,
                        fechaCreacion = u.FechaCreacion,
                        cantidadPermisos = u.Permisos.Count
                    })
                    .ToListAsync();

                return Results.Ok(lista);
            })
            .RequireAuthorization("AdminOnly");

            // GET /api/v1/usuarios/{id} — Detalle de usuario con permisos (Admin)
            usuarios.MapGet("/{id:int}", async (int id, BufalosDbContext db) =>
            {
                var usuario = await db.Usuarios
                    .Include(u => u.Rol)
                    .Include(u => u.Permisos)
                    .FirstOrDefaultAsync(u => u.Id_Usuario == id);

                if (usuario is null)
                    return Results.NotFound(new { mensaje = $"Usuario con ID {id} no encontrado." });

                return Results.Ok(new
                {
                    id = usuario.Id_Usuario,
                    id_Usuario = usuario.Id_Usuario,
                    nombreCompleto = usuario.NombreCompleto,
                    correo = usuario.Correo,
                    rol = usuario.Rol != null ? usuario.Rol.Nombre : "Sin Rol",
                    esVerificado = usuario.EsVerificado,
                    estaBaneado = usuario.EstaBaneado,
                    motivoBaneo = usuario.MotivoBaneo,
                    fechaCreacion = usuario.FechaCreacion,
                    cantidadPermisos = usuario.Permisos.Count,
                    permisos = usuario.Permisos.Select(p => new
                    {
                        id_Permiso = p.Id_Permiso,
                        id_Usuario = p.Id_Usuario,
                        tipoPermiso = p.TipoPermiso,
                        numeroDocumento = p.NumeroDocumento,
                        fechaExpiracion = p.FechaExpiracion,
                        estado = p.Estado
                    }).ToList()
                });
            })
            .RequireAuthorization("AdminOnly");

            // PUT /api/v1/usuarios/{id}/ban — Banear o desbanear usuario (Admin)
            usuarios.MapPut("/{id:int}/ban", async (int id, BanRequest req, BufalosDbContext db) =>
            {
                var usuario = await db.Usuarios.FindAsync(id);
                if (usuario is null)
                    return Results.NotFound(new { mensaje = $"Usuario con ID {id} no encontrado." });

                usuario.EstaBaneado = req.EsBaneado;
                usuario.MotivoBaneo = req.EsBaneado ? req.MotivoBaneo : null;
                await db.SaveChangesAsync();

                return Results.Ok(new
                {
                    id = usuario.Id_Usuario,
                    id_Usuario = usuario.Id_Usuario,
                    nombreCompleto = usuario.NombreCompleto,
                    estaBaneado = usuario.EstaBaneado,
                    motivoBaneo = usuario.MotivoBaneo,
                    mensaje = req.EsBaneado ? "Usuario baneado exitosamente." : "Baneo del usuario levantado exitosamente."
                });
            })
            .RequireAuthorization("AdminOnly");

            // Helper para otorgar permiso especial
            async Task<IResult> AgregarPermisoEspecial(int id, PermisoEspecialRequest req, BufalosDbContext db)
            {
                var usuario = await db.Usuarios.FindAsync(id);
                if (usuario is null)
                    return Results.NotFound(new { mensaje = $"Usuario con ID {id} no encontrado." });

                var permiso = new PermisoUsuario
                {
                    Id_Usuario = id,
                    TipoPermiso = req.TipoPermiso.Trim(),
                    NumeroDocumento = req.NumeroDocumento.Trim(),
                    FechaExpiracion = req.FechaExpiracion,
                    Estado = string.IsNullOrWhiteSpace(req.Estado) ? "Aprobado" : req.Estado.Trim()
                };

                db.PermisosUsuarios.Add(permiso);
                await db.SaveChangesAsync();

                return Results.Created($"/api/v1/usuarios/{id}/permisos/{permiso.Id_Permiso}", new
                {
                    id_Permiso = permiso.Id_Permiso,
                    id_Usuario = permiso.Id_Usuario,
                    tipoPermiso = permiso.TipoPermiso,
                    numeroDocumento = permiso.NumeroDocumento,
                    fechaExpiracion = permiso.FechaExpiracion,
                    estado = permiso.Estado
                });
            }

            // POST /api/v1/usuarios/{id}/permisos-especiales — Otorgar permiso especial (Admin)
            usuarios.MapPost("/{id:int}/permisos-especiales", async (int id, PermisoEspecialRequest req, BufalosDbContext db) =>
            {
                return await AgregarPermisoEspecial(id, req, db);
            })
            .RequireAuthorization("AdminOnly");

            // PUT /api/v1/usuarios/{id}/permisos-especiales — Compatibilidad PUT para otorgar permiso especial
            usuarios.MapPut("/{id:int}/permisos-especiales", async (int id, PermisoEspecialRequest req, BufalosDbContext db) =>
            {
                return await AgregarPermisoEspecial(id, req, db);
            })
            .RequireAuthorization("AdminOnly");

            // DELETE /api/v1/usuarios/{id}/permisos/{permisoId} — Eliminar/Revocar permiso específico (Admin)
            usuarios.MapDelete("/{id:int}/permisos/{permisoId:int}", async (int id, int permisoId, BufalosDbContext db) =>
            {
                var permiso = await db.PermisosUsuarios
                    .FirstOrDefaultAsync(p => p.Id_Permiso == permisoId && p.Id_Usuario == id);

                if (permiso is null)
                    return Results.NotFound(new { mensaje = $"Permiso con ID {permisoId} no encontrado para el usuario {id}." });

                db.PermisosUsuarios.Remove(permiso);
                await db.SaveChangesAsync();

                return Results.NoContent();
            })
            .RequireAuthorization("AdminOnly");
        }

        public record RegistroRequest(
            string NombreCompleto,
            string Correo,
            string Password,
            int? Id_Rol,
            string? Rol,
            DateTime? FechaNacimiento,
            bool? EsVerificado
        );

        public record LoginRequest(string Correo, string Password);

        public record BanRequest(bool EsBaneado, string? MotivoBaneo);

        public record PermisoEspecialRequest(
            string TipoPermiso,
            string NumeroDocumento,
            DateTime FechaExpiracion,
            string Estado
        );
    }
}
