# CIT Formosa — Frontend

Interfaz del Sistema Integral de Inventario, Stock y Trazabilidad Científica (SITGI).

## Stack Tecnológico

- **Framework**: React 18+
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Bundler & Tooling**: Vite
- **Enrutamiento**: React Router DOM
- **Linter**: Oxlint / ESLint

## Scripts Disponibles

```bash
npm run dev        # Inicia el servidor de desarrollo
npm run build      # Compila la aplicación para producción
npm run typecheck  # Ejecuta la verificación estática de tipos con TypeScript
npm run lint       # Analiza el código en busca de problemas de linting
```

## Configuración

1. Copiar el archivo de variables de entorno de ejemplo:
   ```bash
   cp .env.example .env
   ```
2. Ajustar `VITE_API_URL` con la URL base del backend (por defecto `http://localhost:3000/api`).

---

## Estructura del Proyecto (`src/`)

A continuación se detalla el árbol completo del directorio `src/`, con una breve descripción del propósito y contenido de cada archivo y carpeta:

```text
src/
├── App.tsx                              # Componente raíz; envuelve la app en AuthProvider y monta las rutas.
├── main.tsx                             # Punto de entrada de React que monta la aplicación en el DOM (index.html).
├── index.css                            # Estilos globales y variables de tema (bordó, tipografía, base).
├── vite-env.d.ts                        # Declaraciones de tipos globales de TypeScript para Vite.
│
├── components/                          # Componentes reutilizables de la interfaz gráfica.
│   ├── auth/                            # Componentes de seguridad y autorización.
│   │   └── RoleGuard.tsx                # Guardián de elementos y rutas basado en control de acceso por roles (RBAC).
│   ├── inventory/                       # Componentes específicos del módulo de inventario.
│   │   ├── InventoryItemForm.tsx        # Formulario estructurado para el alta de reactivos, insumos y equipos (CreateInventoryItemPayload).
│   │   └── index.ts                     # Archivo barril para exportación de componentes de inventario.
│   ├── layout/                          # Componentes estructurales de diseño y maquetación.
│   │   ├── AccessDenied.tsx             # Vista de acceso denegado para roles no autorizados en operaciones restringidas.
│   │   ├── AuthLayout.tsx               # Layout para vistas públicas de autenticación (Login y Registro).
│   │   ├── DashboardLayout.tsx          # Contenedor / re-export para el layout del dashboard.
│   │   ├── Header.tsx                   # Barra superior con búsqueda global, estado, notificaciones y menú de perfil.
│   │   ├── MainLayout.tsx               # Layout principal que integra Sidebar colapsable, Header y Outlet.
│   │   ├── ProtectedRoute.tsx           # Guardián de rutas que valida autenticación y roles de usuario.
│   │   ├── Sidebar.tsx                  # Menú lateral con navegación por módulos según permisos del usuario.
│   │   └── index.ts                     # Archivo barril para exportación centralizada de layout.
│   └── ui/                              # Elementos atómicos de interfaz de usuario.
│       ├── Alert.tsx                    # Componente para alertas y mensajes informativos, de éxito, advertencia o error.
│       ├── Button.tsx                   # Botón personalizable con variantes (primario, secundario, peligro) y estados de carga.
│       ├── EmptyState.tsx               # Vista informativa para estados vacíos (sin datos o sin resultados de búsqueda).
│       ├── Input.tsx                    # Campo de entrada de texto estandarizado con validación y etiquetas.
│       ├── Select.tsx                   # Menú desplegable personalizable para selección de opciones.
│       └── Skeleton.tsx                 # Placeholder animado de carga para mejorar la experiencia visual.
│
├── constants/                           # Constantes fijas y configuraciones inmutables de la aplicación.
│   └── roles.ts                         # Roles de usuario del sistema (Admin, Investigador, Becario, etc.) y labels.
│
├── context/                             # Estado global compartido mediante React Context API.
│   ├── auth-context.ts                  # Definición del contexto de autenticación y tipos del estado de sesión.
│   ├── AuthProvider.tsx                 # Proveedor que gestiona el token JWT, usuario activo, login y logout.
│   ├── useAuth.ts                       # Custom Hook para consumir el contexto de autenticación fácilmente.
│   └── index.ts                         # Archivo barril para exportar el contexto, hook y proveedor.
│
├── pages/                               # Páginas y vistas principales del sistema.
│   ├── admin/                           # Vistas de administración del sistema.
│   │   └── UsersAdminPage.tsx           # Panel de gestión de usuarios, aprobación de accesos y asignación de roles.
│   ├── auth/                            # Vistas públicas de acceso al sistema.
│   │   ├── LoginPage.tsx                # Formulario de inicio de sesión con credenciales.
│   │   └── RegisterPage.tsx             # Formulario de solicitud de registro para nuevos investigadores y personal.
│   ├── dashboard/                       # Panel principal del sistema científico.
│   │   ├── DashboardHome.tsx            # Vista con métricas del laboratorio, accesos rápidos y actividad reciente.
│   │   ├── DashboardPage.tsx            # Contenedor principal de la vista de dashboard.
│   │   └── index.ts                     # Archivo barril para exportar componentes de dashboard.
│   ├── documents/                       # Gestión documental científica.
│   │   └── DocumentsPage.tsx            # Fichas de seguridad (MSDS/FDS), protocolos, manuales y certificados.
│   ├── inventory/                       # Módulo de inventario y stock.
│   │   ├── InventoryPage.tsx            # Control de reactivos, consumibles, equipos, lotes, vencimientos y RBAC condicional.
│   │   ├── NewInventoryItemPage.tsx     # Pantalla protegida para el alta de nuevos elementos científicos.
│   │   └── index.ts                     # Archivo barril para exportar páginas de inventario.
│   ├── movements/                       # Módulo de trazabilidad física.
│   │   └── MovementsPage.tsx            # Registro histórico de ingresos, egresos, descartes y transferencias.
│   ├── projects/                        # Módulo de proyectos de investigación.
│   │   └── ProjectsPage.tsx             # Gestión de proyectos, responsables, líneas científicas y recursos asociados.
│   ├── reports/                         # Módulo de reportes y auditoría.
│   │   └── ReportsPage.tsx              # Generación y exportación de reportes de consumo, trazabilidad y stock crítico.
│   └── reservations/                    # Módulo de reservas de equipamiento.
│       └── ReservationsPage.tsx         # Calendario y solicitud de turnos para uso de equipos e instrumental.
│
├── routes/                              # Configuración central de rutas y navegación.
│   └── AppRoutes.tsx                    # Definición de rutas públicas, protegidas y mapeo de vistas con react-router-dom.
│
├── services/                            # Capa de comunicación con APIs externas y backend.
│   ├── api/                             # Configuración del cliente HTTP base.
│   │   └── client.ts                    # Instancia con interceptores para inyección de JWT y manejo unificado de errores.
│   ├── auth/                            # Servicios de autenticación.
│   │   └── auth.service.ts              # Peticiones de login, registro, refresco de sesión y logout.
│   ├── inventory/                       # Servicios de inventario.
│   │   └── inventory.service.ts         # Peticiones para alta y consulta de elementos en el catálogo de inventario.
│   └── users/                           # Servicios de usuarios.
│       └── users.service.ts             # Peticiones de listado, aprobación y actualización de roles de usuarios.
│
├── types/                               # Definiciones de tipos e interfaces de TypeScript.
│   ├── api.types.ts                     # Tipos estándar para respuestas HTTP, paginación y estructuras de error.
│   ├── auth.types.ts                    # Tipos para credenciales, tokens JWT y estado de autenticación.
│   ├── scientific.types.ts              # Modelos de datos para reactivos, CreateInventoryItemPayload, movimientos y reservas.
│   └── user.types.ts                    # Interfaces de usuario, perfiles, roles y estados de cuenta.
│
└── utils/                               # Funciones auxiliares y utilidades generales.
    ├── errors.ts                        # Parseo y formateo amigable de mensajes de error de la API.
    ├── rbac.ts                          # Funciones de validación de permisos por rol para inventario y administración.
    └── validation.ts                    # Funciones y esquemas para validación de datos de entrada y formularios.
```

---

## Mapa de Rutas del Sistema

| Ruta | Acceso | Descripción |
| :--- | :--- | :--- |
| `/login` | Público | Inicio de sesión en la plataforma |
| `/registro` | Público | Solicitud de nueva cuenta de usuario |
| `/` | Protegido | Redirección por defecto al Dashboard |
| `/dashboard` | Protegido | Panel principal con métricas y accesos rápidos |
| `/inventario` | Protegido | Catálogo de inventario con acciones según rol |
| `/inventario/nuevo` | Administrador / Dirección / Inventario | Alta y registro de nuevos elementos científicos |
| `/proyectos` | Protegido | Gestión de proyectos y líneas de investigación |
| `/movimientos` | Protegido | Registro y trazabilidad de movimientos y consumos |
| `/reservas` | Protegido | Calendario de reserva de equipos e instrumental |
| `/documentos` | Protegido | Protocolos, manuales y fichas de seguridad (FDS) |
| `/reportes` | Protegido | Generación y exportación de reportes analíticos |
| `/admin/usuarios` | Solo `Dirección` / `Administración` | Administración de usuarios, roles y aprobaciones |
