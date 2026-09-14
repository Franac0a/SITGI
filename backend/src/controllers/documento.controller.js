import { Documento } from "../models/Documento.model.js";
import fs from "node:fs";
import path from "node:path";

export const obtenerDocumentos = async (req, res) => {
  try {
    const { categoria } = req.query;
    const filtro = {};
    if (categoria) filtro.categoria = categoria;

    const documentos = await Documento.findAll({
      where: filtro,
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(documentos);
  } catch (error) {
    console.error("Error al obtener documentos:", error.message);
    res.status(500).json({
      mensaje: "Error al obtener los documentos.",
      error: error.message,
    });
  }
};

export const subirDocumento = async (req, res) => {
  try {
    const { titulo, categoria, codigo, descripcion } = req.body;

    if (!titulo || titulo.trim() === "") {
      return res
        .status(400)
        .json({ mensaje: "El título del documento es obligatorio." });
    }

    const archivo = req.file || null;

    const documento = await Documento.create({
      titulo,
      categoria: categoria || "Otro",
      codigo: codigo || null,
      descripcion: descripcion || null,
      nombre_archivo: archivo ? archivo.originalname : null,
      ruta_archivo: archivo ? archivo.filename : null,
      tamano: archivo ? archivo.size : null,
    });

    res.status(201).json({
      mensaje: "Documento cargado con éxito.",
      documento,
    });
  } catch (error) {
    console.error("Error al subir documento:", error.message);
    res.status(500).json({
      mensaje: "Error al cargar el documento.",
      error: error.message,
    });
  }
};

export const descargarDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const documento = await Documento.findByPk(id);
    if (!documento || !documento.ruta_archivo) {
      return res.status(404).json({ mensaje: "Archivo no encontrado." });
    }

    const dirUploads = path.resolve("uploads");
    const rutaCompleta = path.join(dirUploads, documento.ruta_archivo);

    if (!fs.existsSync(rutaCompleta)) {
      return res.status(404).json({ mensaje: "El archivo ya no existe." });
    }

    res.download(rutaCompleta, documento.nombre_archivo || documento.ruta_archivo);
  } catch (error) {
    console.error("Error al descargar documento:", error.message);
    res.status(500).json({
      mensaje: "Error al descargar el documento.",
      error: error.message,
    });
  }
};

export const eliminarDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const documento = await Documento.findByPk(id);
    if (!documento) {
      return res.status(404).json({ mensaje: "Documento no encontrado." });
    }

    if (documento.ruta_archivo) {
      const rutaCompleta = path.join(path.resolve("uploads"), documento.ruta_archivo);
      if (fs.existsSync(rutaCompleta)) {
        fs.unlinkSync(rutaCompleta);
      }
    }

    await documento.destroy();
    res.status(200).json({ mensaje: "Documento eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar documento:", error.message);
    res.status(500).json({
      mensaje: "Error al eliminar el documento.",
      error: error.message,
    });
  }
};
