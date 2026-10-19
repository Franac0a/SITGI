import { test, before } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { request, app, prepararBase, sesion, CLAVE, emailDe } from "./helpers.js";
import { UserModel } from "../src/models/User.model.js";

before(prepararBase);

test("login correcto deja el token en una cookie httpOnly", async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: emailDe("direccion"), password: CLAVE });

  assert.equal(res.status, 200);
  assert.equal(res.body.usuario.rol, "Dirección");
  assert.equal(res.body.usuario.password, undefined);
  assert.equal(res.body.token, undefined);
  const cookie = res.headers["set-cookie"][0];
  assert.match(cookie, /^token=/);
  assert.match(cookie, /HttpOnly/i);
});

test("/auth/me devuelve el usuario de la cookie y no acepta Bearer", async () => {
  const cookie = await sesion("inventario");
  const me = await request(app).get("/api/auth/me").set("Cookie", cookie);
  assert.equal(me.status, 200);
  assert.equal(me.body.usuario.rol, "Inventario");

  const token = cookie.replace("token=", "");
  const bearer = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
  assert.equal(bearer.status, 401);
});

test("login con contraseña incorrecta o usuario inexistente da 401", async () => {
  const mal = await request(app)
    .post("/api/auth/login")
    .send({ email: emailDe("direccion"), password: "otra-clave" });
  const inexistente = await request(app)
    .post("/api/auth/login")
    .send({ email: "nadie@test.local", password: CLAVE });

  assert.equal(mal.status, 401);
  assert.equal(inexistente.status, 401);
  assert.equal(mal.body.mensaje, inexistente.body.mensaje);
});

test("login sin datos da 400", async () => {
  const res = await request(app).post("/api/auth/login").send({});
  assert.equal(res.status, 400);
});

test("un usuario registrado queda pendiente y no puede entrar", async () => {
  const reg = await request(app).post("/api/auth/register").send({
    dni: "99999999",
    nombre: "Nuevo Usuario",
    email: "nuevo@test.local",
    password: "ClaveLarga1",
  });
  assert.equal(reg.status, 201);
  assert.equal(reg.body.usuario.estado, "pendiente");
  assert.equal(reg.body.usuario.rol, "Investigador");

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email: "nuevo@test.local", password: "ClaveLarga1" });
  assert.equal(login.status, 403);
});

test("rutas protegidas sin sesión o con token inválido", async () => {
  const sinToken = await request(app).get("/api/items");
  assert.equal(sinToken.status, 401);

  const invalido = await request(app).get("/api/items").set("Cookie", "token=basura");
  assert.equal(invalido.status, 403);

  const otraClave = jwt.sign({ id: 1 }, "otra-clave");
  const firmadoMal = await request(app).get("/api/items").set("Cookie", `token=${otraClave}`);
  assert.equal(firmadoMal.status, 403);
});

test("la cookie de sesión da acceso y el logout la borra", async () => {
  const cookie = await sesion("investigador");
  const ok = await request(app).get("/api/items").set("Cookie", cookie);
  assert.equal(ok.status, 200);

  const logout = await request(app).post("/api/auth/logout").set("Cookie", cookie);
  assert.equal(logout.status, 200);
  assert.match(logout.headers["set-cookie"][0], /token=;/);
});

test("un usuario dado de baja pierde el acceso aunque tenga sesión", async () => {
  const cookie = await sesion("tecnico");
  await UserModel.update({ estado: "rechazado" }, { where: { email: emailDe("tecnico") } });
  const res = await request(app).get("/api/items").set("Cookie", cookie);
  assert.equal(res.status, 403);
});
