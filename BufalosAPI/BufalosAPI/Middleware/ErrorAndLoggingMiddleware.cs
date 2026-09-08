namespace BufalosAPI.Middlewares
{
    public class ErrorAndLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorAndLoggingMiddleware> _logger;

        public ErrorAndLoggingMiddleware(RequestDelegate next, ILogger<ErrorAndLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Registra la petición entrante en la consola
                _logger.LogInformation("HTTP {Method} {Path}", context.Request.Method, context.Request.Path);

                await _next(context);
            }
            catch (Exception ex)
            {
                // Captura cualquier falla imprevista y la devuelve como JSON 500
                _logger.LogError(ex, "Error imprevisto en la API: {Message}", ex.Message);

                context.Response.ContentType = "application/json";
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;

                var response = new
                {
                    status = 500,
                    error = "InternalServerError",
                    message = "Ocurrió un error inesperado en el servidor.",
                    detail = ex.Message
                };

                await context.Response.WriteAsJsonAsync(response);
            }
        }
    }
}