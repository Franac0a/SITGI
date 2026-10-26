import { test, before } from "node:test";
import assert from "node:assert/strict";
import { request, app, prepararBase, sesion, crearItem, stockDe } from "./helpers.js";
import { Movimiento } from "../src/models/Movimiento.model.js";

let cookie;

before(async () => {
  await prepararBase();
  cookie = await sesion("inventario");
});

test("editar un ítem no cambia el stock: eso solo se hace con un movimiento", async () => {
  const item = await crearItem();
  const res = await request(app)
    .put(`/api/items/${item.id}`)
    .set("Cookie", cookie)
    .send({ marca: "Merck", stock_actual: 999, cantidadInicial: 999 });

  assert.equal(res.status, 200, res.body.mensaje);
  assert.equal(res.body.item.marca, "Merck");
  assert.equal(await stockDe(item.id), 10);
  assert.equal(await Movimiento.count({ where: { itemId: item.id } }), 0);
});
