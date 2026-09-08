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

            // POST: Registro de usuario usando el DTO unificado
            usuarios.MapPost("/registro", async (RegistroRequest req, BufalosDbContext db, AuthService auth) =>
            {
                var nuevoUsuario = new Usuario
                {
                    NombreCompleto = req.NombreCompleto,
                    Correo = req.Correo,
                    ContrasenaHash = auth.HashPassword(req.Password),
                    Id_Rol = req.Id_Rol,
                    FechaNacimiento = req.FechaNacimiento,
                    EsVerificado = req.EsVerificado,
                    FechaCreacion = DateTime.UtcNow
                };

                db.Usuarios.Add(nuevoUsuario);
                await db.SaveChangesAsync();

                return Results.Created($"/api/usuarios/{nuevoUsuario.Id_Usuario}", new
                {
                    nuevoUsuario.Id_Usuario,
                    nuevoUsuario.NombreCompleto,
                    nuevoUsuario.Correo,
                    nuevoUsuario.Id_Rol
                });
            });

            // POST: Login y generación de Token JWT
            usuarios.MapPost("/login", async (LoginRequest login, BufalosDbContext db, AuthService auth, IConfiguration config) =>
            {
                var usuario = await db.Usuarios
                    .Include(u => u.Rol)
                    .FirstOrDefaultAsync(u => u.Correo == login.Correo);

                if (usuario is null || !auth.VerifyPassword(login.Password, usuario.ContrasenaHash))
                    return Results.Unauthorized();

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, usuario.Id_Usuario.ToString()),
                    new Claim(ClaimTypes.Name, usuario.NombreCompleto),
                    new Claim(ClaimTypes.Email, usuario.Correo),
                    new Claim(ClaimTypes.Role, usuario.Rol?.Nombre ?? "Cliente")
                };

                var jwtKey = config["Jwt:Key"]!;
                var jwtIssuer = config["Jwt:Issuer"]!;
                var jwtAudience = config["Jwt:Audience"]!;

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var credenciales = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: jwtIssuer,
                    audience: jwtAudience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddHours(2),
                    signingCredentials: credenciales
                );

                return Results.Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
            });
        }

        // DTOs para solicitudes limpias
        record RegistroRequest(
            string NombreCompleto,
            string Correo,
            string Password,
            int Id_Rol,
            DateTime FechaNacimiento,
            bool EsVerificado
        );

        record LoginRequest(string Correo, string Password);
    }
}