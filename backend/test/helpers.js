import { after } from "node:test";
import request from "supertest";
import app from "../src/app.js";
import { sequelize } from "../src/config/db.js";
import { UserModel } from "../src/models/User.model.js";
import { Item } from "../src/models/Item.model.js";
import { Sector } from "../src/models/Sector.model.js";
import { encriptarContraseña } from "../src/helpers/bcrypt.helper.js";

export { request, app };

// Sin esto el pool de MySQL mantiene vivo el proceso unos segundos por archivo.
after(() => sequelize.close());

export const CLAVE = "Prueba123!";

export const USUARIOS = {
  direccion: "Dirección",
  administracion: "Administración",
  inventario: "Inventario",
  investigador: "Investigador",
  tecnico: "Técnico/Becario",
  responsable: "Responsable de área",
};

export const emailDe = (clave) => `${clave}@test.local`;

// SQLite en memoria usa una sola conexión y no bloquea filas: la concurrencia solo se prueba en MySQL.
export const sinConcurrencia =
  sequelize.getDialect() === "sqlite" && "requiere MySQL (npm run test:mysql)";

// Sectores que usan los tests (solo se aceptan sectores cargados en la tabla).
export const SECTORES = ["Laboratorio 1", "Lab 2", "Bioquímica", "Microbiología"];

export const prepararBase = async () => {
  await sequelize.sync({ force: true });
  await Sector.bulkCreate(SECTORES.map((nombre) => ({ nombre })));
  const hash = await encriptarContraseña(CLAVE);
  let dni = 1000;
  for (const [clave, rol] of Object.entries(USUARIOS)) {
    await UserModel.create({
      dni: String(dni++),
      nombre: `Usuario ${rol}`,
      email: emailDe(clave),
      password: hash,
      rol,
      estado: "activo",
    });
  }
};

// Inicia sesión y devuelve la cookie para mandarla en los requests.
export const sesion = async (clave) => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: emailDe(clave), password: CLAVE });
  const cookie = res.headers["set-cookie"]?.[0]?.split(";")[0];
  if (res.status !== 200 || !cookie) {
    throw new Error(`No se pudo iniciar sesión como ${clave}: ${res.status}`);
  }
  return cookie;
};

export const sesiones = async () => {
  const cookies = {};
  for (const clave of Object.keys(USUARIOS)) cookies[clave] = await sesion(clave);
  return cookies;
};

export const crearItem = (datos = {}) =>
  Item.create({
    nombre: "Etanol 96%",
    categoria: "Droguero",
    stock_actual: 10,
    stock_minimo: 2,
    ubicacion: "Estante A",
    ...datos,
  });

export const stockDe = async (id) => Number((await Item.findByPk(id)).stock_actual);
