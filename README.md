# Donaton — Frontend

Interfaz de usuario para la plataforma de donaciones solidaria Donaton. Construida con React y Vite, se comunica exclusivamente con el API Gateway del backend.

---

## Stack tecnológico

| Elemento | Versión |
|---|---|
| React | 19 |
| React Router DOM | 7 |
| Vite | 8 |
| Tailwind CSS | 4 (solo utilidades base) |
| Fuentes | Syne (display) + DM Sans (body) |
| Estilos | CSS Variables + inline styles |

---

## Requisitos previos

- Node.js 18+
- npm 9+
- Backend corriendo en `http://localhost:9090`

---

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build de producción
npm run build

# Previsualizar build
npm run preview
```

La app queda disponible en `http://localhost:5173`.

---

## Variables de configuración

No usa archivo `.env`. La URL del Gateway está centralizada en `src/services/api.js`:

```js
const BASE_URL = 'http://localhost:9090'
```

Si cambias el puerto del Gateway, solo debes modificar esa constante.

---

## Estructura de carpetas

```
donaton--frontend/
├── public/                         # Archivos estáticos servidos directamente
├── src/
│   ├── assets/                     # Imágenes y recursos estáticos importados en componentes
│   │   └── hero.png
│   │
│   ├── components/                 # Componentes reutilizables
│   │   ├── admin/                  # Panel de administración
│   │   │   ├── AdminUI.jsx         # Badge y MetricCard compartidos dentro del panel
│   │   │   ├── Dashboard.jsx       # Métricas y resumen general del admin
│   │   │   ├── GestionDonaciones.jsx  # CRUD de donaciones y donantes
│   │   │   ├── GestionLogistica.jsx   # Centros de acopio, inventario y envíos
│   │   │   ├── GestionNecesidades.jsx # Zonas afectadas y reportes en terreno
│   │   │   └── GestionUsuarios.jsx    # Gestión de cuentas de usuario
│   │   │
│   │   ├── user/                   # Componentes exclusivos del usuario donante
│   │   │   └── DonationModal.jsx   # Modal de donación multi-paso
│   │   │
│   │   ├── AuthModal.jsx           # Modal de login / registro
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx                # Sección principal del landing
│   │   ├── Navbar.jsx              # Barra de navegación con dropdown de usuario
│   │   ├── Noticias.jsx            # Sección de noticias del landing
│   │   └── QuienesSomos.jsx        # Sección "Quiénes somos" del landing
│   │
│   ├── context/
│   │   └── AuthContext.jsx         # Contexto global de autenticación (usuario, login, logout)
│   │
│   ├── data/
│   │   └── regiones.js             # Lista de regiones de Chile para formularios
│   │
│   ├── pages/                      # Vistas completas (una por ruta)
│   │   ├── LandingPage.jsx         # Página de inicio pública
│   │   ├── AdminPanel.jsx          # Panel de administración (solo ROLE_ADMIN)
│   │   ├── PerfilUsuario.jsx       # Perfil del donante con tabs
│   │   ├── MisDonaciones.jsx       # Historial de donaciones del usuario
│   │   └── ConfirmacionDeposito.jsx # Flujo de confirmación de depósito en efectivo
│   │
│   ├── services/
│   │   ├── api.js                  # Cliente HTTP para todos los endpoints del Gateway
│   │   └── AdminApi.js             # Cliente HTTP con manejo extra de errores para el admin
│   │
│   ├── App.jsx                     # Definición de rutas con React Router
│   ├── App.css
│   ├── index.css                   # Variables CSS globales y reset
│   └── main.jsx                    # Punto de entrada de la aplicación
│
├── index.html
├── vite.config.js
├── package.json
└── eslint.config.js
```

---

## Rutas de la aplicación

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | `LandingPage` | Público |
| `/admin` | `AdminPanel` | Solo `ROLE_ADMIN` |
| `/perfil` | `PerfilUsuario` | Usuario autenticado |
| `/mis-donaciones` | `MisDonaciones` | Usuario autenticado |
| `/confirmar-deposito` | `ConfirmacionDeposito` | Usuario autenticado |

---

## Autenticación

La autenticación está centralizada en `AuthContext.jsx`. Al iniciar la app, verifica si existe un token en `localStorage` y llama a `/auth/me` para restaurar la sesión automáticamente.

```
Login  →  POST /auth/login  →  guarda token en localStorage  →  setUser(...)
Logout →  elimina token de localStorage  →  setUser(null)
```

El contexto expone:

