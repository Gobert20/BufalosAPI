# Bitácora de Uso de Inteligencia Artificial Generativa

**Asignatura**: Lenguaje Programación Web II  
**Docente**: Enso Guidotti  
**Evaluación**: Trabajo 2 (Consumo de API RESTful y Seguridad)  
**Estudiante**: Cristóbal García  
**Fecha**: Octubre 2026  

---

## 1. Declaración de Herramienta, Modelo y Plan

En cumplimiento de las instrucciones de la evaluación y las políticas de integridad académica, se declara expresamente la utilización de asistencia de inteligencia artificial generativa durante el desarrollo del proyecto:

- **Herramienta / Entorno**: Asistente de Desarrollo Antigravity (Google DeepMind) integrado en el entorno de desarrollo.
- **Modelo de Lenguaje Principal**: `Gemini 3.8 Flash (High)` / `Gemini 2.5 Pro`.
- **Tipo de Cuenta / Plan**: Cuenta Institucional / Educativa con acceso a herramientas de pair programming asistido por IA.

---

## 2. Bitácora de Prompts y Decisiones por Etapa

A continuación se detallan los prompts relevantes utilizados a lo largo de las distintas etapas del proyecto, junto con el análisis crítico de cada respuesta generada: qué elementos fueron aceptados, qué se corrigió o descartó, y el fundamento técnico de cada decisión.

---

### Etapa 1: Diagnóstico de la API, Ajustes de Backend y Mitigación de Vulnerabilidades

#### Prompt 1.1: Diagnóstico de fallas en backend y ejecución de pruebas del Trabajo 1
> *"Revisa la API existente del Trabajo 1 en .NET 10. Ejecuta las pruebas unitarias y de integración de BufalosAPI.Tests para verificar si pasan o si presentan fallas al conectarse a la base de datos o al validar contratos."*

- **Respuesta de la IA**: Identificó que la prueba `GetProductos_DevuelveHttp200OK` fallaba con error 500 debido a que la cadena de conexión apuntaba a `localhost` en lugar de la instancia local `.\SQLEXPRESS`, y que la base de datos `Bufalos_DB` no contenía las tablas creadas. Además, detectó una alerta de vulnerabilidad de gravedad alta en NuGet (`Microsoft.OpenApi` 2.0.0, vulnerabilidad GHSA-v5pm-xwqc-g5wc).
- **Qué se Aceptó**:
  - Corrección de la cadena de conexión hacia `.\SQLEXPRESS`.
  - Creación del inicializador `DbInitializer.cs` que ejecuta `EnsureCreated()` y siembra datos iniciales de roles (`Admin`, `Cliente`), categorías y productos.
- **Qué se Corrigió / Descartó**:
  - *Corrección*: Inicialmente la IA intentó insertar identificadores explícitos (`Id_Rol = 1`, `Id_Categoria = 1`) en `DbInitializer.cs`, lo que provocó un error de SQL Server (`Cannot insert explicit value for identity column when IDENTITY_INSERT is set to OFF`). Se corrigió el código para permitir que SQL Server genere las identidades automáticamente y se obtuvieran dinámicamente mediante consultas LINQ (`context.Roles.First(...)`).
  - *Resolución de Vulnerabilidad*: Se actualizó el paquete `Microsoft.OpenApi` a la versión `2.12.2`, eliminando por completo la vulnerabilidad conocida sin romper la compatibilidad con .NET 10.
  - *Aislamiento de Pruebas*: Se configuró `CustomWebApplicationFactory` para utilizar el proveedor `InMemory` en el entorno `"Testing"`, permitiendo que la suite de pruebas del backend se ejecute en 2 segundos de forma 100% aislada e independiente de SQL Server.

---

#### Prompt 1.2: Endpoints RESTful faltantes, CORS, Rate Limiting y Roles
> *"En base a la rúbrica de la Evaluación 2, agrega a la API en .NET 10 el endpoint PUT para edición de productos, el endpoint GET /api/v1/categorias para el recurso relacionado, política CORS restringida al frontend, Rate Limiting en el login y roles en los endpoints de mutación."*

