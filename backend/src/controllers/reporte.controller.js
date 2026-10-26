import { Item } from "../models/Item.model.js";
import { Movimiento } from "../models/Movimiento.model.js";
import { Sequelize, Op } from "sequelize";
import { filtroMovimientos } from "./movimiento.controller.js";
import { TIPOS_QUE_RESTAN } from "../utils/permisos.js";

import { detalleError } from "../helpers/error.helper.js";
export const obtenerAlertas = async (req, res) => {
  try {
    const items = await Item.findAll({ order: [["nombre", "ASC"]] });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limite = new Date(hoy);
    limite.setDate(limite.getDate() + 30);

    const alertas = [];

    for (const it of items) {
      const stock = Number(it.stock_actual);
      const minimo = Number(it.stock_minimo);

      if (stock <= minimo) {
        alertas.push({
          tipo: stock <= 0 ? "agotado" : "stock_bajo",
          item: it,
        });
      }

      const detalles = it.detalles_tecnicos || {};
      const venc = detalles.fechaVencimiento;
      if (venc) {
        const fecha = new Date(venc);
        if (!isNaN(fecha.getTime())) {
          if (fecha < hoy) {
            alertas.push({ tipo: "vencido", item: it });
          } else if (fecha <= limite) {
            alertas.push({ tipo: "proximo_vencimiento", item: it });
          }
        }
      }
    }

    res.status(200).json({ total: alertas.length, alertas });
  } catch (error) {
    console.error("Error al obtener alertas:", error.message);
    res.status(500).json({
      mensaje: "Error al generar las alertas.",
      ...detalleError(error),
    });
  }
};

const escaparCsv = (valor) => {
  const s = String(valor ?? "");
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const enviarCsv = (res, nombreArchivo, header, rows) => {
  const csv = [header, ...rows]
    .map((r) => r.map(escaparCsv).join(";"))
    .join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${nombreArchivo}"`,
  );
  res.send("\uFEFF" + csv);
};

/** Filtros opcionales del inventario: categoria, sector (ubicación), busqueda (nombre/código). */
const filtroInventario = ({ categoria, sector, busqueda }) => {
  const where = {};
  if (categoria) where.categoria = categoria;
  if (sector) where.ubicacion = { [Op.like]: `%${sector}%` };
  if (busqueda) {
    where[Op.or] = [
      { nombre: { [Op.like]: `%${busqueda}%` } },
      { codigo_identificacion: { [Op.like]: `%${busqueda}%` } },
    ];
  }
  return where;
};

export const exportarInventarioCsv = async (req, res) => {
  try {
    const items = await Item.findAll({
      where: filtroInventario(req.query),
      order: [["nombre", "ASC"]],
    });

    const header = [
      "Codigo",
      "Nombre",
      "Categoria",
      "Marca",
      "Stock",
      "Stock minimo",
      "Unidad",
      "Ubicacion",
      "CAS",
      "Lote",
      "Vencimiento",
    ];

    const rows = items.map((it) => {
      const d = it.detalles_tecnicos || {};
      return [
        it.codigo_identificacion || "",
        it.nombre || "",
        it.categoria || "",
        it.marca || "",
        it.stock_actual ?? "",
        it.stock_minimo ?? "",
        it.unidad_medida || "",
        it.ubicacion || "",
        d.codigoCas || "",
        d.numeroLote || "",
        d.fechaVencimiento || "",
      ];
    });

    enviarCsv(res, "inventario.csv", header, rows);
  } catch (error) {
    console.error("Error al exportar inventario:", error.message);
    res.status(500).json({
      mensaje: "Error al exportar el inventario.",
      ...detalleError(error),
    });
  }
};

export const obtenerResumen = async (req, res) => {
  try {
    const [totalItems, totalStock, bajoStock, porCategoria, porTipo, recientes] =
      await Promise.all([
        Item.count(),
        Item.sum("stock_actual"),
        Item.count({
          where: {
            stock_actual: { [Op.lte]: Sequelize.col("stock_minimo") },
          },
        }),
        Item.findAll({
          attributes: [
            "categoria",
            [Sequelize.fn("COUNT", Sequelize.col("id")), "cantidad"],
          ],
          group: ["categoria"],
          order: [[Sequelize.fn("COUNT", Sequelize.col("id")), "DESC"]],
        }),
        Movimiento.findAll({
          attributes: [
            "tipo_movimiento",
            [Sequelize.fn("COUNT", Sequelize.col("id")), "cantidad"],
          ],
          group: ["tipo_movimiento"],
        }),
        Movimiento.findAll({
          order: [["createdAt", "DESC"]],
          limit: 10,
          include: [
            {
              model: Item,
              attributes: ["id", "nombre", "codigo_identificacion"],
              paranoid: false,
            },
          ],
        }),
      ]);

    res.status(200).json({
      totalItems,
      totalStock: totalStock ?? 0,
      bajoStock,
      porCategoria,
      porTipo,
      recientes,
    });
  } catch (error) {
    console.error("Error al obtener resumen:", error.message);
    res.status(500).json({
      mensaje: "Error al obtener el resumen.",
      ...detalleError(error),
    });
  }
};

