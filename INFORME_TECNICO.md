# Informe Técnico: Arquitectura Frontend, Consumo de API y Seguridad de Extremo a Extremo

**Asignatura**: Lenguaje Programación Web II  
**Unidad Temática**: UT2: Consumo de APIs RESTful desde aplicaciones frontend y seguridad  
**Docente**: Enso Guidotti  
**Evaluación**: Trabajo 2 (100% Evaluación 2)  
**Proyecto**: Búfalos Táctico - Plataforma de Gestión de Equipamiento y Catálogo RESTful  

---

## 1. Introducción y Contexto del Negocio

El proyecto **Búfalos Táctico** corresponde a una plataforma comercial y de control de inventario para una armería y tienda especializada en indumentaria militar, artículos tácticos y equipos de protección balística. La naturaleza del caso de negocio exige un riguroso esquema de seguridad y control de acceso: la consulta del catálogo público y detalles puede ser realizada por cualquier usuario registrado (`Cliente`), mientras que la administración, abastecimiento, fijación de precios, creación, edición y baja de productos (`Admin`) involucra restricciones legales, registros de números de serie y permisos de porte fiscalizados.

El presente trabajo complementa la API RESTful desarrollada en el Trabajo 1 implementando una aplicación frontend moderna en **React con TypeScript y Vite**, aplicando patrones de arquitectura por capas, cliente HTTP centralizado con normalización de errores, control de sesión mediante JWT, diseño responsivo adaptativo y pleno cumplimiento de los estándares de accesibilidad **WCAG 2.2 nivel AA**.

---

## 2. Decisiones de Diseño y Arquitectura

### 2.1 Framework y Organización del Proyecto
- **Tecnología**: **React 19** con **Vite 6** y **TypeScript**.
  - *Justificación*: Vite ofrece un ciclo de desarrollo ultrarrápido con Hot Module Replacement (HMR) nativo vía ESM, optimización en compilación (Rollup) y un bundle mínimo de producción sin dependencias innecesarias. TypeScript aporta tipado estático estricto, reduciendo fallas en tiempo de ejecución y garantizando fidelidad frente al contrato de la API.
- **Estructura por Capas**:
  - `src/api/`: Cliente HTTP único y centralizado con configuración de Axios e interceptores.
  - `src/services/`: Capa de consumo desacoplada de la interfaz gráfica. Los componentes nunca invocan Axios directamente.
  - `src/types/`: Interfaces y DTOs que modelan las entidades del dominio (`Producto`, `Categoria`, `Usuario`, `ApiError`).
  - `src/context/`: Gestión de estado global de sesión mediante `AuthContext` y `AuthProvider`.
  - `src/components/`: Componentes reutilizables divididos en `ui/` (botones, modales, alertas, inputs accesibles), `layout/` (navbar, footer, layout semántico) y `auth/` (`ProtectedRoute`).
  - `src/pages/`: Vistas completas de la aplicación (Login, Listado CRUD, Detalle, Formulario, 403 Forbidden, 404 Not Found).
  - `src/routes/`: Declaración centralizada del árbol de enrutamiento con React Router.

### 2.2 Capa de Consumo HTTP y Manejo de Errores
- **Cliente HTTP Centralizado (`apiClient`)**:
  - La URL base se inyecta dinámicamente mediante `import.meta.env.VITE_API_BASE_URL`, evitando URLs estáticas (*hardcoded*).
  - **Interceptor de Solicitud**: Inyecta automáticamente el encabezado `Authorization: Bearer <token>` cuando existe un token válido en almacenamiento.
  - **Interceptor de Respuesta**: Captura y normaliza todos los códigos de error HTTP a una estructura unificada `ApiError`:
    - `401 Unauthorized`: Detecta expiración de credenciales, elimina el estado de sesión local y despacha el evento global `bufalos:unauthorized` para redirigir fluidamente al login.
    - `403 Forbidden`: Traduce el rechazo por rol a un mensaje comprensible de acceso restringido.
    - `429 Too Many Requests`: Maneja el límite de tasa del backend, informando la necesidad de espera al usuario.
    - `500 Internal Server Error`: Oculta trazas internas y muestra un mensaje seguro y amigable.

