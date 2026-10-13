# Búfalos Táctico - Plataforma de Gestión de Equipamiento y Catálogo RESTful

Sistema integral de comercio y administración de artículos tácticos, indumentaria militar y elementos de protección, compuesto por una **API RESTful en .NET 10** y un **Frontend SPA en React + Vite + TypeScript**, diseñado con altos estándares de seguridad (**OWASP API Security Top 10** & **OWASP Web Top 10**), accesibilidad (**WCAG 2.2 Nivel AA**) y arquitectura mobile-first.

---

## 📋 Información de la Evaluación
- **Asignatura**: Lenguaje Programación Web II
- **Unidad Temática**: UT2: Consumo de APIs RESTful desde aplicaciones frontend y seguridad
- **Docente**: Enso Guidotti
- **Evaluación**: Trabajo 2 (100% Evaluación 2)
- **Modalidad**: Individual

---

## 🏛️ Arquitectura del Sistema

```
[ Cliente Navegador (Móvil / Tablet / Desktop) ]
                     │
            (HTTPS / HTTP CORS)
                     │
       ┌─────────────▼─────────────┐
       │   Frontend SPA (React)    │
       │   • React Router v7       │
       │   • Axios (Bearer JWT)    │
       │   • Zod + React Hook Form │
       │   • Tailwind CSS (WCAG)   │
       └─────────────┬─────────────┘
                     │ REST API / JSON
       ┌─────────────▼─────────────┐
       │  Backend API (.NET 10)    │
       │   • Minimal APIs RESTful  │
       │   • Rate Limiting (429)   │
       │   • Security Headers      │
       │   • JWT Auth + Roles      │
       └─────────────┬─────────────┘
                     │ Entity Framework Core
       ┌─────────────▼─────────────┐
       │     SQL Server / Local    │
       │        (Bufalos_DB)       │
       └───────────────────────────┘
```

### Componentes y Tecnologías
- **Backend**: C# / .NET 10, ASP.NET Core Minimal APIs, Entity Framework Core 10, BCrypt.Net-Next, JWT Bearer Tokens, Scalar / OpenAPI, xUnit.
- **Frontend**: React 19, TypeScript, Vite 6, React Router DOM, Axios con interceptores centralizados, React Hook Form con validación Zod, Tailwind CSS, Lucide React, Vitest, Testing Library, Playwright.

---

## 🚀 Puesta en Marcha e Instalación

### 1. Requisitos Previos
- **.NET 10 SDK** (o superior) instalado en el sistema.
- **Node.js** (v20+ o v22+ LTS) y **npm**.
- **SQL Server** (SQLEXPRESS o LocalDB) en ejecución.

---

### 2. Configuración y Ejecución del Backend (API)

1. Abrir terminal en el directorio del backend:
   ```powershell
   cd BufalosAPI/BufalosAPI
   ```
2. Configurar la cadena de conexión en `appsettings.json` (o mediante variables de entorno):
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=.\\SQLEXPRESS;Database=Bufalos_DB;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;"
   }
   ```
3. Ejecutar las pruebas de integración del backend:
   ```powershell
   dotnet test
   ```
4. Iniciar la API RESTful:
   ```powershell
   dotnet run
   ```
   *La API iniciará en `http://localhost:51800` (HTTP) y `https://localhost:51799` (HTTPS). Al arrancar, creará y sembrará automáticamente las tablas y usuarios iniciales si no existen.*

---

### 3. Configuración y Ejecución del Frontend

1. Abrir terminal en el directorio del frontend:
   ```powershell
   cd frontend
   ```
2. Instalar dependencias:
   ```powershell
   npm install
   ```
3. Verificar variables de entorno en `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:51800/api/v1
   ```
4. Ejecutar las pruebas unitarias y de componentes:
   ```powershell
   npm test
   ```
5. Iniciar el servidor de desarrollo:
   ```powershell
   npm run dev
   ```
   *El frontend estará disponible en `http://localhost:5173`.*

---

## 👥 Credenciales de Prueba (Seeding Automático)

| Rol | Correo Electrónico | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@bufalos.cl` | `Admin123!` | Listar, consultar detalle, **crear**, **editar** y **eliminar** productos tácticos. |
| **Cliente** | `cliente@bufalos.cl` | `Cliente123!` | Listar productos, consultar detalle y filtrar por categorías (Modo sólo lectura). |

*Nota: La pantalla de login incluye botones de acceso rápido para cargar automáticamente estas credenciales durante la demostración en vivo.*

---

## 🛡️ Catálogo de Riesgos de Seguridad Mitigados (OWASP)

| # | Riesgo | Referencia OWASP | Mitigación Aplicada | Lado |
| :- | :--- | :--- | :--- | :- |
| 1 | **Cross-Site Scripting (XSS)** | Web Top 10: Injection | Renderizado seguro de texto nativo en React, sin `dangerouslySetInnerHTML`, Content-Security-Policy (CSP) estricta en HTML y cabeceras. | **Cliente** |
| 2 | **Robo o Filtración de Tokens** | API2:2023 Broken Authentication | Almacenamiento seguro en sessionStorage (con opción localStorage justificada), expiración controlada, depuración total en logout, exclusión absoluta del token en URLs y logs. | **Cliente** |
| 3 | **Control de Acceso Roto a Nivel de Función** | API5:2023 Broken Function Level Auth | `ProtectedRoute` con validación de rol `Admin` en cliente y directiva `.RequireAuthorization("AdminOnly")` obligatoria en los endpoints de mutación (POST, PUT, DELETE) del servidor. | **Ambos** |
| 4 | **Fuerza Bruta y Consumo sin Límites** | API4:2023 Unrestricted Resource Consumption | Middleware de Rate Limiting en backend (máximo 5 peticiones por minuto en login) y captura en cliente del código HTTP 429 con mensaje claro al usuario. | **Ambos** |
| 5 | **Configuración Insegura (CORS, Cabeceras, Errores)** | API8:2023 Security Misconfiguration | CORS restringido a `http://localhost:5173`, cabeceras HTTP de seguridad (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, etc.), middleware global que neutraliza filtraciones de stack traces o `ex.Message`. | **API** |
| 6 | **Validación de Entradas Insuficiente** | Web Top 10: Injection | Esquemas Zod estrictos en el formulario frontend y validación de DTOs con consultas parametrizadas en EF Core. | **Ambos** |
| 7 | **Dependencias Vulnerables** | Web Top 10: Vulnerable Components | `npm audit` limpio (0 vulnerabilidades) y actualización de `Microsoft.OpenApi` a versión 2.12.2 mitigando GHSA-v5pm-xwqc-g5wc. | **Ambos** |

