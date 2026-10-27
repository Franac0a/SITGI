# SITGI — Sistema Integral de Inventario, Stock y Trazabilidad Científica (CIT Formosa)

## Puesta en marcha

Requisitos: Node.js 20+ y un MySQL accesible.

**Backend**
```bash
cd backend
npm install
cp .env.example .env      # completar JWT_SECRET (largo y aleatorio) y, si hace falta, DB_* y FRONTEND_URLS
npm run seed              # crea el usuario Dirección inicial y carga los datos del CIT
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

**Todo con Docker (base, backend y frontend)**

Con `backend/.env` creado (alcanza con copiar `.env.example` y completar `JWT_SECRET`):
```bash
docker compose --profile app up -d --build
```
- Frontend: http://localhost:8080
- Backend: http://localhost:4000

El backend corre el seed antes de arrancar, así que en el primer arranque crea el director y carga los datos. Si `SEED_DIRECTOR_PASSWORD` está vacía, la contraseña generada se ve con `docker compose logs backend`. Para apagar: `docker compose --profile app down`. Sin `--profile app` solo se levanta la base, como en el desarrollo con `npm run dev`; no conviene usar los dos a la vez porque comparten el puerto 4000.

**Base de datos ya existente (migraciones)**

`sequelize.sync()` crea tablas nuevas pero no modifica las existentes. Si la base ya existía antes de los últimos cambios, el backend se detiene con un mensaje que indica qué migración falta. Se ejecutan una sola vez, en orden, en phpMyAdmin (base `citproyecto` → pestaña SQL):

1. `backend/migrations/001_etapa1_documento.sql`: sector en movimientos, tipos de movimiento y roles nuevos.
2. `backend/migrations/002_pedidos_item.sql`: vincula los pedidos con los ítems del inventario.
3. `backend/migrations/003_notificaciones_por_usuario.sql`: cada usuario marca sus propias notificaciones como leídas.

Una base nueva y vacía no necesita ninguna. Con Docker, la forma más simple es `docker compose down -v`, volver a levantar y correr `npm run seed`.

**Datos iniciales**

Los datos del CIT (inventario y muestras) viajan con el repositorio en `backend/seed/*.json`. Con la base creada y el `.env` configurado:
```bash
cd backend
npm run seed
```
Crea el usuario Dirección inicial y carga el inventario y las muestras. El usuario es `SEED_DIRECTOR_EMAIL` y la contraseña la que se ponga en `SEED_DIRECTOR_PASSWORD` (en `backend/.env`); si se deja vacía, el seed genera una y la muestra una sola vez por consola. Si el director ya existe no se modifica; `npm run seed:admin` lo reactiva con rol Dirección. Si se pierde la contraseña de un usuario y nadie de la Dirección puede entrar a restablecerla, se cambia desde la consola con `npm run clave -- <email> <contraseña nueva>`. Se puede ejecutar más de una vez sin duplicar datos: los ítems que ya existen no se tocan y las muestras solo se cargan si la tabla está vacía.

Si cambian los Excel, se regeneran los JSON con:
```bash
npm run seed:export -- "<ruta>/inventario cit formosa.xlsx" "<ruta>/DIAGNOSTICO 2026- CIT.xlsx"
```

**Tests**

```bash
cd backend
npm test              # SQLite en memoria, no necesita Docker
npm run test:mysql    # contra el MySQL de Docker, en la base citproyecto_test
```
Cubren login y sesión, permisos por rol, cada tipo de movimiento (stock insuficiente, ajuste, cambio de ubicación) y el ingreso único de pedidos. Los dos tests de concurrencia (egresos simultáneos e ingresos repetidos de un pedido) solo corren con `test:mysql`, porque SQLite no bloquea filas.

GitHub Actions (`.github/workflows/ci.yml`) corre en cada push a `main` o a ramas `dev-*` y en cada pull request: los dos sets de tests del backend (con un MySQL 8 propio) y typecheck, lint, tests y build del frontend.

`test:mysql` borra y recrea las tablas de `citproyecto_test`, nunca de `citproyecto`. Docker crea esa base al levantar un volumen nuevo; si el volumen ya existía, se crea una sola vez con:
```bash
docker exec -i sitgi-db mysql -uroot -proot_dev < docker/mysql/01-base-tests.sql
# en PowerShell:
Get-Content docker/mysql/01-base-tests.sql | docker exec -i sitgi-db mysql -uroot -proot_dev
```

**Roles:**
- *Dirección*: todo, más aprobación de usuarios y roles.
- *Administración* e *Inventario*: alta/edición de ítems, todos los tipos de movimiento, residuos, documentos y sectores.
- *Investigador* y *Técnico/Becario*: consulta, pedidos y registro de **consumos (egresos)**.
- *Responsable de área*: consulta del stock y pedidos de reposición.
Los usuarios que se registran quedan en estado *pendiente* hasta que la Dirección los apruebe.

---

## Módulos

- **Inventario**: ítems por categoría, stock mínimo, ubicación y condición de almacenamiento. Al editar un ítem no se cambia el stock: eso solo se hace con un movimiento, para que quede en la trazabilidad.
- **Movimientos**: ingreso, reposición, egreso, reparación, baja, ajuste y cambio de ubicación, con historial y filtros.
- **Sectores**: laboratorios, heladeras, droguero, estantes y depósitos. Movimientos, pedidos y residuos solo aceptan sectores cargados acá; al renombrar uno se actualizan sus registros y no se puede eliminar si está en uso.
- **Pedidos y residuos**: solicitudes de reposición, que al marcarse como ingresadas suman el stock y registran el movimiento, y registro de residuos.
- **Documentos**: MSDS, SOP, COA y protocolos del CIT.
- **Muestras**: ingreso de muestras de Brucelosis, Campilobacteriosis y Anemia Infecciosa Equina, y carga del resultado (positivos, sospechosos, negativos) cuando está listo. Las registran Dirección, Administración, Inventario, Investigador y Técnico/Becario.
- **Proyectos**: proyectos de investigación.
- **Reportes**: inventario y movimientos filtrados, exportación CSV, alta rotación y consumo por sector.
- **Notificaciones**: avisos de stock bajo, que se generan al registrar un movimiento que deja el ítem en su stock mínimo o por debajo. El aviso sigue vigente hasta que se repone el stock, y cada usuario marca los suyos como leídos.

## Roles

| Rol | Permisos |
| --- | --- |
| Dirección, Administración, Inventario | Gestión completa y todos los tipos de movimiento |
| Responsable de área | Acceso general sin gestión de inventario |
| Investigador, Técnico/Becario | Solo registran egresos |

## Seguridad

- Contraseñas con bcrypt y sesión por JWT en una cookie httpOnly: el token no se guarda en el navegador ni lo ve JavaScript.
- `helmet` y límite de intentos en login y registro.
- El responsable de cada movimiento sale del usuario autenticado.
- En producción no se devuelve el detalle interno de los errores.
