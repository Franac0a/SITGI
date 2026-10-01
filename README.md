# Revisión y correcciones de código — SITGI

Resumen de los errores encontrados durante la revisión y de las correcciones aplicadas.

## Seguridad

### 1. Escalada de privilegios en el registro
- **Problema:** `registrarUsuario` aceptaba cualquier `rol` enviado por el cliente (`backend/src/controllers/auth.controller.js`), por lo que un usuario podía auto-registrarse con `rol: "Dirección"` y, tras ser aprobado, quedar con privilegios de director.
- **Corrección:** el backend ahora fuerza `rol: "Investigador"` e ignora el valor del cliente.
- **Archivos afectados:**
  - `backend/src/controllers/auth.controller.js`
  - `frontend/src/pages/auth/RegisterPage.tsx` (se eliminó el selector de rol)
  - `frontend/src/utils/validation.ts` (se eliminó la validación de `rol`)
  - `frontend/src/types/auth.types.ts` (se eliminó `rol` de `RegisterRequest` y `RegisterFormValues`)

### 2. Logout incompleto (cookie httpOnly persistente)
- **Problema:** `logout()` solo borraba `localStorage` y nunca llamaba a `POST /auth/logout`, por lo que la cookie httpOnly quedaba válida hasta cerrar el navegador.
- **Corrección:** se agregó `authService.logout()` y se invoca en el `logout` del `AuthProvider`.
- **Archivos afectados:**
  - `frontend/src/services/auth/auth.service.ts`
  - `frontend/src/context/AuthProvider.tsx`

## Robustez del backend

### 3. Transacción fuera del try/catch
- **Problema:** en `registrarMovimiento` la transacción se creaba antes del bloque `try`, generando una promesa no manejada si fallaba la conexión.
- **Corrección:** la transacción se crea dentro del `try` y el rollback es condicional y seguro.
- **Archivo:** `backend/src/controllers/movimiento.controller.js`

### 4. `startDB()` se tragaba el error
- **Problema:** `startDB()` capturaba el error sin relanzarlo, por lo que `sequelize.sync()` corría igual aunque la base estuviera caída.
- **Corrección:** `startDB()` ahora relanza el error.
- **Archivo:** `backend/src/config/db.js`

### 5. `JWT_SECRET` sin cargar dotenv
- **Problema:** el middleware de autenticación usaba `process.env.JWT_SECRET` sin configurar `dotenv`, dependiendo de que otro módulo lo cargara antes.
- **Corrección:** se agregó `dotenv.config()` al middleware.
- **Archivo:** `backend/src/middlewares/auth.middleware.js`

## Inconsistencias

### 6. Redirección de login duplicada con roles inexistentes
- **Problema:** `LoginPage` mantenía una lista propia de roles (incluía `"admin"` y `"administrador general"`, que no existen) en lugar de usar la utilidad central.
- **Corrección:** ahora usa `canManageUsers` de `frontend/src/utils/rbac.ts`.
- **Archivo:** `frontend/src/pages/auth/LoginPage.tsx`

### 7. Categorías en minúscula vs. etiquetas en español
- **Problema:** el formulario enviaba `categoria: payload.tipo` con valores en inglés/minúscula (`reactivo`, `insumo`, `material`, `equipo`) mientras la UI mostraba etiquetas en español.
- **Corrección:** los valores ahora están en español (`Reactivo`, `Insumo`, `Material`, `Equipo`).
- **Archivos afectados:**
  - `frontend/src/components/inventory/InventoryItemForm.tsx`
  - `frontend/src/types/scientific.types.ts`

> Nota: si la base ya tiene registros con categorías viejas en minúscula, ambos estilos convivirán hasta actualizar esos datos.

### 8. Regex de número CAS demasiado restrictivo
- **Problema:** el patrón `^\d{2,7}-\d{2}-\d$` rechazaba CAS válidos con más dígitos en el primer grupo.
- **Corrección:** se relajó a `^\d{2,10}-\d{2}-\d$`.
- **Archivo:** `frontend/src/components/inventory/InventoryItemForm.tsx`

### 9. RBAC inconsistente en movimientos
- **Problema:** el rol `Dirección` podía crear/editar ítems pero no registrar movimientos.
- **Corrección:** se agregó `Dirección` a la lista de roles permitidos.
- **Archivo:** `backend/src/routes/movimiento.routes.js`

## Verificación

