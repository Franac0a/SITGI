# SITGI — Sistema Integral de Inventario, Stock y Trazabilidad Científica (CIT Formosa)

## Puesta en marcha

Requisitos: Node.js 20+ y un MySQL accesible.

**Backend**
```bash
cd backend
npm install
cp .env.example .env      # completar DB_*, JWT_SECRET (largo y aleatorio) y, si hace falta, FRONTEND_URLS
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

**Base de datos ya existente (migración 001)**

`sequelize.sync()` crea tablas nuevas pero no modifica las existentes. Si tu base ya existía antes de los tipos de movimiento y roles nuevos, el backend se detiene con un mensaje claro hasta que ejecutes `backend/migrations/001_etapa1_documento.sql` (phpMyAdmin → base `citproyecto` → pestaña SQL). Una base nueva y vacía no la necesita.

**Carga inicial del inventario (opcional)**
```bash
cd backend
npm run import:inventario -- "<ruta>/inventario cit formosa.xlsx"
npm run import:diagnostico -- "<ruta>/DIAGNOSTICO 2026- CIT.xlsx"
```

**Roles:**
- *Dirección*: todo, más aprobación de usuarios y roles.
- *Administración* e *Inventario*: alta/edición de ítems, todos los tipos de movimiento, residuos, documentos y sectores.
- *Investigador* y *Técnico/Becario*: consulta, pedidos y registro de **consumos (egresos)**.
- *Responsable de área*: consulta del stock y pedidos de reposición.
Los usuarios que se registran quedan en estado *pendiente* hasta que la Dirección los apruebe.

> Estado del repositorio: ver al final de este archivo el historial de correcciones.

---

## Módulos

- **Inventario**: ítems por categoría, stock mínimo, ubicación y condición de almacenamiento.
- **Movimientos**: ingreso, reposición, egreso, reparación, baja, ajuste y cambio de ubicación, con historial y filtros.
- **Pedidos y residuos**: solicitudes de compra y registro de residuos.
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