export const exportarMovimientosCsv = async (req, res) => {
  try {
    const where = filtroMovimientos(req.query);
    const includeItem = {
      model: Item,
      attributes: ["nombre", "codigo_identificacion", "categoria", "unidad_medida"],
      paranoid: false,
    };
    if (req.query.categoria) includeItem.where = { categoria: req.query.categoria };

    const movimientos = await Movimiento.findAll({
      where,
      include: [includeItem],
      order: [["fecha_movimiento", "DESC"], ["createdAt", "DESC"]],
    });

    const header = [
      "Fecha",
      "Tipo",
      "Codigo",
      "Elemento",
      "Categoria",
      "Cantidad",
      "Unidad",
      "Sector",
      "Origen/Destino",
      "Responsable",
      "Observaciones",
    ];
    const rows = movimientos.map((m) => [
      m.fecha_movimiento || "",
      m.tipo_movimiento,
      m.Item?.codigo_identificacion || "",
      m.Item?.nombre || "",
      m.Item?.categoria || "",
      m.cantidad,
      m.Item?.unidad_medida || "",
      m.sector || "",
      m.origen_destino || "",
      m.responsable || "",
      m.observaciones || "",
    ]);

    enviarCsv(res, "movimientos.csv", header, rows);
  } catch (error) {
    console.error("Error al exportar movimientos:", error.message);
    res.status(500).json({
      mensaje: "Error al exportar los movimientos.",
      ...detalleError(error),
    });
  }
};

// Período de los reportes de consumo: los últimos "dias" días (entre 1 y 365, por defecto 30).
// Devuelve la cantidad de días y la fecha de inicio en formato AAAA-MM-DD.
const periodoDeConsumo = (diasPedidos) => {
  const dias = Math.min(Math.max(parseInt(diasPedidos, 10) || 30, 1), 365);
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  return { dias, desdeStr: desde.toISOString().slice(0, 10) };
};

/**
 * Alta rotación: elementos con más consumo (egresos, bajas, reparaciones)
 * en los últimos N días (por defecto 30). Parámetros: dias, limite.
 */
export const obtenerRotacion = async (req, res) => {
  try {
    const { dias, desdeStr } = periodoDeConsumo(req.query.dias);
    const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 10, 1), 50);

    const filas = await Movimiento.findAll({
      attributes: [
        "itemId",
        [Sequelize.fn("SUM", Sequelize.col("cantidad")), "consumo"],
        [Sequelize.fn("COUNT", Sequelize.col("Movimiento.id")), "movimientos"],
      ],
      where: {
        tipo_movimiento: { [Op.in]: TIPOS_QUE_RESTAN },
        fecha_movimiento: { [Op.gte]: desdeStr },
      },
      include: [
        {
          model: Item,
          attributes: ["nombre", "codigo_identificacion", "categoria", "unidad_medida", "stock_actual", "stock_minimo"],
          paranoid: false,
        },
      ],
      group: ["itemId", "Item.id"],
      order: [[Sequelize.fn("SUM", Sequelize.col("cantidad")), "DESC"]],
      limit: limite,
    });

    const rotacion = filas.map((f) => {
      const consumo = Number(f.get("consumo")) || 0;
      const stock = Number(f.Item?.stock_actual) || 0;
      return {
        itemId: f.itemId,
        nombre: f.Item?.nombre || "(ítem eliminado)",
        codigo_identificacion: f.Item?.codigo_identificacion || null,
        categoria: f.Item?.categoria || null,
        unidad_medida: f.Item?.unidad_medida || null,
        consumo,
        movimientos: Number(f.get("movimientos")) || 0,
        stock_actual: stock,
        // Días de cobertura estimados con el ritmo de consumo del período.
        dias_cobertura: consumo > 0 ? Math.round((stock / consumo) * dias) : null,
      };
    });

    res.status(200).json({ dias, desde: desdeStr, rotacion });
  } catch (error) {
    console.error("Error al calcular rotación:", error.message);
    res.status(500).json({
      mensaje: "Error al calcular la rotación.",
      ...detalleError(error),
    });
  }
};

/**
 * Consumo por sector: cuántos consumos (egresos, bajas, reparaciones) registró
 * cada sector en los últimos N días y de cuántos elementos distintos.
 * No se suman cantidades porque cada ítem tiene su propia unidad (mL, g, cajas...).
 */
export const obtenerConsumoPorSector = async (req, res) => {
  try {
    const { dias, desdeStr } = periodoDeConsumo(req.query.dias);

    const filas = await Movimiento.findAll({
      attributes: [
        "sector",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "consumos"],
        [Sequelize.fn("COUNT", Sequelize.fn("DISTINCT", Sequelize.col("itemId"))), "elementos"],
      ],
      where: {
        tipo_movimiento: { [Op.in]: TIPOS_QUE_RESTAN },
        fecha_movimiento: { [Op.gte]: desdeStr },
      },
      group: ["sector"],
      order: [[Sequelize.fn("COUNT", Sequelize.col("id")), "DESC"]],
      raw: true,
    });

    // MySQL devuelve los COUNT como texto.
    const sectores = filas.map((fila) => ({
      sector: fila.sector,
      consumos: Number(fila.consumos),
      elementos: Number(fila.elementos),
    }));

    res.status(200).json({ dias, desde: desdeStr, sectores });
  } catch (error) {
    console.error("Error al calcular el consumo por sector:", error.message);
    res.status(500).json({
      mensaje: "Error al calcular el consumo por sector.",
      ...detalleError(error),
    });
  }
};