- `npm run typecheck` — sin errores.
- `npm run lint` — sin errores (solo 3 warnings de fast-refresh preexistentes).
- `node --check` sobre los archivos modificados del backend — sin errores.

---

# Conexión front ↔ back

Estado previo: auth, usuarios e inventario (listar/crear/ver) ya estaban conectados. Se completó lo que faltaba.

## Backend

- `backend/src/controllers/movimiento.controller.js` — nuevo `obtenerMovimientos` (lista todos los movimientos incluyendo datos del ítem asociado).
- `backend/src/routes/movimiento.routes.js` — nueva ruta `GET /api/movimientos`.

## Frontend

- `frontend/src/types/scientific.types.ts` — nuevos tipos `Movimiento`, `MovementType`, `RegisterMovementPayload` (se reemplazó `MovementRecord`, que no coincidía con el backend).
- `frontend/src/services/movements/movements.service.ts` (nuevo) — `getMovements`, `registerMovement`, `getMovementHistory`.
- `frontend/src/services/inventory/inventory.service.ts` — agregados `updateInventoryItem` y `deleteInventoryItem`.
- `frontend/src/pages/movements/MovementsPage.tsx` — reescrito: carga movimientos reales + formulario de registro (ítem, tipo, cantidad, responsable, origen/destino, costo, observaciones). Soporta `?itemId=&tipo=` para preseleccionar.
- `frontend/src/pages/inventory/InventoryPage.tsx` — "Registrar Retiro" navega a `/movimientos?itemId=X&tipo=Egreso`; "Detalles" abre un modal con la ficha del ítem + historial de movimientos.

## Extra

- `frontend/vite.config.ts` — corregido `__dirname` → `import.meta.dirname` (eliminó el warning de deprecación de Vite).

---

# Ajuste de módulos según la documentación del proyecto

Se analizó el documento `Documto Base -Actualizado mediante la entrevista.docx` (entrevista con la Dirección del CIT) y se comparó el alcance con los módulos implementados.

## Hallazgos del documento

Módulos propuestos: Inventario científico, Stock y movimientos, Ubicación y sectores, Pedidos y reposición, Usuarios y roles, Residuos especiales, Alertas y reportes.

Alcance inicial (1ª etapa): login+roles, carga/consulta, clasificación, ingresos/consumos/bajas/reposiciones, historial, consulta de disponibilidad, alertas de bajo stock y reportes exportables. En 2ª etapa: carga masiva Excel, códigos QR, notificaciones, dashboard, residuos avanzados, vinculación con proyectos y módulo de documentos.

## Cambios aplicados

- **"Proyectos de investigación" eliminado** del menú: no figura como módulo en el documento (solo "vinculación con proyectos" en 2ª etapa).
- **"Reservas y solicitudes" renombrado a "Pedidos y reposición"** y marcado como **"Próximamente"** (el documento habla de "Pedidos y reposición", no de reservas de equipamiento).
- **"Documentos asociados" marcado como "Próximamente"** (el módulo de documentos está recién en 2ª etapa).
- Se eliminaron los botones "Solicitar / Reservar" y "Solicitar Uso" del inventario (apuntaban a `/reservas`, módulo fuera de alcance).

## Archivos afectados

- `frontend/src/components/layout/Sidebar.tsx` — se quitó "proyectos", se renombró "reservas"→"pedidos", se agregó el estado `soon` ("Próximamente") y se actualizó el renderizado.
- `frontend/src/routes/AppRoutes.tsx` — se eliminaron las rutas `/proyectos` y `/reservas`.
- `frontend/src/pages/inventory/InventoryPage.tsx` — se quitaron los botones que llevaban a `/reservas`.
- `frontend/src/pages/projects/ProjectsPage.tsx` — eliminado.
- `frontend/src/pages/reservations/ReservationsPage.tsx` — eliminado.
- `frontend/src/types/scientific.types.ts` — se eliminaron los tipos `ResearchProject` y `ReservationRequest`.

## Verificación

- `npm run build` — compila sin errores.
- `npm run lint` — sin errores (solo 3 warnings de fast-refresh preexistentes).

---

# Implementación de la 1ª etapa según el documento

Se implementaron los módulos del alcance inicial que faltaban: Alertas y reportes, Ubicación y sectores, Pedidos y reposición, y Residuos especiales.

## Backend (nuevos modelos, controladores y rutas)

