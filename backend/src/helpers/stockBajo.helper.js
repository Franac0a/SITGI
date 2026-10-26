import { Op, Sequelize } from "sequelize";
import { Item } from "../models/Item.model.js";
import { Notificacion } from "../models/Notificacion.model.js";

const estaBajo = (item) =>
  Number(item.stock_minimo) > 0 &&
  Number(item.stock_actual) <= Number(item.stock_minimo);

// Se llama cada vez que cambia el stock o el mínimo de un ítem.
// Un aviso de stock bajo sigue vigente hasta que el stock vuelve a superar el
// mínimo: mientras tanto no se repite, aunque haya más egresos.
export const revisarAvisoStockBajo = async (item, transaction) => {
  if (!estaBajo(item)) {
    // El stock se repuso: el aviso que hubiera deja de estar vigente.
    await Notificacion.update(
      { resuelta: true },
      { where: { itemId: item.id, resuelta: false }, transaction },
    );
    return null;
  }

  const vigente = await Notificacion.findOne({
    where: { itemId: item.id, resuelta: false },
    transaction,
  });
  if (vigente) return null;

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
    if (await revisarAvisoStockBajo(item)) creadas++;
  }
  return creadas;
};
