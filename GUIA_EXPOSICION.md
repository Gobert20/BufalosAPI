# Guía y Guion para la Exposición Final y Demostración en Vivo

**Asignatura**: Lenguaje Programación Web II  
**Docente**: Enso Guidotti  
**Evaluación**: Trabajo 2 (15 puntos de exposición y demostración)  
**Proyecto**: Búfalos Táctico - Plataforma de Gestión de Equipamiento y Catálogo RESTful  

---

## 🎯 Objetivo de la Exposición

Evidenciar el dominio técnico del estudiante sobre:
1. La **arquitectura del frontend** y el consumo desacoplado de la API RESTful.
2. El **flujo de autenticación con JWT y autorización por roles** (Admin vs Cliente).
3. Las **medidas de seguridad de extremo a extremo** (OWASP) y la prueba en vivo de que los controles bloquean efectivamente accesos indebidos.
4. El cumplimiento de **accesibilidad WCAG 2.2 nivel AA** y el diseño **responsivo mobile-first**.
5. La justificación de las decisiones de diseño y la bitácora de uso de IA generativa.

---

## ⏱️ Estructura Temporal Recomendada (10 a 12 minutos)

| Bloque | Tema | Tiempo Sugerido |
| :--- | :--- | :---: |
| **Bloque 1** | Introducción y Arquitectura del Sistema | 2 minutos |
| **Bloque 2** | Flujo de Autenticación y Autorización por Roles (Demo en Vivo) | 3 minutos |
| **Bloque 3** | Pruebas de Seguridad en Vivo (401, 403, 429, CORS, XSS) | 3 minutos |
| **Bloque 4** | Accesibilidad por Teclado y Diseño Responsivo en Móvil | 2 minutos |
| **Bloque 5** | Pruebas Automatizadas, Bitácora de IA y Preguntas del Docente | 2 minutos |

---

## 🎙️ Guion Paso a Paso para la Presentación

### Bloque 1: Introducción y Arquitectura (2 min)
- **Saludo**: *"Buenos días/tardes profesor Enso Guidotti. Mi nombre es Goberto Parra y voy a presentar el Trabajo 2 correspondiente al consumo frontend, seguridad y accesibilidad de la plataforma Búfalos Táctico."*
- **Caso de Negocio**: *"El sistema gestiona artículos tácticos, equipamiento militar y elementos de seguridad balística. Opera con el recurso principal 'Productos' y el recurso relacionado 'Categorías'."*
- **Arquitectura Frontend**:
  - *"El frontend fue construido en **React 19** con **Vite** y **TypeScript**, estructurado en capas limpias y desacopladas:"*
    - *`src/api/client.ts`*: Cliente HTTP Axios centralizado con base URL por variable de entorno (`VITE_API_BASE_URL`), interceptores de solicitud para inyectar el token Bearer e interceptores de respuesta para normalizar errores (401, 403, 429, 500).
    - *`src/services/`*: Servicios independientes (`authService`, `productoService`, `categoriaService`), garantizando que los componentes de React no realicen llamadas HTTP directas.
    - *`src/context/`*: Manejo de estado global reactivo mediante `AuthContext` con soporte de expiración y logout seguro.
    - *`src/routes/`*: Enrutador con `ProtectedRoute` que restringe rutas públicas, privadas y exclusivas de rol `Admin`.

---

### Bloque 2: Demostración en Vivo: Autenticación y Roles (3 min)

#### Paso 0: Registro de Nuevo Usuario por Rol (Pestaña "Crear Cuenta")
1. En `/login`, hacer clic en la pestaña **"Crear Cuenta"**.
2. Mostrar los campos validados con Zod: Nombre Completo, Correo Electrónico, Selector de Rol (`Cliente`, `Técnico`, `Administrador`) y Contraseñas.
3. Explicar cómo la interfaz describe los permisos autorizados para cada rol seleccionado y cómo el backend almacena la relación con `TB_Roles`.
4. Registrar un usuario de prueba o mostrar la transición automática con credenciales pre-cargadas al confirmar el registro.

