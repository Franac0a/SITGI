import { test, before } from "node:test";
import assert from "node:assert/strict";
import { request, app, prepararBase, sesion, crearItem } from "./helpers.js";
import { Movimiento } from "../src/models/Movimiento.model.js";
import { Sector } from "../src/models/Sector.model.js";

let cookie;

before(async () => {
  await prepararBase();
  cookie = await sesion("inventario");
});

const api = (metodo, ruta, datos) =>
  request(app)[metodo](`/api${ruta}`).set("Cookie", cookie).send(datos);

test("movimientos, pedidos y residuos solo aceptan sectores cargados", async () => {
  const item = await crearItem();
  const mensaje = /El sector indicado no existe/;

  const movimiento = await api("post", "/movimientos", {
    itemId: item.id,
    tipo_movimiento: "Egreso",
    cantidad: 1,
    sector: "Lab. Molecular",
  });
  assert.equal(movimiento.status, 400);
  assert.match(movimiento.body.mensaje, mensaje);

  const pedido = await api("post", "/pedidos", { item_nombre: "Tubos", cantidad: 1, sector: "No existe" });
  assert.equal(pedido.status, 400);

  const residuo = await api("post", "/residuos", { descripcion: "Bolsas rojas", sector: "No existe" });
  assert.equal(residuo.status, 400);

  // Sin sector sigue estando permitido, y con un sector cargado también.
  const sinSector = await api("post", "/pedidos", { item_nombre: "Tubos", cantidad: 1 });
  assert.equal(sinSector.status, 201);
  const conSector = await api("post", "/residuos", { descripcion: "Bidón", sector: "  Lab 2 " });
  assert.equal(conSector.status, 201);
  assert.equal(conSector.body.residuo.sector, "Lab 2");
});

test("renombrar un sector actualiza los registros que lo usaban", async () => {
  const sector = await Sector.create({ nombre: "Heladera vieja" });
  const item = await crearItem();
  await api("post", "/movimientos", {
    itemId: item.id,
    tipo_movimiento: "Egreso",
    cantidad: 1,
    sector: "Heladera vieja",
  });

  const res = await api("put", `/sectores/${sector.id}`, { nombre: "Heladera 2" });
  assert.equal(res.status, 200);
  assert.equal(await Movimiento.count({ where: { sector: "Heladera vieja" } }), 0);
  assert.equal(await Movimiento.count({ where: { sector: "Heladera 2" } }), 1);
});

test("no se puede eliminar un sector con registros asociados", async () => {
  const enUso = await Sector.findOne({ where: { nombre: "Heladera 2" } });
  const res = await api("delete", `/sectores/${enUso.id}`);
  assert.equal(res.status, 409);
  assert.ok(await Sector.findByPk(enUso.id));

  const libre = await Sector.create({ nombre: "Sin usar" });
  const borrado = await api("delete", `/sectores/${libre.id}`);
  assert.equal(borrado.status, 200);
});

test("consumo por sector cuenta los consumos del período agrupados por sector", async () => {
  const item = await crearItem({ stock_actual: 50 });
  const otro = await crearItem({ stock_actual: 50 });
  for (const [itemId, sector] of [
    [item.id, "Bioquímica"],
    [otro.id, "Bioquímica"],
    [item.id, "Microbiología"],
  ]) {
    await api("post", "/movimientos", { itemId, tipo_movimiento: "Egreso", cantidad: 1, sector });
  }
  // Un ingreso no es consumo: no tiene que contar.
  await api("post", "/movimientos", { itemId: item.id, tipo_movimiento: "Ingreso", cantidad: 5, sector: "Bioquímica" });

  const res = await api("get", "/reportes/consumo-sector?dias=30");
  assert.equal(res.status, 200);
  const bioquimica = res.body.sectores.find((s) => s.sector === "Bioquímica");
  assert.deepEqual(bioquimica, { sector: "Bioquímica", consumos: 2, elementos: 2 });
  const micro = res.body.sectores.find((s) => s.sector === "Microbiología");
  assert.deepEqual(micro, { sector: "Microbiología", consumos: 1, elementos: 1 });
});
