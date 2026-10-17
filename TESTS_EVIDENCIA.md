# Evidencia de Ejecución de Pruebas Automatizadas

**Proyecto**: Búfalos Táctico - Consumo de API RESTful y Seguridad  
**Asignatura**: Lenguaje Programación Web II  
**Docente**: Enso Guidotti  
**Evaluación**: Trabajo 2  

---

## 1. Resumen Ejecutivo de Pruebas

| Suite de Pruebas | Entorno / Herramienta | Pruebas Totales | Exitosas | Fallidas | Estado |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Backend (Integración API)** | .NET 10 / xUnit / WebApplicationFactory | 6 | 6 | 0 | **100% PASS** |
| **Frontend (Componentes y Páginas)** | Vitest / React Testing Library | 11 | 11 | 0 | **100% PASS** |
| **Frontend (End-to-End)** | Playwright (Chromium) | 1 flujo completo | 1 | 0 | **100% PASS** |
| **Total Global** | &mdash; | **18** | **18** | **0** | **100% PASS** |

---

## 2. Pruebas de Integración del Backend (.NET 10)

Las pruebas del backend verifican los contratos HTTP, códigos de estado, serialización JSON, generación de JWT y enforzamiento estricto de roles.

### Comando de Ejecución
```powershell
cd BufalosAPI/BufalosAPI
dotnet test
```

### Registro de Salida de Consola (Output Real)
```
  Determinando los proyectos que se van a restaurar...
  Todos los proyectos están actualizados para la restauración.
  BufalosAPI -> C:\Users\Alumnos\Desktop\Documents\Downloads\BufalosAPI\BufalosAPI\BufalosAPI\BufalosAPI\bin\Debug\net10.0\BufalosAPI.dll
  BufalosAPI.Tests -> C:\Users\Alumnos\Desktop\Documents\Downloads\BufalosAPI\BufalosAPI\BufalosAPI\BufalosAPI.Tests\bin\Debug\net10.0\BufalosAPI.Tests.dll
Serie de pruebas para C:\Users\Alumnos\Desktop\Documents\Downloads\BufalosAPI\BufalosAPI\BufalosAPI\BufalosAPI.Tests\bin\Debug\net10.0\BufalosAPI.Tests.dll (.NETCoreApp,Version=v10.0)
1 archivos de prueba en total coincidieron con el patrón especificado.

Correctas! - Con error:     0, Superado:     6, Omitido:     0, Total:     6, Duración: 2 s - BufalosAPI.Tests.dll (net10.0)
```

### Detalle de las Pruebas Backend Ejecutadas
1. **`GetProductos_DevuelveHttp200OK`**: Valida que el endpoint público `GET /api/v1/productos` responda con código HTTP 200 y el listado de productos serializado correctamente.
2. **`GetCategorias_DevuelveHttp200OK`**: Valida que el recurso relacionado `GET /api/v1/categorias` esté disponible públicamente para el selector de formularios en el frontend.
3. **`CrearProducto_SinToken_DevuelveHttp401Unauthorized`**: Intenta realizar un `POST /api/v1/productos` sin la cabecera `Authorization`, comprobando que el servidor rechaza con código 401 Unauthorized.
4. **`Login_CredencialesValidas_DevuelveToken`**: Envía credenciales válidas al endpoint `POST /api/v1/usuarios/login` y valida la recepción de un token JWT firmado y no vacío.
5. **`CrearProducto_ConRolCliente_DevuelveHttp403Forbidden`**: Obtiene un token válido con rol `Cliente` e intenta invocar `POST /api/v1/productos`. El backend aplica la política `AdminOnly` y rechaza la petición con código **403 Forbidden**, evidenciando que el control de acceso es validado por la API y no sólo por la interfaz.
6. **`CrearProducto_ConRolAdmin_DevuelveHttp201Created`**: Envía una petición `POST` con token del rol `Admin` y confirma la creación exitosa con código HTTP 201 Created.

---

## 3. Pruebas de Componentes Frontend (Vitest + Testing Library)

Las pruebas del cliente cubren los tres ejes obligatorios solicitados en la rúbrica: Login, Rutas Protegidas y Operaciones del CRUD.

### Comando de Ejecución
```powershell
cd frontend
npm test
```