#### Paso 1: Ingreso como Cliente (Solo Lectura)
1. Abrir el navegador en `http://localhost:5173/login`.
2. Hacer clic en el botón de demostración **"Cargar Cliente"** (`cliente@bufalos.cl` / `Cliente123!`) y presionar "Ingresar al Sistema".
3. **Explicar**:
   - *"Al iniciar sesión como Cliente, el token JWT se recibe del servidor y se guarda en `sessionStorage`."*
   - *"El cliente puede navegar por el catálogo, buscar por nombre ('Chaqueta'), filtrar por categorías y consultar el detalle de cualquier producto."*
   - *"Noten que los botones 'Nuevo Producto', 'Editar' y 'Eliminar' están completamente ocultos para este rol en la interfaz."*

#### Paso 2: Intento de Acceso No Autorizado como Cliente (Ruta Protegida)
1. Con la sesión de Cliente abierta, escribir manualmente en la URL: `http://localhost:5173/productos/nuevo`.
2. Presionar Enter.
3. **Explicar**:
   - *"El guardia `ProtectedRoute` evalúa que el rol del usuario es 'Cliente' pero la ruta exige 'Admin'. Inmediatamente intercepta la navegación y redirige a la vista **403 - Acceso Denegado**."*
   - *"Aquí se informa claramente al usuario qué rol posee y qué rol requiere la operación, ofreciendo botones accesibles para regresar."*

#### Paso 3: Ingreso como Administrador (CRUD Completo)
1. Presionar "Cerrar Sesión" en la barra superior.
2. Ingresar con **"Cargar Admin"** (`admin@bufalos.cl` / `Admin123!`).
3. **Explicar y Demostrar**:
   - *"Ahora el usuario es Administrador. Aparece en el Navbar el badge 'Admin' y el enlace 'Nuevo Producto'."*
   - **Crear**: Ir a "Nuevo Producto", completar el formulario validado con Zod y guardar. Mostrar cómo se redirige a la vista de detalle y luego al catálogo.
   - **Editar**: Hacer clic en el lápiz de edición de un producto, modificar el precio o stock y guardar.
   - **Eliminar**: Hacer clic en el icono de basurero. *"Se abre el diálogo modal accesible que cumple el patrón WAI-ARIA Dialog, con trampa de foco y confirmación explícita para evitar pérdidas accidentales de datos."*

---

### Bloque 3: Demostración de Controles de Seguridad (3 min)

#### 1. Prueba de Rate Limiting (OWASP API4: Fuerza Bruta)
- Ir a `/login`.
- Ingresar cualquier contraseña incorrecta y presionar "Ingresar al Sistema" 6 veces seguidas rápidamente.
- **Resultado en Vivo**: *"Al 6to intento, el backend en .NET responde con código HTTP 429 Too Many Requests. El frontend captura este código y despliega la advertencia 'Demasiados intentos fallidos (429). Por seguridad, espere 1 minuto antes de reintentar'."*

#### 2. Prueba de Enforzamiento de Roles en Backend (OWASP API5)
- **Explicar**: *"La seguridad no depende sólo del frontend. Si un atacante usa el token de Cliente e intenta enviar un POST directo a la API mediante Postman o cURL, el endpoint en `Program.cs` tiene `.RequireAuthorization('AdminOnly')` y el servidor responde con **403 Forbidden**, bloqueando la acción."*

#### 3. Prueba de Neutralización de Inyección de Scripts (OWASP XSS)
- En el formulario de producto, ingresar en el nombre: `<script>alert('xss')</script>`.
- Guardar el registro.
- **Resultado en Vivo**: *"React renderiza el nombre como texto plano escapado. No se ejecuta ningún script, y la Content-Security-Policy (CSP) configurada en `index.html` prohíbe la inyección."*

#### 4. Prueba de CORS Restringido (OWASP API8)
- **Explicar**: *"La API sólo admite peticiones desde `http://localhost:5173`. Si se invoca desde otro origen en un navegador, la política CORS bloquea la lectura de datos."*

---

### Bloque 4: Accesibilidad (WCAG 2.2 AA) y Diseño Responsivo (2 min)

