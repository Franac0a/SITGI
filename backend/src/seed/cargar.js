import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Item } from "../models/Item.model.js";
import { Muestra } from "../models/Muestra.model.js";
import { UserModel } from "../models/User.model.js";
import { encriptarContraseña } from "../helpers/bcrypt.helper.js";

export const DIR_SEED = fileURLToPath(new URL("../../seed", import.meta.url));

export const leerJsonSeed = (nombre) => {
  const ruta = path.join(DIR_SEED, nombre);
  if (!fs.existsSync(ruta)) return null;
  return JSON.parse(fs.readFileSync(ruta, "utf-8"));
};

// Carga ítems nuevos; si el código ya existe se deja como está.
export const cargarItems = async (items) => {
  const existentes = new Set(
    (await Item.findAll({ attributes: ["codigo_identificacion"], paranoid: false }))
      .map((i) => i.codigo_identificacion),
  );
  const nuevos = items.filter((i) => !existentes.has(i.codigo_identificacion));
  if (nuevos.length > 0) await Item.bulkCreate(nuevos);
  return { total: items.length, nuevos: nuevos.length };
};

// Carga muestras solo si la tabla está vacía.
export const cargarMuestrasSiVacio = async (muestras) => {
  const hay = await Muestra.count();
  if (hay > 0) return { total: muestras.length, nuevas: 0, omitido: true };
  await Muestra.bulkCreate(muestras);
  return { total: muestras.length, nuevas: muestras.length, omitido: false };
};

// Crea el usuario Dirección inicial si no existe. Sin SEED_DIRECTOR_PASSWORD
// se genera una clave al azar que se muestra una sola vez.
export const asegurarDirector = async () => {
  const email = process.env.SEED_DIRECTOR_EMAIL || "director@citformosa.gob.ar";

  const existe = await UserModel.findOne({ where: { email } });
  if (existe) return { email, creado: false, usuario: existe };

  const definida = process.env.SEED_DIRECTOR_PASSWORD;
  if (process.env.NODE_ENV === "production" && !definida) {
    throw new Error(
      "En producción hay que definir SEED_DIRECTOR_PASSWORD para crear el director inicial.",
    );
  }
  const password = definida || crypto.randomBytes(9).toString("base64url");

  const usuario = await UserModel.create({
    dni: process.env.SEED_DIRECTOR_DNI || "11223344",
    nombre: "Director CIT Formosa",
    email,
    password: await encriptarContraseña(password),
    rol: "Dirección",
    estado: "activo",
  });
  return { email, creado: true, usuario, passwordGenerada: definida ? null : password };
};
