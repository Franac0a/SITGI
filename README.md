# SITGI — Sistema Integral de Inventario, Stock y Trazabilidad Científica (CIT Formosa)

## Puesta en marcha

Requisitos: Node.js 20+ y un MySQL accesible.

**Backend**
```bash
cd backend
npm install
cp .env.example .env      # completar JWT_SECRET (largo y aleatorio) y, si hace falta, DB_* y FRONTEND_URLS
npm run seed:admin        # crea el usuario Dirección inicial (director@citformosa.gob.ar / Admin123!)
npm run dev               # http://localhost:4000
```
El servidor **no arranca si no puede conectarse a la base**: revisá `DB_HOST`, `DB_USER`, `DB_PASSWORD` y `DB_NAME`.

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:4000/api
npm run dev               # http://localhost:5173
```

**Base de datos con Docker (sin XAMPP)**

Requiere Docker Desktop. Desde la raíz del proyecto:
```bash
docker compose up -d      # levanta MySQL con la base citproyecto
```
Copiar `backend/.env.example` a `backend/.env`: ya trae los valores de Docker. Solo hay que completar `JWT_SECRET` con una clave larga y aleatoria (el comando para generarla está en el mismo archivo).

Después, `npm run dev` y `npm run seed` en `backend/` (el backend crea las tablas al arrancar). Los datos quedan guardados en un volumen de Docker. Para apagar: `docker compose down`; para borrar también los datos: `docker compose down -v`.

El puerto 3306 no puede estar usado por otro MySQL (por ejemplo XAMPP). Si hace falta, se cambia con la variable `DB_PUERTO` (ejemplo: `DB_PUERTO=3307 docker compose up -d`) y `DB_PORT` en el `.env`.

**Base de datos ya existente (migraciones)**

`sequelize.sync()` crea tablas nuevas pero no modifica las existentes. Si la base ya existía antes de los últimos cambios, el backend se detiene con un mensaje que indica qué migración falta. Se ejecutan una sola vez, en orden, en phpMyAdmin (base `citproyecto` → pestaña SQL):

1. `backend/migrations/001_etapa1_documento.sql`: sector en movimientos, tipos de movimiento y roles nuevos.
2. `backend/migrations/002_pedidos_item.sql`: vincula los pedidos con los ítems del inventario.

Una base nueva y vacía no necesita ninguna. Con Docker, la forma más simple es `docker compose down -v`, volver a levantar y correr `npm run seed`.

**Datos iniciales**

Los datos del CIT (inventario y muestras) viajan con el repositorio en `backend/seed/*.json`. Con la base creada y el `.env` configurado:
```bash
cd backend
npm run seed
```
Crea el usuario Dirección inicial y carga el inventario y las muestras. Se puede ejecutar más de una vez sin duplicar datos: los ítems que ya existen no se tocan y las muestras solo se cargan si la tabla está vacía.

Si cambian los Excel, se regeneran los JSON con:
```bash
npm run seed:export -- "<ruta>/inventario cit formosa.xlsx" "<ruta>/DIAGNOSTICO 2026- CIT.xlsx"
```

**Roles:**
- *Dirección*: todo, más aprobación de usuarios y roles.
- *Administración* e *Inventario*: alta/edición de ítems, todos los tipos de movimiento, residuos, documentos y sectores.
- *Investigador* y *Técnico/Becario*: consulta, pedidos y registro de **consumos (egresos)**.
- *Responsable de área*: consulta del stock y pedidos de reposición.
Los usuarios que se registran quedan en estado *pendiente* hasta que la Dirección los apruebe.

---

## Módulos

- **Inventario**: ítems por categoría, stock mínimo, ubicación y condición de almacenamiento.
- **Movimientos**: ingreso, reposición, egreso, reparación, baja, ajuste y cambio de ubicación, con historial y filtros.
- **Pedidos y residuos**: solicitudes de reposición, que al marcarse como ingresadas suman el stock y registran el movimiento, y registro de residuos.
- **Documentos**: MSDS, SOP y COA asociados a los ítems.
- **Muestras**: registro de diagnóstico.
- **Proyectos**: proyectos de investigación.
- **Reportes**: inventario y movimientos filtrados, exportación CSV y rotación de stock.
- **Notificaciones**: avisos de stock bajo.

## Roles

| Rol | Permisos |
| --- | --- |
| Dirección, Administración, Inventario | Gestión completa y todos los tipos de movimiento |
| Responsable de área | Acceso general sin gestión de inventario |
| Investigador, Técnico/Becario | Solo registran egresos |

## Seguridad

- Contraseñas con bcrypt y sesión por JWT (cookie y encabezado Bearer).
- `helmet` y límite de intentos en login y registro.
- El responsable de cada movimiento sale del usuario autenticado.
- En producción no se devuelve el detalle interno de los errores.
