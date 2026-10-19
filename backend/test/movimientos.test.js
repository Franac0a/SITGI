import { test, before } from "node:test";
import assert from "node:assert/strict";
import { request, app, prepararBase, sesion, crearItem, stockDe, sinConcurrencia } from "./helpers.js";
import { Item } from "../src/models/Item.model.js";
import { Movimiento } from "../src/models/Movimiento.model.js";

let cookie;

before(async () => {
  await prepararBase();
  cookie = await sesion("inventario");
});

const registrar = (datos, c = cookie) =>
  request(app).post("/api/movimientos").set("Cookie", c).send(datos);

for (const [tipo, esperado] of [
  ["Ingreso", 15],
  ["Reposición", 15],
  ["Egreso", 5],
  ["Reparación", 5],
  ["Baja", 5],
]) {
  test(`${tipo} de 5 sobre stock 10 deja ${esperado}`, async () => {
    const item = await crearItem();
    const res = await registrar({ itemId: item.id, tipo_movimiento: tipo, cantidad: 5, sector: "Laboratorio 1" });

    assert.equal(res.status, 201, res.body.mensaje);
    assert.equal(Number(res.body.nuevo_stock), esperado);
    assert.equal(await stockDe(item.id), esperado);
    assert.equal(res.body.movimiento.sector, "Laboratorio 1");
  });
}

test("ajuste fija el stock contado y deja la diferencia en observaciones", async () => {
  const item = await crearItem();
  const res = await registrar({ itemId: item.id, tipo_movimiento: "Ajuste", cantidad: 7, observaciones: "Conteo mensual" });

  assert.equal(res.status, 201);
  assert.equal(await stockDe(item.id), 7);
  assert.match(res.body.movimiento.observaciones, /10 → 7\. Conteo mensual/);

  const aCero = await registrar({ itemId: item.id, tipo_movimiento: "Ajuste", cantidad: 0 });
  assert.equal(aCero.status, 201);
  assert.equal(await stockDe(item.id), 0);
});

test("cambio de ubicación mueve el ítem sin tocar el stock", async () => {
  const item = await crearItem();
  const res = await registrar({ itemId: item.id, tipo_movimiento: "Cambio de ubicación", nueva_ubicacion: "Heladera 2" });

  assert.equal(res.status, 201, res.body.mensaje);
  assert.equal(await stockDe(item.id), 10);
  assert.equal((await Item.findByPk(item.id)).ubicacion, "Heladera 2");
  assert.equal(res.body.movimiento.origen_destino, "Estante A → Heladera 2");
  assert.equal(Number(res.body.movimiento.cantidad), 10);
});

test("cambio de ubicación sin destino da 400", async () => {
  const item = await crearItem();
  const res = await registrar({ itemId: item.id, tipo_movimiento: "Cambio de ubicación" });
  assert.equal(res.status, 400);
  assert.equal((await Item.findByPk(item.id)).ubicacion, "Estante A");
});

test("stock insuficiente da 400 y no registra nada", async () => {
  const item = await crearItem({ stock_actual: 3 });
  for (const tipo of ["Egreso", "Reparación", "Baja"]) {
    const res = await registrar({ itemId: item.id, tipo_movimiento: tipo, cantidad: 4 });
    assert.equal(res.status, 400, tipo);
    assert.match(res.body.mensaje, /Stock insuficiente/);
  }
  assert.equal(await stockDe(item.id), 3);
  assert.equal(await Movimiento.count({ where: { itemId: item.id } }), 0);
});

test("datos inválidos", async () => {
  const item = await crearItem();
  const casos = [
    [{ itemId: item.id, tipo_movimiento: "Robo", cantidad: 1 }, 400],
    [{ itemId: item.id, tipo_movimiento: "Egreso", cantidad: 0 }, 400],
    [{ itemId: item.id, tipo_movimiento: "Ingreso", cantidad: -2 }, 400],
    [{ itemId: item.id, tipo_movimiento: "Ingreso", cantidad: "abc" }, 400],
    [{ itemId: 99999, tipo_movimiento: "Ingreso", cantidad: 1 }, 404],
  ];
  for (const [datos, status] of casos) {
    const res = await registrar(datos);
    assert.equal(res.status, status, JSON.stringify(datos));
  }
  assert.equal(await stockDe(item.id), 10);
});

test("el responsable sale de la sesión, no del cliente", async () => {
  const item = await crearItem();
  const res = await registrar({ itemId: item.id, tipo_movimiento: "Ingreso", cantidad: 1, responsable: "Otra persona" });
  assert.equal(res.body.movimiento.responsable, "Usuario Inventario");
});

test("egresos simultáneos no dejan el stock negativo", { skip: sinConcurrencia }, async () => {
  const item = await crearItem();
  const respuestas = await Promise.all(
    Array.from({ length: 15 }, () => registrar({ itemId: item.id, tipo_movimiento: "Egreso", cantidad: 1 })),
  );
  const ok = respuestas.filter((r) => r.status === 201).length;
  assert.equal(ok, 10);
  assert.equal(await stockDe(item.id), 0);
  assert.equal(await Movimiento.count({ where: { itemId: item.id } }), 10);
});

test("historial y filtros de movimientos", async () => {
  const item = await crearItem();
  await registrar({ itemId: item.id, tipo_movimiento: "Ingreso", cantidad: 2, sector: "Bioquímica" });
  await registrar({ itemId: item.id, tipo_movimiento: "Egreso", cantidad: 1, sector: "Microbiología" });

  const historial = await request(app).get(`/api/movimientos/historial/${item.id}`).set("Cookie", cookie);
  assert.equal(historial.body.length, 2);

  const egresos = await request(app)
    .get(`/api/movimientos?itemId=${item.id}&tipo=Egreso`)
    .set("Cookie", cookie);
  assert.equal(egresos.body.length, 1);

  const porSector = await request(app)
    .get(`/api/movimientos?itemId=${item.id}&sector=bioq`)
    .set("Cookie", cookie);
  assert.equal(porSector.body.length, 1);
});