#### 1. Navegación Completa con Teclado
- Recargar la página y presionar la tecla **`Tab`**:
  - *"Observen cómo aparece el enlace de omisión inicial: 'Saltar al contenido principal' para lectores de pantalla."*
  - *"Continuamos tabulando: cada elemento interactivo cuenta con un anillo de foco visible (`focus-visible:ring-2 focus-visible:ring-blue-600`)."*
  - *"Abrimos el diálogo modal de eliminación con `Enter`. Al presionar `Tab`, el foco se mantiene atrapado dentro del modal, y al presionar la tecla `Escape`, el diálogo se cierra y el foco regresa al botón original."*

#### 2. Diseño Responsivo Mobile-First (DevTools)
- Abrir las herramientas de desarrollador (`F12`) y activar la vista responsive a **375 px (iPhone)** o **320 px**:
  - *"Noten cómo el diseño se reorganiza fluidamente sin scroll horizontal."*
  - *"La tabla de escritorio se transforma en una cuadrícula de tarjetas táctiles."*
  - *"El menú superior se convierte en un botón de hamburguesa accesible con `aria-expanded`."*
  - *"Todos los controles táctiles cumplen con la pauta de área mínima de **44 × 44 px** para facilitar el toque en dedos."*

---

### Bloque 5: Preguntas Frecuentes del Docente y Respuestas Técnicas

#### Pregunta 1: *"¿Por qué eligieron almacenar el JWT en sessionStorage/localStorage en lugar de una cookie HttpOnly?"*
- **Respuesta**: *"En una aplicación SPA desacoplada de la API RESTful (operando en orígenes o puertos distintos con CORS), el estándar de autorización en la cabecera `Authorization: Bearer <token>` ofrece mayor interoperabilidad y neutraliza ataques CSRF por diseño, ya que el navegador no envía el token automáticamente en peticiones cross-site. Para mitigar el riesgo de XSS asociado al almacenamiento en cliente, implementamos tres barreras: renderizado estricto como texto plano sin `dangerouslySetInnerHTML`, Content-Security-Policy (CSP) estricta, y el uso por defecto de `sessionStorage`, que destruye el token al cerrar la pestaña."*

#### Pregunta 2: *"¿Dónde se valida el rol, en el cliente o en el servidor?"*
- **Respuesta**: *"En ambos lados bajo el principio de defensa en profundidad. En el cliente, el componente `ProtectedRoute` y los condicionales de renderizado mejoran la experiencia de usuario ocultando acciones o redirigiendo a 403. Sin embargo, el servidor valida obligatoriamente el rol en cada petición: en `Program.cs` se definió la política `AdminOnly` mediante `.RequireAuthorization('AdminOnly')` en los endpoints POST, PUT y DELETE. Incluso si un atacante elude el frontend, el backend responde con código HTTP 403 Forbidden."*

#### Pregunta 3: *"¿Qué herramientas y prompts de IA utilizaron y qué correcciones realizaron sobre el código generado?"*
- **Respuesta**: *"Se utilizó el modelo Gemini 3.8 Flash dentro del entorno Antigravity con cuenta institucional, documentado en el archivo `AI_LOG.md`. Se realizaron tres correcciones técnicas clave:
  1. La IA inicialmente intentó asignar IDs fijos a columnas de identidad en SQL Server durante el seeding; se corrigió para dejar que SQL Server gestione los auto-incrementos y consultarlos con LINQ.
  2. En los esquemas de Zod, los modificadores `.default()` generaban colisiones de tipos con `react-hook-form`; se corrigieron para definir los valores iniciales directamente en el hook.
  3. En las pruebas de Testing Library, el diseño responsivo generaba dos elementos de texto coincidentes (uno en la tabla de escritorio y otro en las tarjetas móviles), por lo que se ajustó el selector a `findAllByText` para soportar ambas vistas."*

#### Pregunta 4: *"¿Cómo se aseguró que las dependencias no tuvieran vulnerabilidades?"*
- **Respuesta**: *"En el frontend, ejecutamos `npm audit` obteniendo 0 vulnerabilidades. En el backend, detectamos inicialmente una vulnerabilidad alta en `Microsoft.OpenApi` 2.0.0 (GHSA-v5pm-xwqc-g5wc); la mitigamos actualizando el paquete a la versión 2.12.2, logrando una compilación limpia con 0 advertencias y 0 vulnerabilidades."*
