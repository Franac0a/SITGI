import { test, before } from "node:test";
import assert from "node:assert/strict";
import { request, app, prepararBase, sesion, crearItem, stockDe, sinConcurrencia } from "./helpers.js";
import { Movimiento } from "../src/models/Movimiento.model.js";

let gestion;
let investigador;

before(async () => {
  await prepararBase();
  gestion = await sesion("administracion");
  investigador = await sesion("investigador");
});

const crearPedido = (datos) =>
  request(app).post("/api/pedidos").set("Cookie", investigador).send(datos);
const cambiarEstado = (id, datos) =>
  request(app).put(`/api/pedidos/${id}/estado`).set("Cookie", gestion).send(datos);
const movimientosDelPedido = (id) =>
  Movimiento.count({ where: { origen_destino: `Pedido #${id}` } });

test("ingresar un pedido suma el stock y registra el movimiento una sola vez", async () => {
  const item = await crearItem();
  const { body } = await crearPedido({ itemId: item.id, cantidad: 4, sector: "Lab 2" });
  const id = body.pedido.id;
  assert.equal(body.pedido.item_nombre, "Etanol 96%");

  const aprobado = await cambiarEstado(id, { estado: "Aprobado" });
  assert.equal(aprobado.status, 200);
  assert.equal(await stockDe(item.id), 10);

  const ingreso = await cambiarEstado(id, { estado: "Ingresado" });
  assert.equal(ingreso.status, 200);
  assert.equal(await stockDe(item.id), 14);
  assert.equal(ingreso.body.movimiento.tipo_movimiento, "Ingreso");
  assert.equal(ingreso.body.movimiento.responsable, "Usuario Administración");
  assert.equal(await movimientosDelPedido(id), 1);

  const repetido = await cambiarEstado(id, { estado: "Ingresado" });
  assert.equal(repetido.status, 409);
  const volverAtras = await cambiarEstado(id, { estado: "Pendiente" });
  assert.equal(volverAtras.status, 409);
  assert.equal(await stockDe(item.id), 14);
  assert.equal(await movimientosDelPedido(id), 1);
});

test("un pedido sin ítem se vincula al ingresarlo", async () => {
  const item = await crearItem();
  const { body } = await crearPedido({ item_nombre: "Puntas de pipeta", cantidad: 3 });
  const id = body.pedido.id;

  const sinItem = await cambiarEstado(id, { estado: "Ingresado" });
  assert.equal(sinItem.status, 400);

  const itemInexistente = await cambiarEstado(id, { estado: "Ingresado", itemId: 99999 });
  assert.equal(itemInexistente.status, 404);

  const ok = await cambiarEstado(id, { estado: "Ingresado", itemId: item.id });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.pedido.itemId, item.id);
  assert.equal(await stockDe(item.id), 13);
});

test("ingresos simultáneos del mismo pedido suman una sola vez", { skip: sinConcurrencia }, async () => {
  const item = await crearItem();
  const { body } = await crearPedido({ itemId: item.id, cantidad: 5 });
  const id = body.pedido.id;

  const respuestas = await Promise.all(
    Array.from({ length: 8 }, () => cambiarEstado(id, { estado: "Ingresado" })),
  );
  assert.equal(respuestas.filter((r) => r.status === 200).length, 1);
  assert.equal(respuestas.filter((r) => r.status === 409).length, 7);
  assert.equal(await stockDe(item.id), 15);
  assert.equal(await movimientosDelPedido(id), 1);
});

test("validaciones al crear y actualizar pedidos", async () => {
  assert.equal((await crearPedido({ item_nombre: "X", cantidad: 0 })).status, 400);
  assert.equal((await crearPedido({ cantidad: 2 })).status, 400);
  assert.equal((await crearPedido({ itemId: 99999, cantidad: 2 })).status, 404);
  assert.equal((await cambiarEstado(99999, { estado: "Aprobado" })).status, 404);

  const { body } = await crearPedido({ item_nombre: "Guantes", cantidad: 1 });
  assert.equal((await cambiarEstado(body.pedido.id, { estado: "Cualquiera" })).status, 400);
});
