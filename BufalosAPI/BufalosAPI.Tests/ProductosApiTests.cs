using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace BufalosAPI.Tests
{
    public class ProductosApiTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public ProductosApiTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task GetProductos_DevuelveHttp200OK()
        {
            // Act: Consultar el endpoint público de productos versionado
            var response = await _client.GetAsync("/api/v1/productos");

            // Assert: Verificar contrato y código de respuesta HTTP 200 OK
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetCategorias_DevuelveHttp200OK()
        {
            // Act: Consultar el endpoint del recurso relacionado (Categorías)
            var response = await _client.GetAsync("/api/v1/categorias");

            // Assert: Verificar HTTP 200 OK
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task CrearProducto_SinToken_DevuelveHttp401Unauthorized()
        {
            // Act: Intentar crear un producto sin cabecera Authorization
            var nuevoProducto = new
            {
                Nombre = "Polera Táctica Test",
                Descripcion = "Polera transpirable",
                Precio = 15990m,
                Stock = 10,
                Id_Categoria = 1,
                RestriccionEdad = 0,
                RequierePermiso = false,
                SoloPersonalAutorizado = false,
                NumeroSerie = "POL-001"
            };

            var response = await _client.PostAsJsonAsync("/api/v1/productos", nuevoProducto);

            // Assert: Verificar protección de seguridad (401 Unauthorized)
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task Login_CredencialesValidas_DevuelveToken()
        {
            // Act: Realizar login con el usuario admin sembrado
            var loginPayload = new
            {
                Correo = "admin@bufalos.cl",
                Password = "Admin123!"
            };

            var response = await _client.PostAsJsonAsync("/api/v1/usuarios/login", loginPayload);

            // Assert: Debe retornar 200 OK con token
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.True(content.TryGetProperty("token", out var tokenProp));
            Assert.False(string.IsNullOrWhiteSpace(tokenProp.GetString()));
        }

        [Fact]
        public async Task CrearProducto_ConRolCliente_DevuelveHttp403Forbidden()
        {
            // 1. Obtener token con rol Cliente
            var loginCliente = await _client.PostAsJsonAsync("/api/v1/usuarios/login", new
            {
                Correo = "cliente@bufalos.cl",
                Password = "Cliente123!"
            });
            var json = await loginCliente.Content.ReadFromJsonAsync<JsonElement>();
            var token = json.GetProperty("token").GetString();

            // 2. Intentar crear producto con token de Cliente
            using var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/productos");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Content = JsonContent.Create(new
            {
                Nombre = "Producto No Permitido",
                Descripcion = "Prueba de autorización",
                Precio = 19990m,
                Stock = 5,
                Id_Categoria = 1,
                RestriccionEdad = 0,
                RequierePermiso = false,
                SoloPersonalAutorizado = false,
                NumeroSerie = "SEC-001"
            });

            var response = await _client.SendAsync(request);

            // Assert: Control de acceso por rol - OWASP API5 Broken Function Level Authorization
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task CrearProducto_ConRolAdmin_DevuelveHttp201Created()
        {
            // 1. Obtener token con rol Admin
            var loginAdmin = await _client.PostAsJsonAsync("/api/v1/usuarios/login", new
            {
                Correo = "admin@bufalos.cl",
                Password = "Admin123!"
            });
            var json = await loginAdmin.Content.ReadFromJsonAsync<JsonElement>();
            var token = json.GetProperty("token").GetString();

            // 2. Crear producto con token de Admin
            using var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/productos");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Content = JsonContent.Create(new
            {
                Nombre = "Linterna Táctica LED 1000 Lumens",
                Descripcion = "Linterna de alta potencia resistente a impactos",
                Precio = 29990m,
                Stock = 15,
                Id_Categoria = 3,
                RestriccionEdad = 0,
                RequierePermiso = false,
                SoloPersonalAutorizado = false,
                NumeroSerie = "LIN-001"
            });

            var response = await _client.SendAsync(request);

            // Assert: Éxito 201 Created
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task GetRoles_DevuelveHttp200OK()
        {
            // Act: Consultar roles disponibles
            var response = await _client.GetAsync("/api/v1/usuarios/roles");

            // Assert: 200 OK
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var roles = await response.Content.ReadFromJsonAsync<List<JsonElement>>();
            Assert.NotNull(roles);
            Assert.True(roles.Count >= 2);
        }

        [Fact]
        public async Task Registro_NuevoUsuarioConRolTecnico_DevuelveHttp201Created()
        {
            // Act: Registrar un nuevo usuario con rol Técnico
            var payload = new
            {
                NombreCompleto = "Técnico Pruebas Unitarias",
                Correo = $"tecnico_test_{Guid.NewGuid()}@bufalos.cl",
                Password = "Password123!",
                Rol = "Técnico"
            };

            var response = await _client.PostAsJsonAsync("/api/v1/usuarios/registro", payload);

            // Assert: 201 Created
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.True(json.TryGetProperty("rol", out var rolProp));
            Assert.Equal("Técnico", rolProp.GetString());
        }
    }
}