### 2.3 Manejo de Estado y Formularios
- **Manejo de Formularios**: `react-hook-form` con integración de esquemas declarativos en **Zod** (`@hookform/resolvers/zod`).
  - *Justificación*: Desempeño óptimo al evitar re-renderizados innecesarios en cada pulsación de tecla, con validación síncrona en cliente de restricciones de longitud, tipos numéricos positivos y obligatoriedad antes de enviar la petición al servidor.
- **Manejo de Estado Asíncrono**:
  - Implementación con hooks nativos de ciclo de vida (`useState`, `useEffect`, `useCallback`) con estados explícitos de:
    - `isLoading` (esqueletos accesibles con `aria-busy="true"`).
    - `error` (alertas anunciadas con `role="alert"` y botón de reintento).
    - `empty` (ilustración y mensaje cuando no hay resultados tras un filtro).
    - Datos cargados (tabla o tarjetas según dispositivo).

---

## 3. Estrategia de Autenticación y Almacenamiento de Tokens

### 3.1 Flujo JWT
1. El usuario envía sus credenciales (`correo` y `password`) al endpoint `POST /api/v1/usuarios/login`.
2. El servidor valida el hash BCrypt y genera un token JWT firmado con algoritmo HMAC-SHA256, con tiempo de expiración corto (4 horas) e incluyendo las credenciales y rol (`Admin` o `Cliente`).
3. El frontend recibe el token y los datos de perfil, inicializando el estado de autenticación en memoria (`AuthContext`).

### 3.2 Estrategia de Almacenamiento y Justificación de Seguridad
- **Estrategia Implementada**: `sessionStorage` por defecto, con opción a `localStorage` únicamente si el usuario marca explícitamente "Recordar sesión".
- **Análisis de Vectores de Ataque y Justificación**:
  - *Cookies HttpOnly vs Almacenamiento Local*: Si bien las cookies con bandera `HttpOnly` y atributo `SameSite=Strict` ofrecen la mayor protección contra robo por scripts (XSS), en arquitecturas de APIs RESTful desacopladas que operan en puertos u orígenes distintos (CORS) con autorización Bearer en cabecera, el uso de tokens en memoria/storage es el estándar más interoperable.
  - *Mitigación contra XSS en el Cliente*: Para neutralizar la principal amenaza contra tokens almacenados (el robo por inyección de script), se implementaron tres barreras activas:
    1. **Sin inyección HTML insegura**: En ningún lugar del código se utiliza `dangerouslySetInnerHTML`. Todo dato devuelto por la API se renderiza como texto plano escapado nativamente por React.
    2. **Content-Security-Policy (CSP)**: Cabecera y meta etiqueta configuradas en `index.html` y en el backend, impidiendo la ejecución de scripts no autorizados o la conexión a servidores maliciosos.
    3. **Aislamiento en sessionStorage**: Al cerrar la pestaña del navegador, el token se destruye automáticamente, limitando la ventana temporal de exposición.
  - *Protección contra CSRF*: Al emplear el encabezado explícito `Authorization: Bearer <token>`, los navegadores no adjuntan automáticamente credenciales en peticiones cross-site, lo que neutraliza por diseño los ataques de falsificación de peticiones en sitios cruzados (CSRF).

---

## 4. Autorización por Roles y Rutas Protegidas

El sistema distingue estrictamente dos roles con privilegios diferenciados:
- **Admin**: Acceso total al catálogo, consulta de detalle, creación de productos (`POST`), edición de productos (`PUT`) y eliminación (`DELETE`).
- **Cliente**: Acceso exclusivo de consulta (`GET /productos`, `GET /productos/{id}`, `GET /categorias`).

### 4.1 Protección en el Frontend (`ProtectedRoute`)
- Los componentes de mutación (`/productos/nuevo`, `/productos/editar/:id`) están envueltos en `<ProtectedRoute requiredRole="Admin">`.
- Si un usuario no autenticado intenta ingresar, es redirigido a `/login` preservando la ruta previa en el estado de navegación.
- Si un usuario con rol `Cliente` intenta forzar el acceso a la URL de administración, es interceptado y enviado a la página **403 - Acceso Denegado** (`ForbiddenPage`), donde se le explica claramente que su rol no dispone de los privilegios requeridos.
- Los botones de "Nuevo Producto", "Editar" y "Eliminar" se ocultan condicionalmente en la interfaz si el usuario no es `Admin`.

