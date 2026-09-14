import { Sector } from "../models/Sector.model.js";

export const obtenerSectores = async (req, res) => {
  try {
    const sectores = await Sector.findAll({ order: [["nombre", "ASC"]] });
    res.status(200).json(sectores);
  } catch (error) {
    console.error("Error al obtener sectores:", error.message);
    res.status(500).json({
      mensaje: "Error al obtener los sectores.",
      error: error.message,
    });
  }
};

export const crearSector = async (req, res) => {
  try {
    const { nombre, tipo, descripcion } = req.body;

    if (!nombre || nombre.trim() === "") {
      return res
        .status(400)
        .json({ mensaje: "El nombre del sector es obligatorio." });
    }

    const existe = await Sector.findOne({ where: { nombre } });
    if (existe) {
      return res
        .status(400)
        .json({ mensaje: "Ya existe un sector con ese nombre." });
    }

    const sector = await Sector.create({
      nombre,
      tipo: tipo || "Otro",
      descripcion: descripcion || null,
    });

    res.status(201).json({ mensaje: "Sector creado con éxito.", sector });
  } catch (error) {
    console.error("Error al crear sector:", error.message);
    res.status(500).json({
      mensaje: "Error al crear el sector.",
      error: error.message,
    });
  }
};

export const actualizarSector = async (req, res) => {
  try {
    const { id } = req.params;
    const sector = await Sector.findByPk(id);
    if (!sector) {
      return res.status(404).json({ mensaje: "Sector no encontrado." });
    }

    const { nombre, tipo, descripcion } = req.body;
    if (nombre !== undefined) sector.nombre = nombre;
    if (tipo !== undefined) sector.tipo = tipo;
    if (descripcion !== undefined) sector.descripcion = descripcion;

    await sector.save();
    res.status(200).json({ mensaje: "Sector actualizado correctamente.", sector });
  } catch (error) {
    console.error("Error al actualizar sector:", error.message);
    res.status(500).json({
      mensaje: "Error al actualizar el sector.",
      error: error.message,
    });
  }
};

export const eliminarSector = async (req, res) => {
  try {
    const { id } = req.params;
    const sector = await Sector.findByPk(id);
    if (!sector) {
      return res.status(404).json({ mensaje: "Sector no encontrado." });
    }

    await sector.destroy();
    res.status(200).json({ mensaje: "Sector eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar sector:", error.message);
    res.status(500).json({
      mensaje: "Error al eliminar el sector.",
      error: error.message,
    });
  }
};
