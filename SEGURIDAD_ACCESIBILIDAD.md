# Evidencia de Verificación de Seguridad y Accesibilidad (WCAG 2.2 AA)

**Proyecto**: Búfalos Táctico - Plataforma de Gestión de Equipamiento y Catálogo RESTful  
**Asignatura**: Lenguaje Programación Web II  
**Docente**: Enso Guidotti  
**Evaluación**: Trabajo 2  

---

## 1. Evidencia de Controles de Seguridad en Ejecución

### 1.1 Control de Acceso: Respuestas 401 Unauthorized y 403 Forbidden

#### Caso 401 Unauthorized (Sin Autenticación)
- **Escenario**: Un usuario intenta enviar una solicitud `POST /api/v1/productos` sin la cabecera `Authorization: Bearer <token>`.
- **Comportamiento del Servidor**:
  ```http
  HTTP/1.1 401 Unauthorized
  WWW-Authenticate: Bearer
  Date: Tue, 13 Oct 2026 19:10:00 GMT
  Content-Length: 0
  ```
- **Comportamiento del Cliente**:
  - En el frontend, el interceptor de Axios detecta el código `401`, limpia cualquier token residual de `sessionStorage` y redirige al usuario a la página de `/login` con el mensaje:
  > *"Sesión no autorizada o token expirado. Por favor, inicie sesión nuevamente."*

#### Caso 403 Forbidden (Rol Insuficiente en Backend y Cliente)
- **Escenario**: Un usuario inicia sesión con la cuenta de cliente (`cliente@bufalos.cl`, rol `Cliente`) e intenta crear o eliminar un producto táctico.
- **En la Interfaz (Cliente)**:
  - Los botones de "Nuevo Producto", "Editar" y "Eliminar" no se renderizan en el DOM.
  - Si el usuario escribe manualmente en la barra del navegador la URL protegida `http://localhost:5173/productos/nuevo`, el componente `ProtectedRoute` intercepta la navegación y lo redirige a la vista dedicada **`/403 - Acceso Denegado`** (`ForbiddenPage`), indicando:
  > *"No cuenta con los privilegios requeridos para acceder a este recurso protegido. Su rol asignado: Cliente. Rol requerido: Admin."*
- **En la API (Servidor)**:
  - Si el usuario intenta forzar la petición directamente mediante Postman o cURL con su token de `Cliente`:
  ```bash
  curl -X POST http://localhost:51800/api/v1/productos \
    -H "Authorization: Bearer <token_de_cliente>" \
    -H "Content-Type: application/json" \
    -d '{"nombre":"Producto No Autorizado","precio":10000,"stock":5,"id_Categoria":1}'
  ```
  - **Respuesta de la API**:
  ```http
  HTTP/1.1 403 Forbidden
  Content-Length: 0
  ```
  - *Evidencia*: Comprobado y verificado mediante la prueba de integración `CrearProducto_ConRolCliente_DevuelveHttp403Forbidden` (100% pasando).

---

### 1.2 Mitigación de Fuerza Bruta: Rate Limiting (429 Too Many Requests)
- **Implementación**:
  - En `Program.cs`, el backend configura un limitador de ventana fija de 5 solicitudes por minuto para el endpoint `/login`:
  ```csharp
  builder.Services.AddRateLimiter(options => {
      options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
      options.AddFixedWindowLimiter("login-limiter", opt => {
          opt.PermitLimit = 5;
          opt.Window = TimeSpan.FromMinutes(1);
      });
  });
  ```
- **Comportamiento al Exceder el Límite**:
  - Al sexto intento consecutivo de inicio de sesión en menos de 60 segundos, la API responde:
  ```http
  HTTP/1.1 429 Too Many Requests
  Retry-After: 60
  Content-Length: 0
  ```
  - El frontend captura el código 429 en `LoginPage.tsx` y despliega la alerta de advertencia:
  > *"Demasiados intentos fallidos en poco tiempo (429 Too Many Requests). Por seguridad, espere 1 minuto antes de reintentar."*
  - El botón de envío se desactiva temporalmente para evitar saturar el ancho de banda.

---

### 1.3 Política CORS Restringida a Orígenes Explícitos
- **Implementación**:
  - La API prohíbe el uso de políticas comodín (`AllowAnyOrigin`). En `Program.cs`:
  ```csharp
  options.AddPolicy("FrontendCorsPolicy", policy => {
      policy.WithOrigins(
          "http://localhost:5173",
          "https://localhost:5173",
          "http://127.0.0.1:5173"
      )
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials();
  });
  ```
- **Verificación**:
  - Cuando una petición preflight `OPTIONS` o `GET` proviene de un origen no autorizado (por ejemplo `http://sitio-malicioso.com`), el navegador bloquea la respuesta al no recibir la cabecera `Access-Control-Allow-Origin: http://sitio-malicioso.com`.

---

### 1.4 Cabeceras de Seguridad HTTP y Fuga de Información Neutralizada
- **Cabeceras Inyectadas en cada Respuesta**:
  ```http
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  ```
- **Manejo Seguro de Excepciones**:
  - En `ErrorAndLoggingMiddleware.cs`, los errores internos imprevistos (500) se registran de forma detallada en los logs del servidor (con stack trace completo) pero **nunca** se exponen al cliente.
  - La respuesta al cliente es un JSON estandarizado y sanitizado:
  ```json
  {
    "status": 500,
    "error": "InternalServerError",
    "message": "Ha ocurrido un error interno procesando su solicitud. Por favor intente más tarde.",
    "correlationId": "0HN1K2L3M4N5"
  }
  ```

---

