# Bitácora de Uso de Inteligencia Artificial Generativa

**Asignatura**: Lenguaje Programación Web II  
**Docente**: Enso Guidotti  
**Evaluación**: Trabajo 2 (Consumo de API RESTful y Seguridad)  
**Estudiante**: Goberto Parra  
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

### Etapa 6: Registro de Usuarios en Login con Selección de Rol (Cliente, Técnico, Administrador)

#### Prompt 6.1: Creación de Cuentas por Rol en Login y Persistencia Backend
> *"En la pantalla de Login (/login), agrega un formulario o pestaña de 'Registro de Nuevo Usuario'. Permite seleccionar el Rol deseado (Cliente, Técnico, Administrador) durante el registro. Conecta el registro con el endpoint POST /api/v1/usuarios/registro del backend, guardando correctamente el nuevo usuario con el RolId correspondiente en SQL Server."*

- **Respuesta de la IA**:
  - Implementó un sistema accesible de pestañas (Tabs WAI-ARIA) en `LoginPage.tsx` permitiendo alternar fluidamente entre "Iniciar Sesión" y "Crear Cuenta".
  - Añadió un formulario con validación síncrona en Zod (`registerSchema`), controlando nombre completo, correo con formato válido, coincidencia de contraseñas y selector de rol.
  - Diseñó una caja explicativa contextual que describe los permisos autorizados en la armería según el rol seleccionado (`Cliente`, `Técnico` o `Administrador`).
  - Actualizó `UsuarioApi.cs` incorporando el endpoint `GET /api/v1/usuarios/roles` y perfeccionando `POST /api/v1/usuarios/registro` para mapear el rol dinámicamente tanto por identificador (`Id_Rol`) como por nombre textual, asignando la clave foránea adecuada en `TB_Usuarios`.
  - Aseguró en `DbInitializer.cs` la existencia de los 3 roles en base de datos y la creación de un usuario demo técnico (`tecnico@bufalos.cl` / `Tecnico123!`), con botón de acceso rápido en el login.
- **Qué se Aceptó**:
  - La arquitectura desacoplada en `authService.registro` y `authService.getRoles`.
  - El flujo de UX donde, tras un registro exitoso, se notifica al usuario con un banner de confirmación y se pre-cargan sus credenciales en el login para un ingreso inmediato.
  - La ampliación de la suite de pruebas unitarias alcanzando 13 tests en Vitest y 8 tests en .NET (100% en verde).
- **Qué se Corrigió / Descartó**:
  - *Ajuste en TypeScript*: Se definió `isTecnico?: boolean` como opcional en `AuthContextType` para mantener compatibilidad total con los mocks existentes en `crud.test.tsx` y `protectedRoute.test.tsx`.
  - *Ajuste en Iconos*: Se retiró la prop personalizada `icon` de `<Alert>` en `LoginPage.tsx` para ajustarse estrictamente a la interfaz `AlertProps`, aprovechando el icono nativo del tipo `success`.

---

---

### Etapa 7: Flujo Completo de Pedidos, Paneles Sincronizados, Perfil de Cliente y Mapeo Total de Base de Datos

#### Prompt 7.1: Flujo de Pedidos, Sincronización de Paneles y Restricción por Rol
> *"Implementa el flujo completo de compras para el Cliente con descuento de stock, sincronización inmediata con el Panel Técnico (despachos y taller) y Panel Admin (balance y transacciones). En el rol Cliente, bloquea el acceso a Estadísticas. Agrega el historial 'Mis Pedidos' y la sección de Servicio Técnico con botón para ingresar nuevas solicitudes. Revisa la base de datos SQL e incorpora todas las tablas que no se estén ocupando en EF Core."*

- **Respuesta de la IA**:
  - Implementó el modal de compra `OrderModal.tsx` con selector de cantidad, control contra el stock disponible, modalidad de entrega (**Starken** o **Retiro Tienda**) y conexión con `POST /api/v1/pedidos`.
  - Diseñó `PanelTecnicoPage.tsx` con pestañas de "Despacho y Estado de Pedidos" y "Órdenes de Taller y Servicios Técnicos".
  - Sincronizó las métricas globales y la sección de "Últimas Transacciones Comerciales y Facturas" en `EstadisticasPage.tsx`.
  - Protegió la ruta `/estadisticas` con `requiredRole={['Admin', 'Técnico']}`, redirigiendo a los Clientes a la vista 403 y ocultando el acceso en el Navbar y Catálogo.
  - Creó la página `MisPedidosPage.tsx` (`/mis-pedidos`) para que los clientes consulten el historial de sus compras con desglose de productos y tracking.
  - Creó la página `ServicioClientePage.tsx` (`/servicios-cliente`) con listado de tickets y el modal `NuevaSolicitudModal.tsx` para ingresar trabajos técnicos y parches personalizados.
  - Auditó `Bufalos_DB.sql` e incorporó las 4 tablas no mapeadas a EF Core: `TB_PermisosUsuarios`, `TB_Proveedores`, `TB_ProveedoresProductos` y `TB_DetallesParchesCustom`, con sus modelos, `DbSet`, sembrado en `DbInitializer.cs` y endpoints en `ProveedorApi.cs` y `ServicioTecnicoApi.cs`.
