using System.Text;
using BufalosAPI.Data;
using BufalosAPI.Endpoints;
using BufalosAPI.Middlewares;
using BufalosAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar Entity Framework con SQL Server
builder.Services.AddDbContext<BufalosDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Registrar el servicio de autenticación
builder.Services.AddScoped<AuthService>();

// 3. Configurar la seguridad JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? "BufalosSuperSecretKey2026_ClaveMuySegura32Chars";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true
    };
});

builder.Services.AddAuthorization();

// 4. Configurar OpenAPI nativo de .NET 10
builder.Services.AddOpenApi();

var app = builder.Build();

// 5. REGISTRAR TU MIDDLEWARE PROPIO (Captura errores globales y realiza logging)
app.UseMiddleware<ErrorAndLoggingMiddleware>();

// 6. Middlewares HTTP y Scalar / OpenAPI
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.MapScalarApiReference(options =>
    {
        options.Title = "Búfalos API";
        options.Theme = ScalarTheme.Purple;
    });
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

// 7. Mapear tus Minimal APIs
app.MapUsuarioApi();
app.MapProductoApi();

app.Run();