### 4.2 Enforzamiento Obligatorio en el Backend (API)
Siguiendo el principio de **Defensa en Profundidad**, la interfaz visual jamás sustituye al backend:
- En `Program.cs` se registraron las políticas:
  ```csharp
  builder.Services.AddAuthorization(options => {
      options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
  });
  ```
- En `ProductoApi.cs`, los endpoints de escritura poseen `.RequireAuthorization("AdminOnly")`:
  - `POST /api/v1/productos` &rarr; Devuelve `403 Forbidden` a usuarios con rol `Cliente`.
  - `PUT /api/v1/productos/{id}` &rarr; Devuelve `403 Forbidden` a usuarios con rol `Cliente`.
  - `DELETE /api/v1/productos/{id}` &rarr; Devuelve `403 Forbidden` a usuarios con rol `Cliente`.
- Esto garantiza que incluso si un atacante elude los guardias del cliente (manipulando JavaScript o enviando peticiones directas vía cURL/Postman), el servidor rechaza categóricamente la solicitud indebida.

---

## 5. Matriz de Mitigación de Vulnerabilidades (OWASP)

Se implementaron y verificaron **7 medidas de mitigación** (4 del lado cliente, 3 en el backend y compartidas), superando el mínimo requerido de 5 riesgos:

| # | Riesgo de Seguridad | Referencia OWASP | Ubicación en el Código | Mitigación Implementada | Evidencia Verificable |
| :- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Cross-Site Scripting (XSS)** | OWASP Web Top 10: *Injection* | Cliente (`index.html`, componentes UI de React) | Prohibición absoluta de `dangerouslySetInnerHTML`. Todos los campos de texto devueltos por la API (nombres, descripciones) se renderizan como nodos de texto escapados por React. Implementación de Content-Security-Policy (CSP) restringida. | Intentos de ingresar cadenas `<script>alert('xss')</script>` en nombres de productos son renderizados como texto inocuo sin ejecutar código. |
| **2** | **Robo o Filtración del Token** | OWASP API2:2023: *Broken Authentication* | Cliente (`src/services/authService.ts`, `src/api/client.ts`) | Almacenamiento en `sessionStorage`, expiración activa con `isTokenExpired()`, limpieza total de memoria y storage en `logout()`. Prohibición de imprimir tokens en URLs o en `console.log`. | Inspección de la consola y URLs en navegación; verificación de que el token desaparece del storage al hacer clic en "Cerrar Sesión". |
| **3** | **Control de Acceso a Nivel de Función** | OWASP API5:2023: *Broken Function Level Authorization* | Ambos (`ProtectedRoute.tsx`, `ProductoApi.cs`) | En cliente: guarda de rutas que redirige a `/403`. En backend: directiva `.RequireAuthorization("AdminOnly")` en endpoints POST, PUT y DELETE. | Prueba de integración `CrearProducto_ConRolCliente_DevuelveHttp403Forbidden` validada con código 403. Demostración en vivo en `/403`. |
| **4** | **Consumo de Recursos sin Restricción (Fuerza Bruta)** | OWASP API4:2023: *Unrestricted Resource Consumption* | Ambos (`Program.cs`, `src/pages/LoginPage.tsx`) | En backend: middleware nativo `AddRateLimiter` con límite de 5 intentos por minuto en el endpoint `/login`. En frontend: captura de estado 429 con mensaje claro y bloqueo temporal del botón. | Realizar 6 intentos seguidos de login fallido dispara la respuesta HTTP 429 Too Many Requests y el aviso visual en el cliente. |
| **5** | **Configuración Insegura (CORS, Cabeceras, Errores)** | OWASP API8:2023: *Security Misconfiguration* | Servidor (`Program.cs`, `ErrorAndLoggingMiddleware.cs`) | CORS restringido exclusivamente a `http://localhost:5173`. Cabeceras HTTP `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`. Middleware global que registra excepciones en servidor y responde con JSON genérico sin exponer `ex.Message` ni trazas de base de datos. | Petición desde un origen no permitido rechazada por navegador. Errores 500 devuelven mensaje estructurado genérico con CorrelationId. |
| **6** | **Validación Insuficiente de Entradas** | OWASP Web Top 10: *Injection* | Ambos (`src/pages/ProductoFormPage.tsx`, `ProductoApi.cs`) | En frontend: esquema tipado Zod que valida longitudes, números positivos y tipos enteros. En backend: validación de campos obligatorios en el DTO y consultas parametrizadas en EF Core. | Formularios bloquean envíos de precios negativos o nombres vacíos antes de la petición; la API valida y responde 400 Bad Request si los datos están adulterados. |
| **7** | **Componentes Vulnerables y Desactualizados** | OWASP Web Top 10: *Vulnerable and Outdated Components* | Ambos (`package.json`, `BufalosAPI.csproj`) | Ejecución de `npm audit` en el cliente con **0 vulnerabilidades**. En el backend, actualización del paquete `Microsoft.OpenApi` a la versión 2.12.2, eliminando la vulnerabilidad de severidad alta reportada en GHSA-v5pm-xwqc-g5wc. | Reporte `npm audit` limpio. Compilación de .NET con 0 advertencias de seguridad y 0 vulnerabilidades. |

