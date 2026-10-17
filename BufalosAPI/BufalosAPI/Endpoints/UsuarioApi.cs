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

            // POST: Registro de usuario
            usuarios.MapPost("/registro", async (RegistroRequest req, BufalosDbContext db, AuthService auth) =>
            {
                if (string.IsNullOrWhiteSpace(req.NombreCompleto) || string.IsNullOrWhiteSpace(req.Correo) || string.IsNullOrWhiteSpace(req.Password))
                {
                    return Results.BadRequest(new { error = "Todos los campos obligatorios deben completarse." });
                }

                var yaExiste = await db.Usuarios.AnyAsync(u => u.Correo == req.Correo);
                if (yaExiste)
                {
                    return Results.BadRequest(new { error = "El correo ya se encuentra registrado." });
                }

                var nuevoUsuario = new Usuario
                {
                    NombreCompleto = req.NombreCompleto.Trim(),
                    Correo = req.Correo.Trim().ToLower(),
                    ContrasenaHash = auth.HashPassword(req.Password),
                    Id_Rol = req.Id_Rol <= 0 ? 2 : req.Id_Rol, // Rol Cliente por defecto
                    FechaNacimiento = req.FechaNacimiento == default ? DateTime.UtcNow.AddYears(-20) : req.FechaNacimiento,
                    EsVerificado = req.EsVerificado,
                    FechaCreacion = DateTime.UtcNow
                };

                db.Usuarios.Add(nuevoUsuario);
                await db.SaveChangesAsync();

                var rolObj = await db.Roles.FindAsync(nuevoUsuario.Id_Rol);

                return Results.Created($"/api/v1/usuarios/{nuevoUsuario.Id_Usuario}", new
                {
                    id = nuevoUsuario.Id_Usuario,
                    nombre = nuevoUsuario.NombreCompleto,
                    correo = nuevoUsuario.Correo,
                    rol = rolObj?.Nombre ?? "Cliente"
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
            int Id_Rol,
            DateTime FechaNacimiento,
            bool EsVerificado
        );

        public record LoginRequest(string Correo, string Password);
    }
}