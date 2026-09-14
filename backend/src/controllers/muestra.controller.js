import { Muestra } from "../models/Muestra.model.js";

export const obtenerMuestras = async (req, res) => {
  try {
    const { tipo } = req.query;
    const filtro = {};
    if (tipo) filtro.tipo = tipo;

    const muestras = await Muestra.findAll({
      where: filtro,
      order: [
        ["fecha_ingreso", "DESC"],
        ["numero_ingreso", "ASC"],
      ],
    });

    res.status(200).json(muestras);
  } catch (error) {
    console.error("Error al obtener muestras:", error.message);
    res.status(500).json({
      mensaje: "Error al obtener las muestras.",
      error: error.message,
    });
  }
};

export const obtenerResumenMuestras = async (req, res) => {
  try {
    const [totales, porTipo] = await Promise.all([
      Muestra.findAll({
        attributes: [
          "tipo",
          [Muestra.sequelize.fn("COUNT", Muestra.sequelize.col("id")), "cantidad"],
          [Muestra.sequelize.fn("SUM", Muestra.sequelize.col("positivos")), "positivos"],
          [Muestra.sequelize.fn("SUM", Muestra.sequelize.col("negativos")), "negativos"],
        ],
        group: ["tipo"],
      }),
      Muestra.count(),
    ]);

    res.status(200).json({ total: totales, porTipo });
  } catch (error) {
    console.error("Error al obtener resumen de muestras:", error.message);
    res.status(500).json({
      mensaje: "Error al obtener el resumen de muestras.",
      error: error.message,
    });
  }
};