### Modelos
- `backend/src/models/Sector.model.js` — `Sector` (nombre único, tipo ENUM, descripción). Tabla `sectores`.
- `backend/src/models/Pedido.model.js` — `Pedido` (item_nombre, cantidad, sector, estado ENUM Pendiente/Aprobado/Ingresado, responsable, observaciones). Tabla `pedidos`.
- `backend/src/models/Residuo.model.js` — `Residuo` (tipo ENUM, descripción, sector, responsable, retiro_programado, estado ENUM Pendiente/Retirado, observaciones). Tabla `residuos`.

### Controladores
- `sector.controller.js` — listar, crear, actualizar, eliminar sectores.
- `pedido.controller.js` — listar, crear pedido, cambiar estado.
- `residuo.controller.js` — listar, crear, actualizar residuo.
- `reporte.controller.js` — `obtenerAlertas` (stock bajo/agotado, vencidos y próximos a vencer) y `exportarInventarioCsv` (export CSV con BOM UTF-8).

### Rutas (registradas en `app.js`)
- `GET/POST /api/sectores`, `PUT/DELETE /api/sectores/:id`.
- `GET/POST /api/pedidos`, `PUT /api/pedidos/:id/estado`.
- `GET/POST /api/residuos`, `PUT /api/residuos/:id`.
- `GET /api/reportes/alertas`, `GET /api/reportes/export`.

### RBAC
- Sectores y residuos (escritura): `Administración`, `Inventario`, `Dirección`.
- Pedidos (crear): cualquier usuario autenticado; cambiar estado: `Administración`, `Inventario`, `Dirección`.
- Reportes: cualquier usuario autenticado.

## Frontend

### Tipos (`scientific.types.ts`)
- `Sector`, `SectorTipo`, `Pedido`, `PedidoEstado`, `RegisterPedidoPayload`, `Residuo`, `ResiduoTipo`, `ResiduoEstado`, `RegisterResiduoPayload`, `AlertaTipo`, `ReporteAlerta`. Se eliminó `SystemAlert`.

### Servicios (nuevos)
- `services/sectores/sectores.service.ts` — `getSectores`, `createSector`, `deleteSector`.
- `services/pedidos/pedidos.service.ts` — `getPedidos`, `createPedido`, `updatePedidoEstado`.
- `services/residuos/residuos.service.ts` — `getResiduos`, `createResiduo`, `updateResiduo`.
- `services/reportes/reportes.service.ts` — `getAlertas`, `exportInventarioCsv` (descarga CSV vía fetch + blob).

### Páginas (nuevas / reescritas)
- `pages/sectores/SectoresPage.tsx` (nueva) — listado + alta + eliminación de sectores.
- `pages/pedidos/PedidosPage.tsx` (nueva) — listado + alta de pedidos + aprobar/ingresar.
- `pages/residuos/ResiduosPage.tsx` (nueva) — listado + alta + marcar retirado.
- `pages/reports/ReportsPage.tsx` (reescrita) — alertas en vivo + exportación CSV.

### Navegación y rutas
- `components/layout/Sidebar.tsx` — se habilitó "Pedidos y reposición" (se quitó `soon`), se agregaron "Ubicación y sectores" (`MapPin`) y "Residuos especiales" (`Recycle`).
- `routes/AppRoutes.tsx` — nuevas rutas `/pedidos`, `/sectores`, `/residuos`.

### Integración con inventario
- `components/inventory/InventoryItemForm.tsx` — el selector de ubicación ahora se alimenta de los sectores registrados (`getSectores`), manteniendo la lista por defecto como respaldo.

## Verificación

- `npm run build` — compila sin errores.
- `npm run lint` — sin errores (solo 3 warnings de fast-refresh preexistentes).
- `node --check` sobre los archivos nuevos del backend — sin errores.

## Pendiente (2ª etapa, no crítica)

- Módulo de documentos (subida MSDS/SOP/COA).
- Carga masiva desde Excel/Drive, códigos QR, notificaciones automáticas, dashboard de consumo, vinculación con proyectos.

---

# Carga de datos desde los Excel del CIT

Se analizaron los dos archivos Excel del escritorio y se importó el inventario.

## Análisis de los archivos

1. **`inventario cit formosa.xlsx`** (12 hojas) → inventario real por categoría. Mapea directo al modelo `Item`.
2. **`DIAGNOSTICO 2026- CIT.xlsx`** (hoja "Bruce 2026") → planilla de ingreso de muestras de Brucelosis y resultados. **No es inventario** (es registro de muestras/diagnóstico). Se dejó fuera (2ª etapa), por decisión del usuario.

## Implementación

