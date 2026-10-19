import { Op, Sequelize } from "sequelize";
import { Item } from "../models/Item.model.js";
import { Notificacion } from "../models/Notificacion.model.js";

const estaBajo = (item) =>
  Number(item.stock_minimo) > 0 &&
  Number(item.stock_actual) <= Number(item.stock_minimo);

// Crea el aviso de stock bajo si corresponde y el ítem no tiene uno sin leer.
export const avisarSiStockBajo = async (item, transaction) => {
  if (!estaBajo(item)) return null;

  const existe = await Notificacion.findOne({
    where: { itemId: item.id, leida: false },
    transaction,
  });
  if (existe) return null;

  return Notificacion.create(
    {
      titulo: "Stock bajo",
      mensaje: `${item.nombre} (${item.codigo_identificacion || "s/c"}) quedó en ${item.stock_actual} ${item.unidad_medida} (mínimo ${item.stock_minimo}).`,
      tipo: "warning",
      itemId: item.id,
    },
    { transaction },
  );
};

// Para datos que no pasan por un movimiento, como los del seed.
export const revisarStockBajo = async () => {
  const items = await Item.findAll({
    where: {
      stock_minimo: { [Op.gt]: 0 },
      stock_actual: { [Op.lte]: Sequelize.col("stock_minimo") },
    },
  });
  let creadas = 0;
  for (const item of items) {
    if (await avisarSiStockBajo(item)) creadas++;
  }
  return creadas;
};
