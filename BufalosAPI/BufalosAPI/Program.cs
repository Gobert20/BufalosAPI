using System.Text;
using System.Threading.RateLimiting;
using BufalosAPI.Data;
using BufalosAPI.Endpoints;
using BufalosAPI.Middlewares;
using BufalosAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Configurar puertos explícitos de desarrollo (51800 HTTP y 51799 HTTPS)
if (!builder.Environment.IsEnvironment("Testing"))
{
    builder.WebHost.UseUrls("http://localhost:51800", "https://localhost:51799");
}

// 1. Configurar Entity Framework con soporte para SQL Server y modo en memoria (fallback para demostración)
builder.Services.AddDbContext<BufalosDbContext>(options =>
{
    var useInMemory = builder.Configuration.GetValue<bool>("UseInMemoryDatabase");
    if (builder.Environment.IsEnvironment("Testing") || useInMemory)
    {
        options.UseInMemoryDatabase("Bufalos_InMemory_Db");
    }
    else
    {
        var conn = builder.Configuration.GetConnectionString("DefaultConnection")
            ?? "Server=.;Database=Bufalos_DB;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;";
        options.UseSqlServer(conn);
    }
});

// 2. Registrar el servicio de autenticación
builder.Services.AddScoped<AuthService>();

// 3. Configurar CORS restringido a orígenes explícitos del frontend (OWASP API8)
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendCorsPolicy", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "https://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:4173"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// 4. Rate Limiting para mitigar fuerza bruta (OWASP API4)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("login-limiter", opt =>
    {
        opt.PermitLimit = builder.Environment.IsEnvironment("Testing") ? 1000 : 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
});

// 5. Configurar la seguridad JWT
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
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "BufalosApi",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "BufalosClient",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,
        RoleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    };
});

// 6. Configurar Políticas de Autorización por Rol (OWASP API5)
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin", "Administrador"));
    options.AddPolicy("ClienteOrAdmin", policy => policy.RequireRole("Admin", "Administrador", "Cliente", "Técnico", "Tecnico"));
    options.AddPolicy("TecnicoOrAdmin", policy => policy.RequireRole("Admin", "Administrador", "Técnico", "Tecnico"));
});

// 7. OpenAPI / Scalar
builder.Services.AddOpenApi();

var app = builder.Build();

// 8. Inicialización y sembrado seguro de la base de datos
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<BufalosDbContext>();
    var auth = scope.ServiceProvider.GetRequiredService<AuthService>();
    DbInitializer.Initialize(db, auth);
}
catch (Exception ex)
{
    app.Logger.LogWarning(ex, "Advertencia al inicializar la base de datos.");
}

// 9. Middleware propio para captura de errores y auditoría sin fugas (OWASP API8)
app.UseMiddleware<ErrorAndLoggingMiddleware>();

// 10. Cabeceras de seguridad HTTP (OWASP API8 / Web Top 10)
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

// 11. CORS y Rate Limiting
app.UseCors("FrontendCorsPolicy");
app.UseRateLimiter();

// 12. OpenAPI en desarrollo
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Title = "Búfalos API RESTful";
        options.Theme = ScalarTheme.Purple;
    });
}

if (!app.Environment.IsDevelopment() && !app.Environment.IsEnvironment("Testing"))
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

// 13. Mapeo de Minimal APIs
app.MapUsuarioApi();
app.MapProductoApi();
app.MapCategoriaApi();
app.MapPedidoApi();
app.MapServicioTecnicoApi();
app.MapProveedorApi();

app.Run();

// Permitir acceso a la clase Program en pruebas de integración
public partial class Program { }