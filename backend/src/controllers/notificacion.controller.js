import { Notificacion } from "../models/Notificacion.model.js";

import { detalleError } from "../helpers/error.helper.js";
// Los avisos de stock bajo se crean al registrar el movimiento (helpers/stockBajo.helper.js).
export const obtenerNotificaciones = async (req, res) => {
  try {
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
      ...detalleError(error),
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
      ...detalleError(error),
    });
  }
};