### 1.5 Neutralización de Inyección de Scripts (XSS)
- **Prueba de Inyección**:
  - Se ingresa como nombre de un producto la carga útil:
  ```html
  <script>alert('Ataque XSS exitoso')</script>
  ```
- **Resultado en el Navegador**:
  - React no utiliza `dangerouslySetInnerHTML`.
  - La cadena se renderiza literalmente como texto plano: `&lt;script&gt;alert('Ataque XSS exitoso')&lt;/script&gt;`.
  - Ningún script se ejecuta en la consola ni en el contexto de navegación.
  - Adicionalmente, la Content-Security-Policy (CSP) en `index.html` bloquea cualquier ejecución de scripts en línea no autorizados.

---

## 2. Evidencia de Cumplimiento de Accesibilidad (WCAG 2.2 Nivel AA)

| Criterio WCAG 2.2 AA | Requisito | Implementación en Búfalos Táctico | Evidencia en el Código |
| :--- | :--- | :--- | :--- |
| **1.1.1 Contenido no textual** | Todo contenido no textual tiene alternativa textual. | Todos los iconos Lucide cuentan con `aria-hidden="true"` cuando son decorativos, o con `aria-label` descriptivo en botones de acción. | `X className="..." aria-hidden="true"` |
| **1.3.1 Información y relaciones** | La información y la estructura se determinan por código. | HTML semántico con landmarks `<header role="banner">`, `<nav role="navigation">`, `<main id="main-content" role="main">`, `<footer role="contentinfo">`. Tablas con `<caption>` y `<th scope="col">`. | `Layout.tsx`, `ProductosListPage.tsx` |
| **1.4.3 Contraste mínimo** | Relación de contraste de al menos 4.5:1 en texto normal. | Texto principal `#0f172a` (Slate 900) sobre fondo `#f8fafc` (Slate 50), contraste superior a 14:1. Botones primarios azul intenso `#1d4ed8` sobre blanco, contraste 7.2:1. Badges con fondos claros y textos de contraste alto. | Paleta de colores Tailwind configurada en `index.css` |
| **1.4.4 Cambio de tamaño del texto** | El texto puede aumentarse hasta un 200% sin pérdida de contenido. | Uso de unidades relativas (`rem`, flexbox, grid). Al aplicar zoom de 200% en el navegador, el diseño se reorganiza fluidamente sin scroll horizontal. | `index.css`, `Layout.tsx` |
| **2.1.1 Teclado** | Toda la funcionalidad está disponible mediante teclado. | Se puede operar el 100% de la aplicación usando únicamente `Tab`, `Shift+Tab`, `Enter`, `Espacio` y `Escape`. Existe un enlace de salto inicial (*Skip link*). | `.skip-to-content:focus` en `index.css` |
| **2.4.7 Foco visible** | El indicador del foco del teclado es visible. | Indicador de foco de alto contraste con anillo azul y desplazamiento: `focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none`. | Definido en `Button.tsx`, `Input.tsx`, `Navbar.tsx` |
| **2.5.8 Tamaño del objetivo (mínimo)** | El tamaño del objetivo es de al menos 24x24 px (y 44x44 px recomendado para móviles). | Todos los botones, enlaces interactivos e inputs poseen una dimensión táctil mínima de **44 × 44 px** (`min-h-[44px]`). | `button, a, input { min-height: 44px; }` en `index.css` |
| **3.1.1 Idioma de la página** | El idioma predeterminado de la página puede determinarse por código. | Atributo `lang="es"` definido en la etiqueta raíz `<html>`. | `index.html` |
| **3.3.1 Identificación de errores** | Los errores de entrada se identifican y describen al usuario. | Al fallar la validación, los errores se muestran vinculados con `aria-describedby` y se anuncian a tecnologías asistivas mediante `role="alert"` y `aria-live="polite"`. | `Input.tsx`, `Alert.tsx` |
| **3.3.2 Etiquetas o instrucciones** | Se proporcionan etiquetas para las entradas que requieren entrada de usuario. | Cada campo cuenta con su etiqueta explícita `<label htmlFor="...">`. | `Input.tsx`, `Select.tsx`, `Textarea.tsx` |
| **WAI-ARIA Dialog** | Diálogos modales con trampa de foco y cierre accesible. | `Modal.tsx` y `ConfirmDialog.tsx` cuentan con `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, captura cíclica de tabulación y cierre con tecla `Escape`. | `Modal.tsx` |

---

## 3. Evidencia de Diseño Responsivo Mobile-First

### 3.1 Vista Móvil (320 px a 767 px)
- **Viewport**: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`.
- **Menú de Navegación**: Se compacta en un botón de hamburguesa accesible con `aria-expanded` y menú desplegable accesible.
- **Listado de Productos**: La tabla se reemplaza automáticamente por una cuadrícula de **tarjetas individuales**, mostrando el nombre, categoría, precio destacado, stock y botones de acción verticalmente apilados con áreas táctiles amplias.
- **Formularios**: Las columnas dobles de precio y stock se apilan verticalmente a 1 columna completa.

### 3.2 Vista Tableta (768 px a 1023 px)
- La cuadrícula de tarjetas se distribuye fluidamente en 2 columnas (`sm:grid-cols-2`), optimizando el aprovechamiento del ancho disponible sin desbordamientos.

### 3.3 Vista Escritorio (1024 px en adelante)
- La navegación superior se expande horizontalmente en la barra principal.
- El listado se presenta en formato de **tabla completa con datos extendidos** (ID, Nombre, Descripción, Categoría, Precio, Stock, Restricciones de edad y botones de acción con tooltip y labels accesibles).
