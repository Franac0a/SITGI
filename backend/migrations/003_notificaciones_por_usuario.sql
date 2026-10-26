-- Migración 003: notificaciones leídas por usuario.
--   * Lo que lee cada usuario se guarda en la tabla notificaciones_leidas,
--     que el backend crea solo al arrancar.
--   * notificaciones.leida pasa a llamarse resuelta: indica que el stock del
--     ítem se repuso y el aviso de stock bajo ya no está vigente.
--
-- Se ejecuta una sola vez (phpMyAdmin -> base citproyecto -> pestaña SQL).
-- Una base nueva no la necesita: las tablas se crean ya con la columna.

ALTER TABLE `notificaciones` RENAME COLUMN `leida` TO `resuelta`;