- Se agregó la dependencia `xlsx` (SheetJS) al backend (`backend/package.json`).
- Nuevo script `backend/src/scripts/importarInventario.js` que lee cada hoja, mapea las columnas según su layout y crea los ítems.
- Se agregó el comando `npm run import:inventario` (acepta ruta opcional como argumento).

## Mapeo por hoja

| Hoja | Categoría | Campos mapeados |
|---|---|---|
| HERRAMIENTAS, BIOLOGIA MOLECULAR | Herramientas / Biología Molecular | código, nombre, volumen/tamaño, stock (o ingreso−egreso), ubicación |
| material de vidrio e insumos-LG, TRIQUINELOSIS | Vidrio e Insumos / Triquinelosis | código, nombre, tipo, volumen, stock, ubicación |
| DROGUERO | Droguero | código, letra, droga (nombre), marca, presentación, stock, ubicación |
| area brucelosis | Brucelosis | código (CIT-Fsa NN), denominación, marca, serie, criticidad, ubicación (equipos) |
| L. HEMOPARÁSITOS | Hemoparásitos | código, nombre, tipo, origen, ubicación |
| Bovinos insumos / Galpon bovinos-adquisiciones | Bovinos Insumos / Adquisiciones | insumo, cantidad, costo, observaciones, proveedor |
| INTA | INTA | código, nombre, ubicación |

## Resultado

- **466 ítems** cargados en el inventario, distribuidos en 10 categorías:
  - Droguero: 263, Biología Molecular: 49, Vidrio e Insumos: 40, INTA: 29, Bovinos Insumos: 26, Triquinelosis: 21, Herramientas: 15, Brucelosis: 13, Hemoparásitos: 5, Bovinos Adquisiciones: 5.

## Notas y limitaciones

- Los ítems sin código original reciben uno autogenerado (`CIT-XXX-####`); los códigos repetidos (p. ej. DROGUERO comparte número entre marcas) reciben un código único autogenerado para no perder filas.
- `stock_minimo` quedó en **0** para todos los ítems importados; debe definirse manualmente para que las alertas de bajo stock tengan sentido.
- Algunos equipos de "area brucelosis" con nombre en varias líneas (celdas combinadas) pueden haber quedado incompletos (13 de ~18); se pueden completar desde la UI.
- La dependencia `xlsx@0.18.5` reporta vulnerabilidades conocidas (CVEs antiguos de SheetJS); es aceptable para un script de importación local, pero conviene no exponerla.

## Verificación

- `node src/scripts/importarInventario.js` → 466 ítems cargados correctamente.
- Consulta de conteo por categoría en la base → coincide con el resumen del script.

---

# Cierre de la 1ª etapa

Se implementaron los dos pendientes de la 1ª etapa: **condición de almacenamiento** y **editar/eliminar ítems desde la UI**.

## Condición de almacenamiento

- `backend/src/models/Item.model.js` — nueva columna `condicion_almacenamiento` (STRING, nullable). Aplicada a la base con `sequelize.sync({ alter: true })`.
- `backend/src/controllers/item.controller.js` — `crearItem` y `actualizarItem` aceptan `condicion_almacenamiento`.
- `frontend/src/types/scientific.types.ts` — `condicion_almacenamiento` en `InventoryItem` y `CreateInventoryItemPayload`.
- `frontend/src/components/inventory/InventoryItemForm.tsx` — nuevo select "Condición de Almacenamiento" (Ambiente, Refrigerado 2-8°C, Congelado -20°C, Ultracongelado -80°C, Fotosensible, Otro).

## Editar / eliminar ítems

- `frontend/src/pages/inventory/EditInventoryItemPage.tsx` (nueva) — página `/inventario/editar/:id` que carga el ítem, mapea sus datos al formulario y guarda con `updateInventoryItem`.
- `frontend/src/routes/AppRoutes.tsx` — ruta nueva `/inventario/editar/:id` (con `RoleGuard`).
- `frontend/src/pages/inventory/index.ts` — exporta `EditInventoryItemPage`.
- `frontend/src/pages/inventory/InventoryPage.tsx` — botones **Retiro**, **Editar**, **Detalles** y **Eliminar** (con confirmación) en la fila de cada ítem.
- `frontend/src/components/inventory/InventoryItemForm.tsx` — los selects de tipo, unidad y ubicación ahora incluyen el valor actual si no está en las opciones (permite editar ítems importados con categorías/unidades/ubicaciones propias, p. ej. "Droguero", "25 G").