---

## 6. Accesibilidad (WCAG 2.2 Nivel AA) y Diseño Responsivo

### 6.1 Accesibilidad
- **HTML Semántico**: Estructuración mediante landmarks (`<header role="banner">`, `<nav role="navigation">`, `<main role="main">`, `<footer role="contentinfo">`).
- **Formularios con Etiquetado Completo**: Cada `<input>`, `<select>` y `<textarea>` cuenta con su correspondiente `<label htmlFor="...">`. Los mensajes de error se vinculan mediante `aria-describedby` y los campos inválidos activan `aria-invalid="true"`.
- **Anuncios Dinámicos (Live Regions)**:
  - Los errores de formulario y alertas de servidor utilizan `role="alert"` y `aria-live="polite"`.
  - El listado de productos anuncia la cantidad de resultados encontrados a tecnologías asistivas.
- **Navegación por Teclado y Foco Visible**:
  - Enlace de acceso directo inicial (*Skip Link*) visible únicamente al recibir foco con la tecla Tab: `"Saltar al contenido principal"`.
  - Anillos de foco evidentes y contrastados (`focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none`).
  - El diálogo modal de confirmación implementa retención de foco (*focus trap*) y soporte de escape con tecla `Esc`.
- **Contraste de Color**: Cumplimiento del ratio mínimo de 4.5:1 en todos los textos e iconos respecto a su fondo. La información nunca se transmite únicamente mediante el color (los estados de stock y roles siempre incluyen texto explícito e iconos semánticos).
- **Idioma del Documento**: Atributo `lang="es"` fijado en la etiqueta `<html>`.

### 6.2 Diseño Responsivo Mobile-First
- **Flexibilidad de Pantalla (320 px a 4K)**: Maquetación basada en CSS Grid y Flexbox.
- **Presentación Adaptativa del CRUD**:
  - En pantallas móviles y tablets (`< 1024 px`), el listado se transforma en **tarjetas verticales independientes**, optimizando la lectura táctil.
  - En pantallas de escritorio (`>= 1024 px`), el listado se organiza en una **tabla semántica completa** con cabeceras `th[scope="col"]`.
- **Áreas Táctiles Mínimas**: Todos los botones, enlaces interactivos y controles táctiles cumplen con una dimensión mínima de **44 × 44 px**, facilitando su manipulación en dispositivos móviles.
- **Soporte de Zoom**: La interfaz conserva su estructura y operatividad completa al ampliar el zoom del navegador hasta el **200%**, sin generar barras de desplazamiento horizontal.

---

## 7. Conclusión

La aplicación desarrollada en este Trabajo 2 consolida un sistema web moderno, robusto y profesional. La integración entre el frontend React y la API en .NET 10 no sólo satisface los requisitos funcionales de un CRUD completo sobre el caso de negocio de **Búfalos Táctico**, sino que aplica de forma concreta la seguridad integral de extremo a extremo, la accesibilidad universal conforme a la norma WCAG 2.2 AA y la automatización de pruebas unitarias, de integración y end-to-end.
