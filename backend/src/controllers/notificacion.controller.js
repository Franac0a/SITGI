import { Notificacion } from "../models/Notificacion.model.js";
import { Item } from "../models/Item.model.js";
import { Sequelize, Op } from "sequelize";

export const obtenerNotificaciones = async (req, res) => {
  try {
    const itemsBajos = await Item.findAll({
      where: {
        stock_minimo: { [Op.gt]: 0 },
        stock_actual: { [Op.lte]: Sequelize.col("stock_minimo") },
      },
    });

    for (const it of itemsBajos) {
      const existe = await Notificacion.findOne({
        where: { itemId: it.id, leida: false },
      });
      if (!existe) {
        await Notificacion.create({
          titulo: "Stock bajo",
          mensaje: `${it.nombre} (${it.codigo_identificacion || "s/c"}) quedó en ${it.stock_actual} ${it.unidad_medida} (mínimo ${it.stock_minimo}).`,
          tipo: "warning",
          itemId: it.id,
        });
      }
    }

    const notificaciones = await Notificacion.findAll({
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    const noLeidas = await Notificacion.count({ where: { leida: false } });

    res.status(200).json({ total: noLeidas, notificaciones });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error.message);
    res.status(500).json({
      mensaje: "Error al obtener las notificaciones.",
      error: error.message,
    });
  }
};

export const marcarTodasLeidas = async (req, res) => {
  try {
    await Notificacion.update({ leida: true }, { where: { leida: false } });
    res.status(200).json({ mensaje: "Notificaciones marcadas como leídas." });
  } catch (error) {
    console.error("Error al marcar notificaciones:", error.message);
    res.status(500).json({
      mensaje: "Error al marcar las notificaciones.",
      error: error.message,
    });
  }
};
