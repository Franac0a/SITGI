import { Movimiento } from "../models/Movimiento.model.js";
import { Item } from "../models/Item.model.js";
import { sequelize } from "../config/db.js";

export const registrarMovimiento = async (req, res) => {
  let t;
  try {
    t = await sequelize.transaction();

    const {
      itemId,
      tipo_movimiento,
      cantidad,
      origen_destino,
      costo_unitario,
      responsable,
      observaciones,
    } = req.body;

    const item = await Item.findByPk(itemId, { transaction: t });

    if (!item) {
      await t.rollback();
      return res
        .status(404)
        .json({ mensaje: "El ítem especificado no existe en el catálogo." });
    }

    const nuevoMovimiento = await Movimiento.create(
      {
        itemId,
        tipo_movimiento,
        cantidad,
        origen_destino,
        costo_unitario,
        responsable,
        observaciones,
      },
      { transaction: t },
    );

    const cantFloat = parseFloat(cantidad);

    if (tipo_movimiento === "Ingreso" || tipo_movimiento === "Ajuste") {
      item.stock_actual += cantFloat;
    } else if (
      tipo_movimiento === "Egreso" ||
      tipo_movimiento === "Reparación"
    ) {
      if (item.stock_actual < cantFloat) {
        await t.rollback();
        return res.status(400).json({
          mensaje: `Stock insuficiente. Tenés ${item.stock_actual} en inventario y querés descontar ${cantFloat}.`,
        });
      }
      item.stock_actual -= cantFloat;
    }

    await item.save({ transaction: t });

    await t.commit();

    res.status(201).json({
      mensaje: "Movimiento registrado y stock actualizado con éxito.",
      movimiento: nuevoMovimiento,
      nuevo_stock: item.stock_actual,
    });
  } catch (error) {
    if (t) {
      await t.rollback();
    }
    console.error("Error al registrar el movimiento:", error);
    res.status(500).json({
      mensaje: "Error interno al procesar el stock.",
      error: error.message,
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
        error: error.message,
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
      error: error.message,
    });
  }
};
