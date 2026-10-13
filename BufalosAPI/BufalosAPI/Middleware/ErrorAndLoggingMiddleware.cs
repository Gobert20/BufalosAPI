namespace BufalosAPI.Middlewares
{
    public class ErrorAndLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorAndLoggingMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ErrorAndLoggingMiddleware(RequestDelegate next, ILogger<ErrorAndLoggingMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Registra la petición entrante de manera segura (sin volcar tokens ni contraseñas)
                _logger.LogInformation("HTTP {Method} {Path} - RemoteIP: {IP}",
                    context.Request.Method,
                    context.Request.Path,
                    context.Connection.RemoteIpAddress?.ToString() ?? "unknown");

                await _next(context);
            }
            catch (Exception ex)
            {
                // Registra la excepción completa en logs internos del servidor (sin exponerla al cliente)
                _logger.LogError(ex, "Excepción no controlada procesando {Method} {Path}: {Message}",
                    context.Request.Method,
                    context.Request.Path,
                    ex.Message);

                context.Response.ContentType = "application/json";
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;

                // OWASP API8:2023 Security Misconfiguration mitigation:
                // No exponer nunca trazas ni ex.Message a clientes externos
                var response = new
                {
                    status = StatusCodes.Status500InternalServerError,
                    error = "InternalServerError",
                    message = "Ha ocurrido un error interno procesando su solicitud. Por favor intente más tarde.",
                    correlationId = context.TraceIdentifier
                };

                await context.Response.WriteAsJsonAsync(response);
            }
        }
    }
}