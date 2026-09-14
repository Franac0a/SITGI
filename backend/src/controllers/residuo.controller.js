import { Residuo } from "../models/Residuo.model.js";

export const obtenerResiduos = async (req, res) => {
  try {
    const residuos = await Residuo.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(residuos);
  } catch (error) {
    console.error("Error al obtener residuos:", error.message);
    res.status(500).json({
      mensaje: "Error al obtener los residuos.",
      error: error.message,
    });
  }
};

export const crearResiduo = async (req, res) => {
  try {
    const {
      tipo,
      descripcion,
      sector,
      responsable,
      retiro_programado,
      observaciones,
    } = req.body;

    if (!descripcion || descripcion.trim() === "") {
      return res
        .status(400)
        .json({ mensaje: "La descripción del residuo es obligatoria." });
    }

    if (!responsable || responsable.trim() === "") {
      return res
        .status(400)
        .json({ mensaje: "Debe indicar el responsable del residuo." });
    }

    const residuo = await Residuo.create({
      tipo: tipo || "Otro",
      descripcion,
      sector: sector || null,
      responsable,
      retiro_programado: retiro_programado || null,
      observaciones: observaciones || null,
    });

    res.status(201).json({ mensaje: "Residuo registrado con éxito.", residuo });
  } catch (error) {
    console.error("Error al crear residuo:", error.message);
    res.status(500).json({
      mensaje: "Error al crear el residuo.",
      error: error.message,
    });
  }
};

export const actualizarResiduo = async (req, res) => {
  try {
    const { id } = req.params;
    const residuo = await Residuo.findByPk(id);
    if (!residuo) {
      return res.status(404).json({ mensaje: "Residuo no encontrado." });
    }

    const {
      tipo,
      descripcion,
      sector,
      responsable,
      retiro_programado,
      estado,
      observaciones,
    } = req.body;

    if (tipo !== undefined) residuo.tipo = tipo;
    if (descripcion !== undefined) residuo.descripcion = descripcion;
    if (sector !== undefined) residuo.sector = sector;
    if (responsable !== undefined) residuo.responsable = responsable;
    if (retiro_programado !== undefined)
      residuo.retiro_programado = retiro_programado;
    if (estado !== undefined) residuo.estado = estado;
    if (observaciones !== undefined) residuo.observaciones = observaciones;

    await residuo.save();
    res.status(200).json({ mensaje: "Residuo actualizado correctamente.", residuo });
  } catch (error) {
    console.error("Error al actualizar residuo:", error.message);
    res.status(500).json({
      mensaje: "Error al actualizar el residuo.",
      error: error.message,
    });
  }
};
