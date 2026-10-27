import { Muestra } from "../models/Muestra.model.js";

import { detalleError } from "../helpers/error.helper.js";
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
      ...detalleError(error),
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

    // MySQL devuelve los SUM como texto.
    const total = totales.map((t) => ({
      tipo: t.get("tipo"),
      cantidad: Number(t.get("cantidad")) || 0,
      positivos: Number(t.get("positivos")) || 0,
      negativos: Number(t.get("negativos")) || 0,
    }));

    res.status(200).json({ total, porTipo });
  } catch (error) {
    console.error("Error al obtener resumen de muestras:", error.message);
    res.status(500).json({
      mensaje: "Error al obtener el resumen de muestras.",
      ...detalleError(error),
    });
  }
};

// Tipos de diagnóstico que hace el CIT (son las hojas del Excel de diagnóstico).
export const TIPOS_MUESTRA = ["Brucelosis", "Campilobacteriosis", "Anemia Infecciosa Equina"];

const FECHA_VALIDA = /^\d{4}-\d{2}-\d{2}$/;

// Fecha de hoy como AAAA-MM-DD, en la hora local del servidor.
const hoy = () => {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${ahora.getFullYear()}-${mes}-${dia}`;
};

// Devuelve el número si es un entero mayor o igual a 0; si no, null.
const enteroNoNegativo = (valor) => {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 0 ? numero : null;
};

const textoOpcional = (valor) => String(valor ?? "").trim() || null;

// Paso 1: la muestra ingresa al laboratorio. El resultado se carga después.
export const registrarMuestra = async (req, res) => {
  try {
    const { tipo, fecha_ingreso, cantidad_muestras } = req.body;

    if (!TIPOS_MUESTRA.includes(tipo)) {
      return res.status(400).json({
        mensaje: `Tipo de muestra inválido. Valores permitidos: ${TIPOS_MUESTRA.join(", ")}.`,
      });
    }

    const cantidad = enteroNoNegativo(cantidad_muestras);
    if (!cantidad) {
      return res.status(400).json({
        mensaje: "La cantidad de muestras tiene que ser un número entero mayor a 0.",
      });
    }

    if (fecha_ingreso && !FECHA_VALIDA.test(fecha_ingreso)) {
      return res.status(400).json({ mensaje: "La fecha de ingreso no es válida." });
    }

    const muestra = await Muestra.create({
      tipo,
      fecha_ingreso: fecha_ingreso || hoy(),
      cantidad_muestras: cantidad,
      numero_ingreso: textoOpcional(req.body.numero_ingreso),
      numero_protocolo: textoOpcional(req.body.numero_protocolo),
      propietario: textoOpcional(req.body.propietario),
      renspa: textoOpcional(req.body.renspa),
      veterinario: textoOpcional(req.body.veterinario),
      establecimiento: textoOpcional(req.body.establecimiento),
      ubicacion: textoOpcional(req.body.ubicacion),
      departamento: textoOpcional(req.body.departamento),
      especie: textoOpcional(req.body.especie),
    });

    res.status(201).json({ mensaje: "Muestra registrada con éxito.", muestra });
  } catch (error) {
    console.error("Error al registrar la muestra:", error.message);
    res.status(500).json({
      mensaje: "Error al registrar la muestra.",
      ...detalleError(error),
    });
  }
};

// Paso 2: se carga el resultado del diagnóstico de una muestra que ya ingresó.
export const cargarResultado = async (req, res) => {
  try {
    const muestra = await Muestra.findByPk(req.params.id);
    if (!muestra) {
      return res.status(404).json({ mensaje: "Muestra no encontrada." });
    }

    const positivos = enteroNoNegativo(req.body.positivos ?? 0);
    const sospechosos = enteroNoNegativo(req.body.sospechosos ?? 0);
    const negativos = enteroNoNegativo(req.body.negativos ?? 0);
    if (positivos === null || sospechosos === null || negativos === null) {
      return res.status(400).json({
        mensaje: "Positivos, sospechosos y negativos tienen que ser números enteros (0 o más).",
      });
    }

    if (positivos + sospechosos + negativos > muestra.cantidad_muestras) {
      return res.status(400).json({
        mensaje: `La suma de positivos, sospechosos y negativos no puede superar la cantidad de muestras (${muestra.cantidad_muestras}).`,
      });
    }

    const { fecha_resultado } = req.body;
    if (!fecha_resultado || !FECHA_VALIDA.test(fecha_resultado)) {
      return res.status(400).json({ mensaje: "Indicá la fecha del resultado." });
    }
    // Las fechas AAAA-MM-DD se pueden comparar como texto.
    if (muestra.fecha_ingreso && fecha_resultado < muestra.fecha_ingreso) {
      return res.status(400).json({
        mensaje: "La fecha del resultado no puede ser anterior a la de ingreso.",
      });
    }

    await muestra.update({ positivos, sospechosos, negativos, fecha_resultado });
    res.status(200).json({ mensaje: "Resultado cargado con éxito.", muestra });
  } catch (error) {
    console.error("Error al cargar el resultado:", error.message);
    res.status(500).json({
      mensaje: "Error al cargar el resultado.",
      ...detalleError(error),
    });
  }
};
