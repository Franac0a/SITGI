import { test, before } from "node:test";
import assert from "node:assert/strict";
import { request, app, prepararBase, sesion } from "./helpers.js";

let tecnico;

before(async () => {
  await prepararBase();
  tecnico = await sesion("tecnico");
});

const registrar = (datos, cookie = tecnico) =>
  request(app).post("/api/muestras").set("Cookie", cookie).send(datos);

const cargarResultado = (id, datos, cookie = tecnico) =>
  request(app).put(`/api/muestras/${id}/resultado`).set("Cookie", cookie).send(datos);

const muestraValida = {
  tipo: "Brucelosis",
  fecha_ingreso: "2026-10-20",
  numero_ingreso: "101/2026",
  propietario: "Establecimiento de prueba",
  especie: "Bovina",
  cantidad_muestras: 20,
};

test("un técnico registra el ingreso de una muestra, sin resultado todavía", async () => {
  const res = await registrar(muestraValida);
  assert.equal(res.status, 201, res.body.mensaje);
  assert.equal(res.body.muestra.cantidad_muestras, 20);
  assert.equal(res.body.muestra.positivos, 0);
  assert.ok(!res.body.muestra.fecha_resultado);
});

test("sin fecha de ingreso se usa la de hoy", async () => {
  const res = await registrar({ ...muestraValida, fecha_ingreso: "" });
  assert.equal(res.status, 201);
  assert.match(res.body.muestra.fecha_ingreso, /^\d{4}-\d{2}-\d{2}$/);
});

test("valida el tipo y la cantidad", async () => {
  assert.equal((await registrar({ ...muestraValida, tipo: "Otra" })).status, 400);
  assert.equal((await registrar({ ...muestraValida, cantidad_muestras: 0 })).status, 400);
  assert.equal((await registrar({ ...muestraValida, cantidad_muestras: 2.5 })).status, 400);
});

test("responsable de área solo consulta: no registra muestras", async () => {
  const responsable = await sesion("responsable");
  assert.equal((await registrar(muestraValida, responsable)).status, 403);
  const lista = await request(app).get("/api/muestras").set("Cookie", responsable);
  assert.equal(lista.status, 200);
});

test("cargar el resultado de una muestra", async () => {
  const { body } = await registrar(muestraValida);
  const id = body.muestra.id;

  const demasiados = await cargarResultado(id, { positivos: 15, negativos: 10, fecha_resultado: "2026-10-25" });
  assert.equal(demasiados.status, 400);
  assert.match(demasiados.body.mensaje, /no puede superar la cantidad de muestras \(20\)/);

  const sinFecha = await cargarResultado(id, { positivos: 1, negativos: 19 });
  assert.equal(sinFecha.status, 400);

  const antesDelIngreso = await cargarResultado(id, { positivos: 1, negativos: 19, fecha_resultado: "2026-10-01" });
  assert.equal(antesDelIngreso.status, 400);

  const bien = await cargarResultado(id, { positivos: 1, sospechosos: 2, negativos: 17, fecha_resultado: "2026-10-25" });
  assert.equal(bien.status, 200, bien.body.mensaje);
  assert.equal(bien.body.muestra.positivos, 1);
  assert.equal(bien.body.muestra.sospechosos, 2);
  assert.equal(bien.body.muestra.fecha_resultado, "2026-10-25");
});

test("cargar resultado de una muestra que no existe da 404", async () => {
  const res = await cargarResultado(99999, { positivos: 0, negativos: 1, fecha_resultado: "2026-10-25" });
  assert.equal(res.status, 404);
});
