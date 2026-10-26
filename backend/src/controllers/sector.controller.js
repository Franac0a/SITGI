import { Sector } from "../models/Sector.model.js";
import { Item } from "../models/Item.model.js";
import { Movimiento } from "../models/Movimiento.model.js";
import { Pedido } from "../models/Pedido.model.js";
import { Residuo } from "../models/Residuo.model.js";
import { sequelize } from "../config/db.js";
import { detalleError } from "../helpers/error.helper.js";

// Cuántos registros usan el nombre de este sector (movimientos, pedidos,
// residuos y la ubicación de los ítems).
const contarUsos = async (nombre) => {
  const cantidades = await Promise.all([
    Movimiento.count({ where: { sector: nombre } }),
    Pedido.count({ where: { sector: nombre } }),
    Residuo.count({ where: { sector: nombre } }),
    Item.count({ where: { ubicacion: nombre }, paranoid: false }),
  ]);
  return cantidades.reduce((total, cantidad) => total + cantidad, 0);
};
const TIPOS_SECTOR = [
  "Laboratorio",
  "Heladera",
  "Droguero",
  "Estante",
  "Depósito",
  "Otro",
];


export const obtenerSectores = async (req, res) => {
  try {
    const sectores = await Sector.findAll({ order: [["nombre", "ASC"]] });
    res.status(200).json(sectores);
  } catch (error) {
    console.error("Error al obtener sectores:", error.message);
    res.status(500).json({
      mensaje: "Error al obtener los sectores.",
      ...detalleError(error),
    });
  }
};

export const crearSector = async (req, res) => {
  try {
    const { tipo, descripcion } = req.body;
    const nombre = String(req.body.nombre ?? "").trim();

    if (!nombre) {
      return res
        .status(400)
        .json({ mensaje: "El nombre del sector es obligatorio." });
    }

    if (tipo !== undefined && !TIPOS_SECTOR.includes(tipo)) {
      return res.status(400).json({
        mensaje: `Tipo de sector inválido. Valores permitidos: ${TIPOS_SECTOR.join(", ")}.`,
      });
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
      ...detalleError(error),
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
    if (tipo !== undefined && !TIPOS_SECTOR.includes(tipo)) {
      return res.status(400).json({
        mensaje: `Tipo de sector inválido. Valores permitidos: ${TIPOS_SECTOR.join(", ")}.`,
      });
    }
    const nombreAnterior = sector.nombre;
    if (nombre !== undefined) {
      const nombreNuevo = String(nombre).trim();
      if (!nombreNuevo) {
        return res.status(400).json({ mensaje: "El nombre del sector es obligatorio." });
      }
      const repetido = await Sector.findOne({ where: { nombre: nombreNuevo } });
      if (repetido && repetido.id !== sector.id) {
        return res.status(400).json({ mensaje: "Ya existe un sector con ese nombre." });
      }
      sector.nombre = nombreNuevo;
    }
    if (tipo !== undefined) sector.tipo = tipo;
    if (descripcion !== undefined) sector.descripcion = descripcion;

    // Si cambia el nombre, los registros que guardaban el nombre viejo
    // se actualizan al nuevo, todo junto en una transacción.
    await sequelize.transaction(async (transaction) => {
      await sector.save({ transaction });
      if (sector.nombre !== nombreAnterior) {
        const cambio = { where: { sector: nombreAnterior }, transaction };
        await Movimiento.update({ sector: sector.nombre }, cambio);
        await Pedido.update({ sector: sector.nombre }, cambio);
        await Residuo.update({ sector: sector.nombre }, cambio);
        await Item.update(
          { ubicacion: sector.nombre },
          { where: { ubicacion: nombreAnterior }, paranoid: false, transaction },
        );
      }
    });
    res.status(200).json({ mensaje: "Sector actualizado correctamente.", sector });
  } catch (error) {
    console.error("Error al actualizar sector:", error.message);
    res.status(500).json({
      mensaje: "Error al actualizar el sector.",
      ...detalleError(error),
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

    // Si se borrara, esos registros quedarían con un sector que ya no existe.
    const usos = await contarUsos(sector.nombre);
    if (usos > 0) {
      return res.status(409).json({
        mensaje: `No se puede eliminar "${sector.nombre}": tiene ${usos} registro(s) asociados (movimientos, pedidos, residuos o ítems).`,
      });
    }

    await sector.destroy();
    res.status(200).json({ mensaje: "Sector eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar sector:", error.message);
    res.status(500).json({
      mensaje: "Error al eliminar el sector.",
      ...detalleError(error),
    });
  }
};
