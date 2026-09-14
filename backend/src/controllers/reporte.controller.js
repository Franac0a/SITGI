import { Item } from "../models/Item.model.js";
import { Movimiento } from "../models/Movimiento.model.js";
import { Sequelize, Op } from "sequelize";

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
      error: error.message,
    });
  }
};

export const exportarInventarioCsv = async (req, res) => {
  try {
    const items = await Item.findAll({ order: [["nombre", "ASC"]] });

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

    const escapar = (valor) => {
      const s = String(valor ?? "");
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const csv = [header, ...rows]
      .map((r) => r.map(escapar).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="inventario.csv"',
    );
    res.send("\uFEFF" + csv);
  } catch (error) {
    console.error("Error al exportar inventario:", error.message);
    res.status(500).json({
      mensaje: "Error al exportar el inventario.",
      error: error.message,
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
      error: error.message,
    });
  }
};
