import { MovimientoModel } from "../models/Movimiento.model.js";
import { Item } from "../models/Item.model.js";
import { UserModel } from "../models/User.model.js";

export const registrarMovimiento = async (req, res) => {
  try {
    const { item_id, tipo, cantidad, motivo_proyecto } = req.body;
    const usuario_id = req.usuario.id;

    // Buscamos el ítem en la base de datos
    const item = await Item.findByPk(item_id);
    if (!item) {
      return res
        .status(404)
        .json({ mensaje: "El ítem seleccionado no existe en el inventario." });
    }

    const stock_anterior = item.stock_actual;
    let stock_posterior = stock_anterior;

    // Calculamos el nuevo stock según el tipo de movimiento
    if (tipo === "ingreso" || tipo === "devolucion") {
      stock_posterior = stock_anterior + Number(cantidad);
    } else if (tipo === "retiro" || tipo === "descarte") {
      if (stock_anterior < cantidad) {
        return res.status(400).json({
          mensaje: `Stock insuficiente para realizar el retiro. Stock actual: ${stock_anterior} unidades.`,
        });
      }
      stock_posterior = stock_anterior - Number(cantidad);
    }

    // Guardamos el recibo auditable en el historial
    const nuevoMovimiento = await MovimientoModel.create({
      item_id,
      usuario_id,
      tipo,
      cantidad,
      motivo_proyecto,
      stock_anterior,
      stock_posterior,
    });

    // Actualizamos la tabla principal de ítems con el nuevo número de stock
    await item.update({ stock_actual: stock_posterior });

    res.status(201).json({
      mensaje: `Movimiento de ${tipo} registrado con éxito. Stock actualizado de ${stock_anterior} a ${stock_posterior}.`,
      movimiento: nuevoMovimiento,
    });
  } catch (error) {
    console.error("Error al registrar movimiento:", error.message);
    res.status(500).json({
      mensaje: "Error interno al procesar el movimiento del inventario.",
      error: error.message,
    });
  }
};

export const obtenerHistorial = async (req, res) => {
  try {
    const { item_id, tipo, proyecto } = req.query;
    const filtro = {};

    if (item_id) filtro.item_id = item_id;
    if (tipo) filtro.tipo = tipo;

    if (proyecto) filtro.motivo_proyecto = { [Op.like]: `%${proyecto}%` };

    const historial = await MovimientoModel.findAll({
      where: filtro,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: UserModel,
          as: "usuario",
          attributes: ["nombre", "rol", "email"],
        },
        {
          model: Item,
          as: "item",
          attributes: ["nombre", "codigo_identificacion", "categoria"],
          paranoid: false,
        },
      ],
    });

    res.status(200).json({
      total: historial.length,
      movimientos: historial,
    });
  } catch (error) {
    console.error("Error al obtener historial de movimientos:", error.message);
    res
      .status(500)
      .json({ mensaje: "Error al cargar la auditoría.", error: error.message });
  }
};
