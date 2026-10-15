import { sequelize } from "./db.js";

/**
 * `sequelize.sync()` crea las tablas que faltan, pero NO modifica las que ya
 * existen. Si la base es anterior a los últimos cambios (sector en movimientos,
 * tipos de movimiento nuevos y roles nuevos), se avisa con un mensaje claro en
 * lugar de fallar más tarde con errores confusos.
 */
export const verificarEsquema = async () => {
  const dialecto = sequelize.getDialect();
  if (dialecto !== "mysql" && dialecto !== "mariadb") return;

  const qi = sequelize.getQueryInterface();
  const movimientos = await qi.describeTable("movimientos");
  const usuarios = await qi.describeTable("usuarios");
  const enumDe = (col) => String(col?.type ?? "").toLowerCase();

  const faltantes = [];
  if (!movimientos.sector) faltantes.push("columna movimientos.sector");
  if (!enumDe(movimientos.tipo_movimiento).includes("cambio de ubicaci")) {
    faltantes.push("tipos nuevos en movimientos.tipo_movimiento");
  }
  if (!enumDe(usuarios.rol).includes("cnico/becario")) {
    faltantes.push("roles nuevos en usuarios.rol");
  }

  if (faltantes.length > 0) {
    throw new Error(
      `La base de datos está desactualizada (falta: ${faltantes.join("; ")}). ` +
        "Ejecutá el script backend/migrations/001_etapa1_documento.sql en phpMyAdmin " +
        "(pestaña SQL, con la base seleccionada) y volvé a iniciar el servidor.",
    );
  }
};
