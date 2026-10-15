ALTER TABLE `movimientos`
  ADD COLUMN `sector` VARCHAR(255) NULL AFTER `fecha_movimiento`;

ALTER TABLE `movimientos`
  MODIFY COLUMN `tipo_movimiento`
  ENUM('Ingreso','Egreso','Ajuste','Reparación','Baja','Reposición','Cambio de ubicación')
  NOT NULL;

ALTER TABLE `usuarios`
  MODIFY COLUMN `rol`
  ENUM('Administración','Inventario','Investigador','Dirección','Responsable de área','Técnico/Becario')
  NOT NULL DEFAULT 'Investigador';
