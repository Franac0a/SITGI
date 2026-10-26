import { Residuo } from "../models/Residuo.model.js";

import { detalleError } from "../helpers/error.helper.js";
import {
  limpiarSector,
  sectorNoExiste,
  MENSAJE_SECTOR_INEXISTENTE,
} from "../helpers/sector.helper.js";

const TIPOS_RESIDUO = ["Patológico", "Químico", "Tóxico", "Biológico", "Otro"];
const ESTADOS_RESIDUO = ["Pendiente", "Retirado"];

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
      ...detalleError(error),
    });
  }
};

export const crearResiduo = async (req, res) => {
  try {
    const {
      tipo,
      descripcion,
      sector,
      retiro_programado,
      observaciones,
    } = req.body;
    // El responsable es el usuario autenticado, no un dato del cliente.
    const responsable = req.usuario.nombre;

    if (tipo !== undefined && !TIPOS_RESIDUO.includes(tipo)) {
      return res.status(400).json({
        mensaje: `Tipo de residuo inválido. Valores permitidos: ${TIPOS_RESIDUO.join(", ")}.`,
      });
    }

    if (!descripcion || descripcion.trim() === "") {
      return res
        .status(400)
        .json({ mensaje: "La descripción del residuo es obligatoria." });
    }

    const sectorFinal = limpiarSector(sector);
    if (await sectorNoExiste(sectorFinal)) {
      return res.status(400).json({ mensaje: MENSAJE_SECTOR_INEXISTENTE });
    }

    const residuo = await Residuo.create({
      tipo: tipo || "Otro",
      descripcion,
      sector: sectorFinal,
      responsable,
      retiro_programado: retiro_programado || null,
      observaciones: observaciones || null,
    });

    res.status(201).json({ mensaje: "Residuo registrado con éxito.", residuo });
  } catch (error) {
    console.error("Error al crear residuo:", error.message);
    res.status(500).json({
      mensaje: "Error al crear el residuo.",
      ...detalleError(error),
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
      retiro_programado,
      estado,
      observaciones,
    } = req.body;

    if (tipo !== undefined && !TIPOS_RESIDUO.includes(tipo)) {
      return res.status(400).json({
        mensaje: `Tipo de residuo inválido. Valores permitidos: ${TIPOS_RESIDUO.join(", ")}.`,
      });
    }
    if (estado !== undefined && !ESTADOS_RESIDUO.includes(estado)) {
      return res.status(400).json({
        mensaje: `Estado inválido. Valores permitidos: ${ESTADOS_RESIDUO.join(", ")}.`,
      });
    }

    if (sector !== undefined) {
      const sectorFinal = limpiarSector(sector);
      if (await sectorNoExiste(sectorFinal)) {
        return res.status(400).json({ mensaje: MENSAJE_SECTOR_INEXISTENTE });
      }
      residuo.sector = sectorFinal;
    }
    if (tipo !== undefined) residuo.tipo = tipo;
    if (descripcion !== undefined) residuo.descripcion = descripcion;
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
      ...detalleError(error),
    });
  }
};
