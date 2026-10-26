import { Sector } from "../models/Sector.model.js";

// Movimientos, pedidos y residuos guardan el nombre del sector. Para que los
// reportes por sector no se dividan por errores de tipeo ("Lab. Molecular" y
// "Laboratorio molecular"), solo se aceptan sectores cargados en la tabla.

export const MENSAJE_SECTOR_INEXISTENTE =
  "El sector indicado no existe. Elegí uno de la lista de sectores.";

// Devuelve el nombre sin espacios de más, o null si no se indicó sector.
export const limpiarSector = (valor) => String(valor ?? "").trim() || null;

// true si se indicó un sector y no está cargado en la tabla de sectores.
export const sectorNoExiste = async (nombre) =>
  nombre !== null && !(await Sector.findOne({ where: { nombre } }));