| Valor | Tipo | Descripción |
|---|---|---|
| `user` | objeto | Datos del usuario: `username`, `nombre`, `rol`, `rut` |
| `loading` | boolean | `true` mientras se verifica el token inicial |
| `login(u, p)` | función | Hace login y actualiza el estado |
| `logout()` | función | Borra sesión local |
| `isAdmin` | boolean | `true` si `rol === 'ROLE_ADMIN'` |
| `isUser` | boolean | `true` si `rol === 'ROLE_USER'` |

---

## Servicios HTTP (`src/services/`)

### `api.js`
Cliente general usado por páginas de usuario. Agrega el token JWT automáticamente en cada request.

```js
// Namespaces disponibles:
auth.login(body)
auth.register(body)
auth.me()

donaciones.registrarDonante(body)
donaciones.registrar(body)
donaciones.historial(rut)
donaciones.historialAdmin(page)

logistica.obtenerCentro(id)
logistica.crearEnvio(body)
logistica.listarEnvios(page)
logistica.rastrear(numero)

necesidades.listarZonas()
necesidades.listarUrgentes()
necesidades.listarReportes(page)
necesidades.crearReporte(body)
necesidades.resumenAdmin()
```

### `AdminApi.js`
Versión ampliada para el panel de administración. Maneja correctamente respuestas `204 No Content` y errores de autenticación con logs descriptivos.

```js
adminDonaciones.listarGlobal(page, size)
adminDonaciones.listarDonantes()
adminDonaciones.obtenerDonante(rut)
adminDonaciones.actualizarDonante(id, body)
adminDonaciones.eliminarDonante(id)
adminDonaciones.registrar(body)
adminDonaciones.eliminarRecurso(id)
```

---

## Sistema de diseño

El diseño no usa Tailwind utilitariamente: se basa en **CSS Variables globales** definidas en `index.css` y aplicadas mediante inline styles en cada componente.

### Variables principales

| Variable | Valor | Uso |
|---|---|---|
| `--bg` | `#0a0a0f` | Fondo de página |
| `--surface` | `#12121a` | Tarjetas y paneles |
| `--surface2` | `#1a1a26` | Fondos secundarios, hover |
| `--accent` | `#e8345a` | Rojo Donaton (botones CTA, badges) |
| `--accent2` | `#ff6b35` | Naranja (gradientes, degradados) |
| `--text` | `#f0eee8` | Texto principal |
| `--muted` | `#888898` | Texto secundario, labels |
| `--border` | `rgba(255,255,255,.07)` | Bordes de tarjetas |
| `--font-display` | `Syne` | Títulos y headings |
| `--font-body` | `DM Sans` | Texto general y UI |

### Animaciones globales

```css
/* Disponible en todos los modales */
@keyframes modalIn {
  from { opacity: 0; transform: scale(.9) translateY(20px); }
  to   { opacity: 1; transform: none; }
}
```

---

## Flujo del usuario donante

```
Landing  →  Login / Registro (AuthModal)
         ↓
       Navbar dropdown  →  "Mi perfil"  →  /perfil
                        →  "Mis donaciones"  →  /mis-donaciones

/perfil
  ├── Tab "Mi perfil"    → muestra datos del donante o aviso de perfil incompleto
  ├── Tab "Completar / Editar datos"  → formulario Particular o Empresa
  └── Tab "Cuenta"       → datos de cuenta (username, rol)

/mis-donaciones
  ├── Estadísticas (total, pendientes, aprobadas)
  ├── Filtros por tipo y estado
  └── Tabla historial  →  donaciones DINERO pendientes muestran "Confirmar depósito →"

/confirmar-deposito
  ├── Paso 1: Instrucciones bancarias (datos copiables)
  ├── Paso 2: Formulario de confirmación (boleta, banco, monto, fecha)
  └── Paso 3: Éxito con N° de seguimiento
```

---

## Flujo del administrador

```
Login con ROLE_ADMIN
  ↓
Navbar dropdown  →  "Panel admin"  →  /admin

/admin (AdminPanel)
  ├── Dashboard         → métricas generales de los 3 microservicios
  ├── Gestión Donaciones → listar/eliminar donantes y recursos donados
  ├── Gestión Logística  → centros de acopio, inventario, envíos
  ├── Gestión Necesidades → zonas afectadas, reportes urgentes, asignaciones
  └── Gestión Usuarios   → listar cuentas de acceso
```

---

## Notas importantes

- **Sin service workers ni PWA**: la app es 100% SPA estándar.
- **Sin Redux**: el estado global se limita al `AuthContext`. El resto es estado local por componente con `useState`.
- **Protección de rutas**: implementada directamente en cada página con `useEffect` + `navigate('/')` si no hay sesión activa.
- **Roles**: la navbar detecta `isAdmin` desde el contexto y muestra "Panel admin" o "Mi perfil / Mis donaciones" según corresponda.