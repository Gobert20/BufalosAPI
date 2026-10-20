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
                        nombreCompleto = usuario.NombreCompleto,
                        correo = usuario.Correo,
                        rol = rolNormalizado
                    }
                });
            })
            .RequireRateLimiting("login-limiter");
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
    }
}
