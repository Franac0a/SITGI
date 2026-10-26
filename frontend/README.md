# CIT Formosa — Frontend

Interfaz del Sistema Integral de Inventario, Stock y Trazabilidad Científica (SITGI).

## Tecnologías

- **React 19** con **TypeScript**
- **Vite** para el servidor de desarrollo y la compilación
- **Tailwind CSS 4** para los estilos (los colores del CIT están en `src/index.css`)
- **React Router** para las páginas
- **Oxlint** para revisar el código y **Vitest** para los tests

Otras librerías: `lucide-react` (íconos), `qrcode.react` (código QR de cada ítem) y
`@radix-ui/react-dialog` (el menú lateral).

## Cómo correrlo

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev            # http://localhost:5173
```

Otros comandos:

```bash
npm run build      # compila para producción
npm run typecheck  # revisa los tipos de TypeScript
npm run lint       # revisa el código con oxlint
npm test           # corre los tests con Vitest
```

Los tests (`*.test.ts`) están al lado del archivo que prueban y cubren la lógica sin pantalla:
permisos por rol, validaciones del login y el registro, formato de fechas, paginación,
estado del stock y armado de las consultas a la API.

## Estructura de `src/`

```text
src/
├── main.tsx               # Punto de entrada: monta <App /> en index.html
├── App.tsx                # Router y proveedores de sesión y avisos
├── Rutas.tsx              # Todas las rutas y quién puede entrar a cada una
├── tipos.ts               # Tipos de los datos que devuelve el backend
├── index.css              # Tailwind y colores del CIT
│
├── servicios/             # Funciones que llaman al backend (una por endpoint)
│   ├── api.ts             # pedirApi(): base de todos los pedidos y manejo de errores
│   ├── sesion.ts          # login, registro, usuario actual y logout
│   └── items.ts, movimientos.ts, pedidos.ts, ...
│
├── contexto/              # Datos compartidos por toda la app
│   ├── ProveedorSesion.tsx    # Usuario logueado (useSesion)
│   └── ProveedorAvisos.tsx    # Avisos de la campana guardados en el navegador (useAvisos)
│
├── utilidades/
│   ├── permisos.ts        # Qué puede hacer cada rol
│   ├── errores.ts         # Texto de error para mostrar al usuario
│   └── clases.ts          # unirClases(): junta clases de Tailwind
│
├── componentes/
│   ├── ui/                # Piezas reutilizables: Boton, CampoTexto, Selector, Mensaje,
│   │                      # EstadoVacio, Esqueleto, Insignia, EncabezadoPagina
│   └── plantilla/         # Estructura de las páginas: barra superior, menú lateral,
│                          # rutas protegidas y pantalla de acceso denegado
│
└── paginas/               # Una carpeta por módulo
    ├── acceso/            # Login y registro (con sus validaciones)
    ├── inicio/            # Panel con el resumen del inventario
    ├── inventario/        # Lista, detalle con QR, alta y edición de ítems
    ├── movimientos/       # Registro y filtros de movimientos de stock
    ├── pedidos/  sectores/  residuos/  muestras/  proyectos/  documentos/  reportes/
    └── usuarios/          # Aprobación de cuentas y roles (solo Dirección)
```

## Rutas

| Ruta | Quién entra | Descripción |
| :--- | :--- | :--- |
| `/login`, `/registro` | Público | Inicio de sesión y solicitud de cuenta |
| `/dashboard` | Con sesión | Resumen del inventario y movimientos recientes |
| `/inventario` | Con sesión | Catálogo; los botones cambian según el rol |
| `/inventario/nuevo`, `/inventario/editar/:id` | Dirección, Administración, Inventario | Alta y edición de ítems |
| `/movimientos` | Con sesión | Historial; registrar depende del rol |
| `/pedidos`, `/sectores`, `/residuos`, `/muestras`, `/proyectos`, `/documentos`, `/reportes` | Con sesión | Módulos del sistema |
| `/admin/usuarios` | Solo Dirección | Aprobación de usuarios y roles |

Los permisos del front solo muestran u ocultan botones: el que decide de verdad es el backend.
