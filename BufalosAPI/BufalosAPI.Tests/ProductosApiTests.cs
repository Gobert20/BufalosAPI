using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace BufalosAPI.Tests
{
    public class ProductosApiTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public ProductosApiTests(WebApplicationFactory<Program> factory)
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
        public async Task CrearProducto_SinToken_DevuelveHttp401Unauthorized()
        {
            // Act: Intentar crear un producto sin cabecera Authorization
            var response = await _client.PostAsJsonAsync("/api/v1/productos", new { Nombre = "Polera Test", Precio = 1000 });

            // Assert: Verificar protección de seguridad (401 Unauthorized)
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}