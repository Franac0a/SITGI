import { sequelize } from "./db.js";

// sequelize.sync() crea las tablas que faltan pero no modifica las existentes.
// Si la base es anterior a los últimos cambios, se avisa con un mensaje claro
// que indica qué migración falta, en vez de fallar más tarde con errores confusos.
export const verificarEsquema = async () => {
  const dialecto = sequelize.getDialect();
  if (dialecto !== "mysql" && dialecto !== "mariadb") return;

  const qi = sequelize.getQueryInterface();
  const movimientos = await qi.describeTable("movimientos");
  const usuarios = await qi.describeTable("usuarios");
  const pedidos = await qi.describeTable("pedidos");
  const notificaciones = await qi.describeTable("notificaciones");
  const enumDe = (col) => String(col?.type ?? "").toLowerCase();

  const faltantes = [];
  const migraciones = [];

  const falta001 = [];
  if (!movimientos.sector) falta001.push("columna movimientos.sector");
  if (!enumDe(movimientos.tipo_movimiento).includes("cambio de ubicaci")) {
    falta001.push("tipos nuevos en movimientos.tipo_movimiento");
  }
  if (!enumDe(usuarios.rol).includes("cnico/becario")) {
    falta001.push("roles nuevos en usuarios.rol");
  }
  if (falta001.length > 0) {
    faltantes.push(...falta001);
    migraciones.push("001_etapa1_documento.sql");
  }

  if (!pedidos.itemId) {
    faltantes.push("columna pedidos.itemId");
    migraciones.push("002_pedidos_item.sql");
  }

  if (!notificaciones.resuelta) {
    faltantes.push("columna notificaciones.resuelta");
    migraciones.push("003_notificaciones_por_usuario.sql");
  }

  if (faltantes.length > 0) {
    throw new Error(
      `La base de datos está desactualizada (falta: ${faltantes.join("; ")}). ` +
        `Ejecutá en phpMyAdmin (pestaña SQL, con la base seleccionada), en este orden: ` +
        `${migraciones.map((m) => `backend/migrations/${m}`).join(", ")}. ` +
        "Después volvé a iniciar el servidor.",
    );
  }
};