- **Respuesta de la IA**: Generó la configuración en `Program.cs` para `AddRateLimiter` (5 peticiones por minuto en `/login`), `AddCors` con origen explícito `http://localhost:5173`, cabeceras de seguridad HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`), y los endpoints `PUT /api/v1/productos/{id}` y `GET /api/v1/categorias`.
- **Qué se Aceptó**:
  - La directiva de autorización `.RequireAuthorization("AdminOnly")` en los métodos POST, PUT y DELETE.
  - La respuesta `429 Too Many Requests` en `/login`.
  - La eliminación de `ex.Message` y trazas internas en `ErrorAndLoggingMiddleware.cs` para cumplir con OWASP API8:2023.
- **Qué se Corrigió / Descartó**:
  - *Corrección*: Se corrigió un error tipográfico en `Program.cs` en la configuración de JWT donde se asignaba `ValidateAudience` dos veces en vez de `ValidAudience`.
  - *Ajuste*: Se aseguró que tanto el claim URI de rol como el claim simple `"role"` estuvieran presentes en el payload JWT para interoperabilidad fluida con el frontend.

---

### Etapa 2: Arquitectura Frontend y Capa de Consumo HTTP

#### Prompt 2.1: Scaffolding y Estructura por Capas
> *"Genera la arquitectura de un proyecto frontend en React con TypeScript y Vite. La estructura debe ser por capas (api, services, types, context, hooks, components, pages, routes) y configurar Axios con un cliente HTTP centralizado que adjunte el token JWT y normalice los errores."*

- **Respuesta de la IA**: Creó la estructura de directorios, el cliente `apiClient` con interceptores de solicitud y respuesta, los servicios `authService`, `productoService` y `categoriaService`, y las interfaces TypeScript.
- **Qué se Aceptó**:
  - El interceptor que adjunta automáticamente `Authorization: Bearer <token>`.
  - El manejo reactivo del código 401 que dispara la limpieza de credenciales y el evento `bufalos:unauthorized`.
  - Los tipos estrictos `Producto`, `Categoria`, `Usuario` y `ApiError`.
- **Qué se Corrigió / Descartó**:
  - *Corrección de Tipado*: El compilador de TypeScript marcó advertencias con `verbatimModuleSyntax` activo respecto a tipos exportados sin la palabra clave `type`. Se ajustó `tsconfig.app.json` y se refinaron las importaciones para evitar fallas durante el build de Vite.
  - *Ajuste en Storage*: Se implementó la estrategia por defecto en `sessionStorage` para limitar el tiempo de vida de la sesión ante ataques XSS, manteniendo `localStorage` como opción explícita solo si se marca "Recordar sesión".

---

### Etapa 3: Vistas del CRUD, Accesibilidad y Diseño Responsivo

#### Prompt 3.1: Vistas CRUD con Accesibilidad WCAG 2.2 AA y Mobile-First
> *"Diseña las vistas del CRUD (Listado con búsqueda y filtro de categoría, Detalle, Formulario de Creación/Edición). Debe cumplir con WCAG 2.2 AA: HTML semántico, etiquetas asociadas con htmlFor y aria-describedby, errores con role='alert' y aria-live, foco visible, contraste >= 4.5:1, skip link inicial, controles táctiles >= 44x44px, y maquetación adaptativa que use tarjetas en móvil y tabla en escritorio."*

- **Respuesta de la IA**: Generó los componentes de interfaz accesibles (`Input`, `Select`, `Textarea`, `Modal`, `ConfirmDialog`, `Alert`, `Button`), el `Navbar` con menú responsivo y navegación semántica, y las vistas `ProductosListPage`, `ProductoDetailPage`, `ProductoFormPage`, `LoginPage` y `ForbiddenPage`.
- **Qué se Aceptó**:
  - El patrón WAI-ARIA Modal Dialog en `Modal.tsx` con soporte de tecla `Escape` y captura de foco (*focus trap*).
  - La visualización en tarjetas fluidas para pantallas móviles y tabla semántica para monitores de escritorio.
  - Los controles táctiles con clase mínima de 44 px de alto (`min-h-[44px]`).
  - La integración de `react-hook-form` con validación declarativa mediante esquemas **Zod**.
- **Qué se Corrigió / Descartó**:
  - *Corrección*: En el esquema Zod de creación de productos, el uso de `.default(...)` generaba una incompatibilidad de tipos con `@hookform/resolvers/zod` (propiedades opcionales en el input del esquema versus requeridas en el tipo del formulario). Se eliminaron los `.default(...)` del esquema y se establecieron los valores por defecto directamente en la propiedad `defaultValues` del hook `useForm`.
  - *Mejora Visual y Accesibilidad*: Se agregaron atajos directos en la página de login para autocompletar credenciales de Administrador y Cliente con un solo clic, facilitando la demostración en vivo durante la exposición.

---

### Etapa 4: Automatización de Pruebas (Vitest y Playwright)

#### Prompt 4.1: Pruebas de Componentes Frontend y E2E
> *"Escribe las pruebas automatizadas de componentes en Vitest con Testing Library para cubrir: 1) Formulario de login y validación, 2) Protección de rutas por roles con ProtectedRoute (403 y login), 3) Operaciones del CRUD en la lista con modal de confirmación. Adicionalmente, crea una prueba E2E en Playwright para el flujo completo: login admin -> crear producto -> listar en catálogo."*

- **Respuesta de la IA**: Generó los archivos de prueba `login.test.tsx`, `protectedRoute.test.tsx`, `crud.test.tsx` y la prueba E2E `crud-flow.spec.ts`.
- **Qué se Aceptó**:
  - Mocks limpios de los servicios (`authService`, `productoService`, `categoriaService`).
  - Pruebas deterministas de redirección a `/login` y a `/403`.
  - Prueba de eliminación con verificación de la llamada `deleteProducto(id)`.
- **Qué se Corrigió / Descartó**:
  - *Corrección en `crud.test.tsx`*: Al ejecutar `npm test`, la prueba de listado fallaba debido a que la interfaz renderiza tanto la versión de escritorio (tabla) como la versión móvil (tarjetas), provocando que `screen.findByText('Chaqueta Militar Ripstop')` encontrara múltiples elementos en el DOM simulado. Se corrigió la aserción utilizando `screen.findAllByText(...)` y verificando que la longitud fuera mayor a 0. Con esta corrección, los **9 tests pasaron al 100%**.

---

---

### Etapa 5: Mejoras Visuales, Categoría Airsoft, Modo Galería y Panel de Estadísticas

#### Prompt 5.1: Solución de mojibake, expansión de catálogo e interfaz en cuadrícula
> *"Hay bugs con el texto, viéndose cosas como 'Mochila MÃ©dica TÃ¡ctica Trauma Bag Trauma-Kit', 'Linterna Taser ElÃ©ctrica Policial Recargable', 'Pistola TraumÃ¡tica Revolver Ekol Viper 2.5"'. Revisa qué pasó y añade la opción de cambiar entre lista y cuadrícula corte galería con imágenes/símbolos por producto, selector de cantidad por página, agrega productos de airsoft y una pestaña de estadísticas de negocio (más vendidos, ganancias, stock)."*

- **Respuesta de la IA**:
  - Diagnosticó que la causa del mojibake fue la ejecución previa de scripts SQL bajo la página de códigos Windows-1252 sin codificación `UTF-8` ni literales `N'...'`.
  - Creó la Categoría 5 "Airsoft y Réplicas" y sembró más de 36 nuevos productos tácticos con descripciones completas en UTF-8.
  - Implementó el conmutador de vista (Galería/Cuadrícula vs. Lista/Tabla) en `ProductosListPage.tsx` con almacenamiento de preferencia en `localStorage`.
  - Agregó el selector dinámico de elementos por página (6, 12, 24, 48 productos).
  - Diseñó el helper `productImages.ts` y el componente `ProductImageCard.tsx` con imágenes tácticas optimizadas y símbolos por categoría.
  - Creó el endpoint backend `GET /api/v1/productos/estadisticas` y la página frontend `EstadisticasPage.tsx` con KPIs de valorización total, unidades en bodega, barras de progreso por categoría, top vendidos y alertas de stock bajo.
- **Qué se Aceptó**:
  - La arquitectura completa del panel de estadísticas y el mapeo semántico de imágenes.
  - La persistencia limpia en SQL Server con `N'...'` y ejecución con `sqlcmd -f 65001`.
  - Las nuevas pruebas unitarias para `EstadisticasPage` alcanzando 11 tests pasando en Vitest.
- **Qué se Corrigió / Descartó**:
  - *Corrección en `Program.cs`*: Durante la ejecución de `BufalosAPI.Tests`, el middleware de redirección HTTPS (`UseHttpsRedirection`) provocaba que las peticiones de prueba redirigieran de HTTP a HTTPS, haciendo que HttpClient eliminara la cabecera `Authorization: Bearer` y devolviera 401 Unauthorized. Se ajustó `Program.cs` para deshabilitar la redirección HTTPS en el entorno `"Testing"` y elevar el umbral del RateLimiter a 1000 durante pruebas, logrando que el 100% de las pruebas del backend (6 de 6) pasen en verde.

---

## 3. Síntesis y Reflexión del Uso de IA

1. **Eficiencia en Boilerplate y Accesibilidad**: La IA permitió generar con rapidez la estructura inicial de componentes accesibles y atributos ARIA complejos (tales como trampas de foco y vinculación de `aria-describedby`), ahorrando tiempo en tareas repetitivas.
2. **Supervisión y Control Humano Crítico**: Ninguna pieza de código fue integrada sin verificación. Se identificaron y corrigieron errores sutiles como:
   - Incompatibilidades de tipos entre Zod y React Hook Form.
   - Errores de identidad de columnas en SQL Server durante el seeding.
   - Colisiones de selectores en Testing Library por el diseño responsivo dual (móvil/escritorio).
   - Conflicto de `UseHttpsRedirection` en pruebas de integración de .NET.
   - Ajustes de sintaxis en `TokenValidationParameters` de C#.
3. **Dominio del Proyecto**: Todo el código resultante, su arquitectura y sus decisiones de diseño están completamente asimilados por el estudiante, quien se encuentra en plena capacidad de defender, modificar y explicar cada línea durante la exposición oral frente al docente.
