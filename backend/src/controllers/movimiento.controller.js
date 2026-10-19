import { Op } from "sequelize";
import { Movimiento } from "../models/Movimiento.model.js";
import { Item } from "../models/Item.model.js";
import { sequelize } from "../config/db.js";
import { detalleError } from "../helpers/error.helper.js";
import { avisarSiStockBajo } from "../helpers/stockBajo.helper.js";
import {
  TIPOS_MOVIMIENTO,
  TIPOS_QUE_SUMAN,
  TIPOS_QUE_RESTAN,
  puedeRegistrarTipo,
} from "../utils/permisos.js";

export const registrarMovimiento = async (req, res) => {
  const {
    itemId,
    tipo_movimiento,
    cantidad,
    sector,
    nueva_ubicacion,
    origen_destino,
    costo_unitario,
    observaciones,
  } = req.body;

  if (!TIPOS_MOVIMIENTO.includes(tipo_movimiento)) {
    return res.status(400).json({
      mensaje: `Tipo de movimiento inválido. Valores permitidos: ${TIPOS_MOVIMIENTO.join(", ")}.`,
    });
  }

  // Investigador y Técnico/Becario solo pueden registrar consumos (egresos).
  if (!puedeRegistrarTipo(req.usuario.rol, tipo_movimiento)) {
    return res.status(403).json({
      mensaje: `Tu rol (${req.usuario.rol}) no puede registrar movimientos de tipo "${tipo_movimiento}".`,
    });
  }

  const esCambioUbicacion = tipo_movimiento === "Cambio de ubicación";
  const esAjuste = tipo_movimiento === "Ajuste";

  let cantFloat = Number(cantidad);
  if (esCambioUbicacion && (cantidad === undefined || cantidad === "")) {
    cantFloat = 0; // se completa con el stock del ítem más abajo
  }
  if (!Number.isFinite(cantFloat) || cantFloat < 0) {
    return res
      .status(400)
      .json({ mensaje: "La cantidad debe ser un número válido." });
  }
  // Ajuste (conteo físico) y cambio de ubicación admiten 0; el resto necesita > 0.
  if (!esAjuste && !esCambioUbicacion && cantFloat <= 0) {
    return res
      .status(400)
      .json({ mensaje: "La cantidad debe ser mayor a 0." });
  }

  const ubicacionNueva = String(nueva_ubicacion ?? "").trim();
  if (esCambioUbicacion && !ubicacionNueva) {
    return res.status(400).json({
      mensaje: "Indicá la nueva ubicación del elemento.",
    });
  }

  const sectorFinal = String(sector ?? "").trim() || null;

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
    let origenDestinoFinal = origen_destino || null;
    let cantidadRegistrada = cantFloat;

    if (TIPOS_QUE_SUMAN.includes(tipo_movimiento)) {
      stockNuevo = stockAnterior + cantFloat;
    } else if (esAjuste) {
      // Ajuste = conteo físico: la cantidad es el stock real contado.
      stockNuevo = cantFloat;
      const nota = `Ajuste de stock: ${stockAnterior} → ${cantFloat}.`;
      obsFinal = obsFinal ? `${nota} ${obsFinal}` : nota;
    } else if (esCambioUbicacion) {
      // No modifica el stock: solo mueve el elemento a otra ubicación.
      const ubicacionAnterior = item.ubicacion || "Sin asignar";
      item.ubicacion = ubicacionNueva;
      origenDestinoFinal = `${ubicacionAnterior} → ${ubicacionNueva}`;
      cantidadRegistrada = cantFloat > 0 ? cantFloat : stockAnterior;
    } else if (TIPOS_QUE_RESTAN.includes(tipo_movimiento)) {
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
        cantidad: cantidadRegistrada,
        sector: sectorFinal,
        origen_destino: origenDestinoFinal,
        costo_unitario,
        responsable,
        observaciones: obsFinal,
      },
      { transaction: t },
    );

    item.stock_actual = stockNuevo;
    await item.save({ transaction: t });
    await avisarSiStockBajo(item, t);

    await t.commit();

    res.status(201).json({
      mensaje: "Movimiento registrado con éxito.",
      movimiento: nuevoMovimiento,
      nuevo_stock: item.stock_actual,
      ubicacion: item.ubicacion,
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

/**
 * Arma el filtro de movimientos a partir de la query:
 * itemId, sector, tipo, responsable (usuario), desde, hasta (YYYY-MM-DD).
 */
export const filtroMovimientos = (query) => {
  const { itemId, sector, tipo, responsable, desde, hasta } = query;
  const where = {};
  if (itemId) where.itemId = itemId;
  if (sector) where.sector = { [Op.like]: `%${sector}%` };
  if (tipo) where.tipo_movimiento = tipo;
  if (responsable) where.responsable = { [Op.like]: `%${responsable}%` };
  if (desde || hasta) {
    where.fecha_movimiento = {};
    if (desde) where.fecha_movimiento[Op.gte] = desde;
    if (hasta) where.fecha_movimiento[Op.lte] = hasta;
  }
  return where;
};

export const obtenerMovimientos = async (req, res) => {
  try {
    const movimientos = await Movimiento.findAll({
      where: filtroMovimientos(req.query),
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
