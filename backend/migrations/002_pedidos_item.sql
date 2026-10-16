-- Migración 002: vincula los pedidos con los ítems del inventario.
--   * pedidos.itemId -> ítem al que se repone; al marcar el pedido como
--     "Ingresado" se suma el stock y se registra un movimiento de Ingreso.
--
-- Se ejecuta una sola vez (phpMyAdmin -> base citproyecto -> pestaña SQL).
-- Una base nueva no la necesita: las tablas se crean ya con la columna.

ALTER TABLE `pedidos`
  ADD COLUMN `itemId` INT NULL AFTER `item_nombre`,
  ADD CONSTRAINT `fk_pedidos_item`
    FOREIGN KEY (`itemId`) REFERENCES `items` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
