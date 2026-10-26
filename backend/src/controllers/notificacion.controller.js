import { Notificacion } from "../models/Notificacion.model.js";
import { NotificacionLeida } from "../models/NotificacionLeida.model.js";

import { detalleError } from "../helpers/error.helper.js";
// Los avisos de stock bajo se crean al registrar el movimiento (helpers/stockBajo.helper.js).
// Cada usuario marca como leídas sus notificaciones: lo que lee uno no le desaparece a otro.
export const obtenerNotificaciones = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const notificaciones = await Notificacion.findAll({
      order: [["createdAt", "DESC"]],
      limit: 50,
      // Trae la lectura de este usuario, si la hay, para saber si ya la leyó.
      include: [
        {
          model: NotificacionLeida,
          as: "lecturas",
          where: { usuarioId },
          required: false,
          attributes: ["id"],
        },
      ],
    });

    const [total, leidas] = await Promise.all([
      Notificacion.count(),
      NotificacionLeida.count({ where: { usuarioId } }),
    ]);

    res.status(200).json({
      total: total - leidas,
      notificaciones: notificaciones.map((n) => ({
        id: n.id,
        titulo: n.titulo,
        mensaje: n.mensaje,
        tipo: n.tipo,
        itemId: n.itemId,
        createdAt: n.createdAt,
        leida: n.lecturas.length > 0,
      })),
    });
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
    const usuarioId = req.usuario.id;
    const notificaciones = await Notificacion.findAll({ attributes: ["id"], raw: true });

    // ignoreDuplicates saltea las que este usuario ya había leído.
    await NotificacionLeida.bulkCreate(
      notificaciones.map((n) => ({ notificacionId: n.id, usuarioId })),
      { ignoreDuplicates: true },
    );

    res.status(200).json({ mensaje: "Notificaciones marcadas como leídas." });
  } catch (error) {
    console.error("Error al marcar notificaciones:", error.message);
    res.status(500).json({
      mensaje: "Error al marcar las notificaciones.",
      ...detalleError(error),
    });
  }
};