- **Qué se Aceptó**:
  - El descuento atómico de existencias en el inventario al confirmar pedidos.
  - La sincronización cruzada en tiempo real entre las órdenes de compra y los folios de facturación en estadísticas.
  - La cobertura del 100% del esquema relacional de `Bufalos_DB.sql` en el backend.
- **Qué se Corrigió / Descartó**:
  - *Ajuste en Testing*: Se adecuó el título de `EstadisticasPage` y la tarjeta de total de productos para preservar la compatibilidad con los tests de Vitest (`44` modelos y encabezado de negocio).
  - *Ajuste de Props en UI*: Se eliminaron propiedades no estándar en los botones y se adaptaron los componentes `Input` y `Select` a sus interfaces accesibles nativas.

---

### Etapa 8: Gestión de Imágenes de Productos, Upload Seguro (OWASP) y Vista Previa en Tiempo Real

#### Prompt 8.1: Arquitectura Full-Stack de Gestión de Imágenes
> *"Necesito implementar la funcionalidad de gestión de imágenes para los productos del sistema 'Búfalos' (Equipamiento Táctico). Actualiza la entidad Producto con ImagenUrl, refleja el campo en SQL Server y DTOs, implementa el endpoint seguro de upload a wwwroot/uploads con autorización Admin, añade miniaturas en tabla/catálogo con fallback táctico, y agrega en el formulario de administración la carga de archivos, ingreso de URL y previsualización en tiempo real."*

- **Respuesta de la IA**:
  - Actualizó la entidad `Producto` en backend y `BufalosDbContext` con la propiedad `ImagenUrl NVARCHAR(500) NULL`, junto con la migración automática condicional en `Bufalos_DB.sql`.
  - Actualizó los DTOs `ProductoDto`, `CreateProductoDto` y `UpdateProductoDto` para admitir `ImagenUrl`.
  - Diseñó e implementó los endpoints seguros `POST /api/v1/productos/upload-imagen` y `POST /api/v1/productos/{id}/imagen` en `ProductoApi.cs`, restringidos con `.RequireAuthorization("AdminOnly")` e incorporando mitigaciones OWASP:
    1. Límite de tamaño estricto (máximo 5 MB) para prevenir ataques de Denegación de Servicio (DoS).
    2. Lista blanca de extensiones de archivo permitidas (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`).
    3. Validación de MIME Content-Type.
    4. Generación de nombres de archivo criptográficos con GUID para impedir ataques de *Directory Traversal* y ejecución remota de código (RCE).
    5. Habilitación de `app.UseStaticFiles()` en `Program.cs` para el consumo público de `/uploads/productos/`.
  - En el frontend:
    - Extendió los tipos TypeScript `Producto` y `ProductoInput` con `imagenUrl?: string | null`.
    - Agregó los métodos `uploadImagen` y `asociarImagen` en `productoService.ts`.
    - Adaptó `ProductImageCard.tsx` y `getProductImageUrl` para resolver URLs absolutas, relativas al backend (`/uploads/...`) o aplicar automáticamente la imagen táctica de respaldo cuando `imagenUrl` no se proporciona o falla.
    - Mostró la miniatura del producto (`<img>`) en la vista de tabla y galería del catálogo (`ProductosListPage.tsx`) y en el detalle (`ProductoDetailPage.tsx`).
    - Enriqueció el formulario de administración (`ProductoFormPage.tsx`) con un selector dual (Subir archivo o Ingresar URL), validación en cliente y previsualización gráfica en tiempo real antes de guardar, accesible exclusivamente por administradores.
- **Qué se Aceptó**:
  - La arquitectura segura de almacenamiento local estático con GUIDs y restricciones estrictas de rol.
  - El sistema de fallback táctico que garantiza que ningún producto quede visualmente vacío.
  - La suite de pruebas de integración en .NET ampliada a 10 pruebas exitosas (validando 401 sin token y 200 con Admin en upload).
- **Qué se Corrigió / Descartó**:
  - *Ajuste de Codificación (UTF-8)*: Se normalizó el archivo de utilidades `productImages.ts` y las vistas de productos eliminando caracteres mojibake y restaurando los emojis tácticos de categorías.
  - *Ajuste de Gitignore*: Se añadió regla para omitir archivos temporales de prueba en `wwwroot/uploads/productos/` conservando el archivo `.gitkeep`.

## 3. Síntesis y Reflexión del Uso de IA

1. **Eficiencia en Boilerplate y Accesibilidad**: La IA permitió generar con rapidez la estructura inicial de componentes accesibles y atributos ARIA complejos (tales como trampas de foco y vinculación de `aria-describedby`), ahorrando tiempo en tareas repetitivas.
2. **Supervisión y Control Humano Crítico**: Ninguna pieza de código fue integrada sin verificación. Se identificaron y corrigieron errores sutiles como:
   - Incompatibilidades de tipos entre Zod y React Hook Form.
   - Errores de identidad de columnas en SQL Server durante el seeding.
   - Colisiones de selectores en Testing Library por el diseño responsivo dual (móvil/escritorio).
   - Conflicto de `UseHttpsRedirection` en pruebas de integración de .NET.
   - Ajustes de sintaxis en `TokenValidationParameters` de C#.
3. **Dominio del Proyecto**: Todo el código resultante, su arquitectura y sus decisiones de diseño están completamente asimilados por el estudiante, quien se encuentra en plena capacidad de defender, modificar y explicar cada línea durante la exposición oral frente al docente.
