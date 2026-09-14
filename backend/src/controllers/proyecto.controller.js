import { Proyecto } from "../models/Proyecto.model.js";

export const obtenerProyectos = async (req, res) => {
  try {
    const proyectos = await Proyecto.findAll({ order: [["createdAt", "DESC"]] });
    res.status(200).json(proyectos);
  } catch (error) {
    console.error("Error al obtener proyectos:", error.message);
    res.status(500).json({
      mensaje: "Error al obtener los proyectos.",
      error: error.message,
    });
  }
};

export const crearProyecto = async (req, res) => {
  try {
    const { codigo, titulo, descripcion, director, estado, fecha_inicio, fecha_fin } =
      req.body;

    if (!titulo || titulo.trim() === "") {
      return res.status(400).json({ mensaje: "El título del proyecto es obligatorio." });
    }

    const proyecto = await Proyecto.create({
      codigo: codigo || null,
      titulo,
      descripcion: descripcion || null,
      director: director || null,
      estado: estado || "En ejecución",
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
    });

    res.status(201).json({ mensaje: "Proyecto creado con éxito.", proyecto });
  } catch (error) {
    console.error("Error al crear proyecto:", error.message);
    res.status(500).json({
      mensaje: "Error al crear el proyecto.",
      error: error.message,
    });
  }
};

export const actualizarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.findByPk(id);
    if (!proyecto) {
      return res.status(404).json({ mensaje: "Proyecto no encontrado." });
    }

    const { codigo, titulo, descripcion, director, estado, fecha_inicio, fecha_fin } =
      req.body;

    if (codigo !== undefined) proyecto.codigo = codigo;
    if (titulo !== undefined) proyecto.titulo = titulo;
    if (descripcion !== undefined) proyecto.descripcion = descripcion;
    if (director !== undefined) proyecto.director = director;
    if (estado !== undefined) proyecto.estado = estado;
    if (fecha_inicio !== undefined) proyecto.fecha_inicio = fecha_inicio;
    if (fecha_fin !== undefined) proyecto.fecha_fin = fecha_fin;

    await proyecto.save();
    res.status(200).json({ mensaje: "Proyecto actualizado.", proyecto });
  } catch (error) {
    console.error("Error al actualizar proyecto:", error.message);
    res.status(500).json({
      mensaje: "Error al actualizar el proyecto.",
      error: error.message,
    });
  }
};

export const eliminarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.findByPk(id);
    if (!proyecto) {
      return res.status(404).json({ mensaje: "Proyecto no encontrado." });
    }

    await proyecto.destroy();
    res.status(200).json({ mensaje: "Proyecto eliminado." });
  } catch (error) {
    console.error("Error al eliminar proyecto:", error.message);
    res.status(500).json({
      mensaje: "Error al eliminar el proyecto.",
      error: error.message,
    });
  }
};