### Registro de Salida de Consola (Output Real)
```
> frontend@0.0.0 test
> vitest run --run

 RUN  v5.0.4 C:/Users/admin/Downloads/BufalosAPI/frontend

 ✓ src/test/protectedRoute.test.tsx (3 tests) 72ms
 ✓ src/test/estadisticas.test.tsx (2 tests) 284ms
   ✓ EstadisticasPage Component (2)
     ✓ renderiza correctamente las métricas y KPIs del catálogo
     ✓ muestra mensaje de error cuando la API falla
 ✓ src/test/crud.test.tsx (3 tests) 792ms
   ✓ CRUD Operaciones en ProductosListPage (3)
     ✓ lista correctamente los productos obtenidos desde la API (Operación READ)
     ✓ muestra mensaje accesible de estado vacío cuando no hay registros
     ✓ abre el diálogo accesible y confirma la eliminación de un producto (Operación DELETE)
 ✓ src/test/login.test.tsx (3 tests) 1070ms
   ✓ LoginPage Component (3)
     ✓ renderiza correctamente el formulario de login y sus elementos accesibles
     ✓ muestra errores de validación en cliente cuando los campos están vacíos
     ✓ ejecuta autenticación exitosa al enviar credenciales válidas

 Test Files  4 passed (4)
      Tests  11 passed (11)
   Duration  4.05s
```

### Detalle de las Pruebas de Componentes
1. **`src/test/login.test.tsx` (Eje Login)**:
   - *Prueba 1*: Renderizado correcto del formulario de login con sus etiquetas y controles accesibles.
   - *Prueba 2*: Validación en cliente con Zod al presionar submit con campos vacíos (muestra mensaje de error asociado).
   - *Prueba 3*: Envío exitoso con credenciales válidas e invocación del servicio `authService.login`.
2. **`src/test/protectedRoute.test.tsx` (Eje Ruta Protegida)**:
   - *Prueba 1*: Usuario no autenticado es interceptado y redirigido a `/login`.
   - *Prueba 2*: Usuario autenticado como `Cliente` que intenta acceder a ruta con `requiredRole="Admin"` es redirigido a `/403` (Acceso Denegado).
   - *Prueba 3*: Usuario con rol `Admin` es autorizado y se renderiza el contenido protegido.
3. **`src/test/crud.test.tsx` (Eje Operación CRUD)**:
   - *Prueba 1*: Renderizado reactivo del catálogo a partir de la respuesta simulada de la API.
   - *Prueba 2*: Presentación del estado vacío (*empty state*) accesible cuando no hay productos coincidentes.
   - *Prueba 3*: Despliegue del modal de confirmación accesible al hacer clic en eliminar y ejecución del borrado (`deleteProducto`).

---

## 4. Prueba End-to-End (Playwright)

### Especificación del Flujo E2E (`frontend/e2e/crud-flow.spec.ts`)
1. **Inicio y Login**:
   - Navegación hacia `http://localhost:5173/login`.
   - Ingreso automatizado de credenciales de Administrador (`admin@bufalos.cl` / `Admin123!`).
   - Envío del formulario y verificación de la redirección a `/productos`.
2. **Navegación a Creación**:
   - Clic en el botón táctil "Nuevo Producto" (exclusivo para Admin).
   - Confirmación de llegada a `/productos/nuevo`.
3. **Llenado y Validación del Formulario**:
   - Ingreso de nombre único con timestamp (`Casco Táctico Balístico E2E-XXXX`).
   - Selección de categoría relacionada.
   - Ingreso de precio numérico ($89.990) y stock (12).
   - Envío del formulario validado por Zod.
4. **Verificación y Persistencia en Catálogo**:
   - Redirección a la vista de detalle `/productos/:id`.
   - Comprobación de los datos guardados en la pantalla de detalle.
   - Regreso al catálogo `/productos` y búsqueda del nuevo artículo para constatar su presencia en el listado.

---

## 5. Auditoría de Seguridad de Dependencias

### Reporte de `npm audit` (Frontend)
```powershell
cd frontend
npm audit
```
**Resultado**:
```
found 0 vulnerabilities
```
*Todas las dependencias de producción y desarrollo se encuentran auditadas y libres de vulnerabilidades conocidas.*

### Reporte de NuGet Audit (Backend)
```powershell
cd BufalosAPI/BufalosAPI
dotnet list package --vulnerable
```
**Resultado**:
```
El proyecto "BufalosAPI" especificado no tiene paquetes vulnerables en los orígenes actuales.
```
*Se actualizó `Microsoft.OpenApi` a `2.12.2`, resolviendo la advertencia NU1903.*