## Verificación

- `npm run build` — compila sin errores.
- `npm run lint` — sin errores (solo 3 warnings de fast-refresh preexistentes).
- `sequelize.sync({ alter: true })` — agregó la columna `condicion_almacenamiento` a la tabla `items`.

## Estado final de la 1ª etapa

Completa. Queda pendiente (2ª etapa): documentos, muestras/diagnóstico (cargaría el Excel `DIAGNOSTICO 2026`), códigos QR, notificaciones automáticas y dashboard.

---

# 2ª etapa (completa)

Se implementaron los módulos pendientes de la 2ª etapa según el documento.

## Documentos (MSDS/SOP/COA)

- **Backend:** `Documento` model, `documento.controller.js` (listar/subir/descargar/eliminar), `documento.routes.js` con `multer` (subida a `backend/uploads/`, máx. 25 MB). Dependencia nueva: `multer`.
- **Frontend:** tipo `Documento`, `documentos.service.ts` (subida con `FormData`), `DocumentsPage` reescrita (formulario + listado + descarga + eliminar). Se habilitó el ítem del menú (se quitó "Próximamente").

## Dashboard de consumo

- **Backend:** `reporte.controller.js` agrega `obtenerResumen` (total ítems, stock total, bajo stock, por categoría, movimientos por tipo, movimientos recientes). Ruta `GET /api/reportes/resumen`.
- **Frontend:** `getResumen` en `reportes.service.ts`, `DashboardHome` reescrita con tarjetas de estadísticas, ítems por categoría y movimientos recientes.

## Muestras / Diagnóstico

- **Backend:** `Muestra` model, `muestra.controller.js` (listar + resumen), `muestra.routes.js`. Script `importarDiagnostico.js` (lee las 3 hojas del Excel: Bruce 2026 → Brucelosis, Campy → Campilobacteriosis, Anemia → Anemia Infecciosa Equina; convierte fechas seriales de Excel). Comando `npm run import:diagnostico`.
- **Frontend:** tipo `Muestra`, `muestras.service.ts`, `MuestrasPage` (filtros por tipo + tabla de resultados). Ítem de menú "Muestras y diagnóstico".
- **Datos:** **725 muestras** cargadas (Brucelosis 444, Anemia Infecciosa Equina 266, Campilobacteriosis 15).

## Códigos QR

- Dependencia `qrcode.react`. En el modal "Detalles" de `InventoryPage` se muestra un QR con el `codigo_identificacion` del ítem.

## Notificaciones automáticas

- **Backend:** `Notificacion` model, `notificacion.controller.js` (`obtenerNotificaciones` genera automáticamente avisos de stock bajo para ítems con `stock_minimo > 0` y stock por debajo; `marcarTodasLeidas`), `notificacion.routes.js`.
- **Frontend:** tipo `Notificacion`, `notificaciones.service.ts`. `Header` ahora consulta las notificaciones del backend y las muestra en la campana junto a las locales; el contador suma ambas y "Marcar leídas" también marca las del backend.

## Proyectos de investigación

- **Backend:** `Proyecto` model, `proyecto.controller.js` (CRUD), `proyecto.routes.js` (escritura restringida a `Administración`/`Dirección`).
- **Frontend:** tipo `Proyecto`, `proyectos.service.ts`, `ProyectosPage` (listado + alta + finalizar + eliminar). Ítem de menú "Proyectos de investigación".

## Bug crítico corregido: índices duplicados en MySQL

- **Problema:** `sequelize.sync({ alter: true })` re-agregaba los índices `UNIQUE` (`dni`, `email`, `codigo_identificacion`, `nombre`) en cada arranque, acumulando hasta 61 índices duplicados en `usuarios` y terminando en `Error: Too many keys specified; max 64 keys allowed`.
- **Corrección:** se eliminaron los índices duplicados (items: 28, sectores: 10, usuarios: 61) con un script one-off, y se cambió `app.js` a `sequelize.sync()` (sin `alter`).

## Verificación

- `npm run build` — compila sin errores (aviso de chunk >500 kB, no es error).
- `npm run lint` — sin errores (solo 3 warnings de fast-refresh preexistentes).
- `node --check` sobre los archivos nuevos del backend — sin errores.
- `sequelize.sync()` — las 10 tablas existen y no hubo errores.

## Estado final (1ª y 2ª etapa COMPLETAS)

Todos los módulos del documento implementados y conectados. El alcance del proyecto quedó cubierto.