---

## ♿ Accesibilidad (WCAG 2.2 Nivel AA) y Diseño Responsivo

- **HTML Semántico**: Landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`), estructura jerárquica de títulos (`h1`, `h2`), tablas semánticas con `<caption>`, `<thead>`, `<th>` con `scope="col"`.
- **Formularios Accesibles**: Todos los campos vinculados mediante `<label htmlFor="...">`, atributos `aria-describedby` que enlazan mensajes de error y `aria-invalid="true"`. Errores dinámicos anunciados mediante `role="alert"` y `aria-live="polite"`.
- **Navegación por Teclado**: Enlace de salto inicial (*Skip to content*), foco visible mediante `focus-visible:ring-2 focus-visible:ring-blue-600`, diálogo modal con captura de foco y cierre con tecla `Escape`.
- **Contraste y Color**: Relación de contraste mínima de 4.5:1 en texto regular; ninguna información depende exclusivamente del color (acompañada siempre de texto e iconos).
- **Diseño Mobile-First**: Adaptación fluida desde 320 px sin scroll horizontal; controles interactivos con área táctil mínima de 44 × 44 px; presentación en tarjetas para móvil y tabla para escritorio.

---

## 🧪 Ejecución de Pruebas Automatizadas

### Pruebas de Integración Backend (.NET)
```powershell
cd BufalosAPI/BufalosAPI
dotnet test
```
*Cobertura: 6 pruebas de integración que validan endpoints públicos (200), recurso relacionado (200), rechazo sin token (401), rechazo por rol insuficiente (403), autorización Admin (201) y login con JWT.*

### Pruebas Unitarias y de Componentes Frontend (Vitest)
```powershell
cd frontend
npm test
```
*Cobertura: 9 pruebas que validan formulario de login, validaciones Zod, protección de rutas por roles (403/login) y operaciones CRUD con diálogo de confirmación.*

### Pruebas End-to-End (Playwright)
```powershell
cd frontend
npm run test:e2e
```
*Cobertura: Flujo completo de navegación E2E: Login Admin -> Creación de producto -> Verificación en detalle -> Verificación en listado.*

---

## 📁 Estructura del Proyecto

```
BufalosAPI/
├── BufalosAPI/                         # Solución .NET 10 (Backend)
│   ├── BufalosAPI/
│   │   ├── Data/                      # DbContext y DbInitializer (Seeding)
│   │   ├── Endpoints/                 # Minimal APIs (Usuario, Producto, Categoria)
│   │   ├── Middleware/                # ErrorAndLoggingMiddleware seguro
│   │   ├── Models/                    # Modelos de dominio (Producto, Categoria, etc.)
│   │   ├── Services/                  # AuthService (BCrypt y JWT)
│   │   ├── appsettings.json           # Configuración con SQL Server
│   │   ├── .env.example               # Variables de entorno backend
│   │   └── Program.cs                 # Pipeline HTTP, CORS, RateLimiting
│   └── BufalosAPI.Tests/              # Suite de pruebas xUnit de backend
├── frontend/                           # SPA React + Vite + TypeScript (Frontend)
│   ├── e2e/                           # Pruebas End-to-End Playwright
│   ├── src/
│   │   ├── api/                       # Cliente HTTP Axios centralizado con interceptores
│   │   ├── components/                # Componentes accesibles (UI, Layout, Auth)
│   │   ├── context/                   # AuthContext con gestión de sesión y roles
│   │   ├── hooks/                     # useAuth hook
│   │   ├── pages/                     # Vistas (Login, Listado, Detalle, Form, 403, 404)
│   │   ├── routes/                    # Enrutador con ProtectedRoute
│   │   ├── services/                  # Capa de consumo (auth, producto, categoria)
│   │   ├── test/                      # Pruebas de componentes Vitest
│   │   └── types/                     # Tipos e interfaces TypeScript
│   ├── .env.example                   # Variables de entorno frontend
│   └── vite.config.ts                 # Configuración Vite, Tailwind y Vitest
├── INFORME_TECNICO.md                  # Informe técnico con decisiones y matriz OWASP
├── AI_LOG.md                           # Bitácora transparente de uso de IA generativa
├── TESTS_EVIDENCIA.md                  # Registro y reporte de ejecución de pruebas
├── SEGURIDAD_ACCESIBILIDAD.md          # Evidencias de controles y verificación WCAG
└── README.md                          # Este archivo
```
