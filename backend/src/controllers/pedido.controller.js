import { Pedido } from "../models/Pedido.model.js";

import { detalleError } from "../helpers/error.helper.js";
const ESTADOS_PEDIDO = ["Pendiente", "Aprobado", "Ingresado"];

export const obtenerPedidos = async (req, res) => {
  try {
    const { estado } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;

    const pedidos = await Pedido.findAll({
      where: filtro,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos:", error.message);
    res.status(500).json({
      mensaje: "Error al obtener los pedidos.",
      ...detalleError(error),
    });
  }
};

export const crearPedido = async (req, res) => {
  try {
    const { item_nombre, cantidad, sector, observaciones } = req.body;
    // El responsable es el usuario autenticado, no un dato del cliente.
    const responsable = req.usuario.nombre;

    if (!item_nombre || item_nombre.trim() === "") {
      return res
        .status(400)
        .json({ mensaje: "El nombre del insumo solicitado es obligatorio." });
    }

    if (cantidad === undefined || Number(cantidad) <= 0) {
      return res
        .status(400)
        .json({ mensaje: "La cantidad debe ser un número mayor a 0." });
    }

    const pedido = await Pedido.create({
      item_nombre,
      cantidad,
      sector: sector || null,
      responsable,
      observaciones: observaciones || null,
    });

    res.status(201).json({ mensaje: "Pedido registrado con éxito.", pedido });
  } catch (error) {
    console.error("Error al crear pedido:", error.message);
    res.status(500).json({
      mensaje: "Error al crear el pedido.",
      ...detalleError(error),
    });
  }
};

export const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const pedido = await Pedido.findByPk(id);
    if (!pedido) {
      return res.status(404).json({ mensaje: "Pedido no encontrado." });
    }

    if (!ESTADOS_PEDIDO.includes(estado)) {
      return res.status(400).json({
        mensaje: `Estado inválido. Valores permitidos: ${ESTADOS_PEDIDO.join(", ")}.`,
      });
    }
    pedido.estado = estado;
    await pedido.save();

    res.status(200).json({ mensaje: "Pedido actualizado correctamente.", pedido });
  } catch (error) {
    console.error("Error al actualizar pedido:", error.message);
    res.status(500).json({
      mensaje: "Error al actualizar el pedido.",
      ...detalleError(error),
    });
  }
};
