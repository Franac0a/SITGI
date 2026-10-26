import { Pedido } from "../models/Pedido.model.js";
import { Item } from "../models/Item.model.js";
import { Movimiento } from "../models/Movimiento.model.js";
import { sequelize } from "../config/db.js";
import { detalleError } from "../helpers/error.helper.js";
import { revisarAvisoStockBajo } from "../helpers/stockBajo.helper.js";
import {
  limpiarSector,
  sectorNoExiste,
  MENSAJE_SECTOR_INEXISTENTE,
} from "../helpers/sector.helper.js";

const ESTADOS_PEDIDO = ["Pendiente", "Aprobado", "Ingresado"];

const incluirItem = {
  model: Item,
  as: "item",
  attributes: ["id", "nombre", "codigo_identificacion", "stock_actual"],
  required: false,
};

export const obtenerPedidos = async (req, res) => {
  try {
    const { estado } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;

    const pedidos = await Pedido.findAll({
      where: filtro,
      include: [incluirItem],
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
    const { item_nombre, itemId, cantidad, sector, observaciones } = req.body;
    // El responsable es el usuario autenticado, no un dato del cliente.
    const responsable = req.usuario.nombre;

    let item = null;
    if (itemId !== undefined && itemId !== null && itemId !== "") {
      item = await Item.findByPk(itemId);
      if (!item) {
        return res
          .status(404)
          .json({ mensaje: "El ítem indicado no existe en el inventario." });
      }
    }

    const nombre = String(item_nombre ?? item?.nombre ?? "").trim();
    if (!nombre) {
      return res
        .status(400)
        .json({ mensaje: "El nombre del insumo solicitado es obligatorio." });
    }

    if (cantidad === undefined || !(Number(cantidad) > 0)) {
      return res
        .status(400)
        .json({ mensaje: "La cantidad debe ser un número mayor a 0." });
    }

    const sectorFinal = limpiarSector(sector);
    if (await sectorNoExiste(sectorFinal)) {
      return res.status(400).json({ mensaje: MENSAJE_SECTOR_INEXISTENTE });
    }

    const pedido = await Pedido.create({
      item_nombre: nombre,
      itemId: item ? item.id : null,
      cantidad,
      sector: sectorFinal,
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
  const { id } = req.params;
  const { estado, itemId } = req.body;

  if (!ESTADOS_PEDIDO.includes(estado)) {
    return res.status(400).json({
      mensaje: `Estado inválido. Valores permitidos: ${ESTADOS_PEDIDO.join(", ")}.`,
    });
  }

  let t;
  try {
    t = await sequelize.transaction();

    // Se bloquea el pedido para que no se pueda ingresar dos veces a la vez.
    const pedido = await Pedido.findByPk(id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ mensaje: "Pedido no encontrado." });
    }

    if (pedido.estado === "Ingresado") {
      await t.rollback();
      return res.status(409).json({
        mensaje: "El pedido ya fue ingresado al stock y no se puede modificar.",
      });
    }

    if (estado !== "Ingresado") {
      pedido.estado = estado;
      await pedido.save({ transaction: t });
      await t.commit();
      return res
        .status(200)
        .json({ mensaje: "Pedido actualizado correctamente.", pedido });
    }

    // Ingreso: suma el stock del ítem y deja el movimiento registrado.
    const idItem = itemId ?? pedido.itemId;
    if (idItem === undefined || idItem === null || idItem === "") {
      await t.rollback();
      return res.status(400).json({
        mensaje:
          "Para ingresar el pedido hay que vincularlo a un ítem del inventario.",
      });
    }

    const item = await Item.findByPk(idItem, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!item) {
      await t.rollback();
      return res
        .status(404)
        .json({ mensaje: "El ítem indicado no existe en el inventario." });
    }

    const cantidad = Number(pedido.cantidad);
    item.stock_actual = Number(item.stock_actual) + cantidad;
    await item.save({ transaction: t });
    await revisarAvisoStockBajo(item, t);

    const movimiento = await Movimiento.create(
      {
        itemId: item.id,
        tipo_movimiento: "Ingreso",
        cantidad,
        sector: pedido.sector,
        origen_destino: `Pedido #${pedido.id}`,
        responsable: req.usuario.nombre,
        observaciones: pedido.observaciones,
      },
      { transaction: t },
    );

    pedido.itemId = item.id;
    pedido.estado = "Ingresado";
    await pedido.save({ transaction: t });

    await t.commit();

    res.status(200).json({
      mensaje: "Pedido ingresado: se sumó el stock al inventario.",
      pedido,
      movimiento,
      nuevo_stock: item.stock_actual,
    });
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }
    console.error("Error al actualizar pedido:", error.message);
    res.status(500).json({
      mensaje: "Error al actualizar el pedido.",
      ...detalleError(error),
    });
  }
};
