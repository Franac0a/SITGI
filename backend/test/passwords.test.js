import { test, before } from "node:test";
import assert from "node:assert/strict";
import { request, app, prepararBase, sesion, CLAVE, emailDe } from "./helpers.js";
import { UserModel } from "../src/models/User.model.js";

before(prepararBase);

const login = (clave, password) =>
  request(app).post("/api/auth/login").send({ email: emailDe(clave), password });

const cambiarPropia = (cookie, datos) =>
  request(app).put("/api/auth/password").set("Cookie", cookie).send(datos);

test("cada usuario cambia su contraseña escribiendo la actual", async () => {
  const cookie = await sesion("investigador");

  const malaActual = await cambiarPropia(cookie, { actual: "otra-clave", nueva: "NuevaClave1" });
  assert.equal(malaActual.status, 400);
  assert.match(malaActual.body.mensaje, /actual no es correcta/);

  const corta = await cambiarPropia(cookie, { actual: CLAVE, nueva: "corta" });
  assert.equal(corta.status, 400);

  const bien = await cambiarPropia(cookie, { actual: CLAVE, nueva: "NuevaClave1" });
  assert.equal(bien.status, 200);
  assert.equal((await login("investigador", CLAVE)).status, 401);
  assert.equal((await login("investigador", "NuevaClave1")).status, 200);
});

test("sin sesión no se puede cambiar la contraseña", async () => {
  const res = await request(app).put("/api/auth/password").send({ actual: CLAVE, nueva: "NuevaClave1" });
  assert.equal(res.status, 401);
});

test("la Dirección restablece la contraseña de otro usuario", async () => {
  const direccion = await sesion("direccion");
  const tecnico = await UserModel.findOne({ where: { email: emailDe("tecnico") } });

  const res = await request(app)
    .put(`/api/users/${tecnico.id}/password`)
    .set("Cookie", direccion)
    .send({ nueva: "Restablecida1" });

  assert.equal(res.status, 200);
  assert.equal((await login("tecnico", "Restablecida1")).status, 200);
});

test("solo la Dirección restablece, y no su propia contraseña", async () => {
  const otro = await UserModel.findOne({ where: { email: emailDe("responsable") } });
  const administracion = await sesion("administracion");
  const sinPermiso = await request(app)
    .put(`/api/users/${otro.id}/password`)
    .set("Cookie", administracion)
    .send({ nueva: "Restablecida1" });
  assert.equal(sinPermiso.status, 403);

  const direccion = await sesion("direccion");
  const propio = await UserModel.findOne({ where: { email: emailDe("direccion") } });
  const res = await request(app)
    .put(`/api/users/${propio.id}/password`)
    .set("Cookie", direccion)
    .send({ nueva: "Restablecida1" });
  assert.equal(res.status, 400);
});
