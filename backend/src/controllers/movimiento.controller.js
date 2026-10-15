import { Movimiento } from "../models/Movimiento.model.js";
import { Item } from "../models/Item.model.js";
import { sequelize } from "../config/db.js";

import { detalleError } from "../helpers/error.helper.js";
const TIPOS_VALIDOS = ["Ingreso", "Egreso", "Ajuste", "Reparación"];

export const registrarMovimiento = async (req, res) => {
  const {
    itemId,
    tipo_movimiento,
    cantidad,
    origen_destino,
    costo_unitario,
    observaciones,
  } = req.body;

  // Validaciones de entrada (antes de abrir la transacción)
  if (!TIPOS_VALIDOS.includes(tipo_movimiento)) {
    return res.status(400).json({
      mensaje: `Tipo de movimiento inválido. Valores permitidos: ${TIPOS_VALIDOS.join(", ")}.`,
    });
  }

  const cantFloat = Number(cantidad);
  if (!Number.isFinite(cantFloat) || cantFloat < 0) {
    return res
      .status(400)
      .json({ mensaje: "La cantidad debe ser un número válido." });
  }
  // Un ajuste es un conteo físico y puede quedar en 0; el resto necesita > 0.
  if (tipo_movimiento !== "Ajuste" && cantFloat <= 0) {
    return res
      .status(400)
      .json({ mensaje: "La cantidad debe ser mayor a 0." });
  }

  // El responsable sale del usuario autenticado, no de lo que mande el cliente.
  const responsable = req.usuario.nombre;

  let t;
  try {
    t = await sequelize.transaction();

    // Bloqueo de fila: evita que dos movimientos simultáneos pisen el stock.
    const item = await Item.findByPk(itemId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!item) {
      await t.rollback();
      return res
        .status(404)
        .json({ mensaje: "El ítem especificado no existe en el catálogo." });
    }

    const stockAnterior = Number(item.stock_actual);
    let stockNuevo = stockAnterior;
    let obsFinal = observaciones || null;

    if (tipo_movimiento === "Ingreso") {
      stockNuevo = stockAnterior + cantFloat;
    } else if (tipo_movimiento === "Ajuste") {
      // Ajuste = conteo físico: la cantidad es el stock real contado.
      stockNuevo = cantFloat;
      const nota = `Ajuste de stock: ${stockAnterior} → ${cantFloat}.`;
      obsFinal = obsFinal ? `${nota} ${obsFinal}` : nota;
    } else {
      // Egreso / Reparación descuentan
      if (stockAnterior < cantFloat) {
        await t.rollback();
        return res.status(400).json({
          mensaje: `Stock insuficiente. Hay ${stockAnterior} en inventario y se quiere descontar ${cantFloat}.`,
        });
      }
      stockNuevo = stockAnterior - cantFloat;
    }

    const nuevoMovimiento = await Movimiento.create(
      {
        itemId: item.id,
        tipo_movimiento,
        cantidad: cantFloat,
        origen_destino,
        costo_unitario,
        responsable,
        observaciones: obsFinal,
      },
      { transaction: t },
    );

    item.stock_actual = stockNuevo;
    await item.save({ transaction: t });

    await t.commit();

    res.status(201).json({
      mensaje: "Movimiento registrado y stock actualizado con éxito.",
      movimiento: nuevoMovimiento,
      nuevo_stock: item.stock_actual,
    });
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }
    console.error("Error al registrar el movimiento:", error);
    res.status(500).json({
      mensaje: "Error interno al procesar el stock.",
      ...detalleError(error),
    });
  }
};

export const obtenerHistorialPorItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const historial = await Movimiento.findAll({
      where: { itemId },
      order: [["fecha_movimiento", "DESC"]],
    });

    res.status(200).json(historial);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res
      .status(500)
      .json({
        mensaje: "Error al cargar la trazabilidad.",
        ...detalleError(error),
      });
  }
};

export const obtenerMovimientos = async (req, res) => {
  try {
    const movimientos = await Movimiento.findAll({
      include: [
        {
          model: Item,
          attributes: ["id", "nombre", "codigo_identificacion", "unidad_medida"],
          paranoid: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(movimientos);
  } catch (error) {
    console.error("Error al obtener movimientos:", error);
    res.status(500).json({
      mensaje: "Error al cargar los movimientos.",
      ...detalleError(error),
    });
  }
};
