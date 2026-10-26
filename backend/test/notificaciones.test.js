import { test, before } from "node:test";
import assert from "node:assert/strict";
import { request, app, prepararBase, sesion, crearItem, sinConcurrencia } from "./helpers.js";
import { Notificacion } from "../src/models/Notificacion.model.js";

let cookie;

before(async () => {
  await prepararBase();
  cookie = await sesion("inventario");
});

const egreso = (itemId, cantidad) =>
  request(app)
    .post("/api/movimientos")
    .set("Cookie", cookie)
    .send({ itemId, tipo_movimiento: "Egreso", cantidad });
const avisosDe = (itemId) => Notificacion.count({ where: { itemId } });

test("el egreso que deja el stock en el mínimo crea un aviso, sin duplicarlo", async () => {
  const item = await crearItem({ stock_actual: 10, stock_minimo: 3 });

  await egreso(item.id, 5);
  assert.equal(await avisosDe(item.id), 0);

  await egreso(item.id, 2);
  assert.equal(await avisosDe(item.id), 1);
  const aviso = await Notificacion.findOne({ where: { itemId: item.id } });
  assert.equal(aviso.tipo, "warning");
  assert.match(aviso.mensaje, /quedó en 3 .*mínimo 3/);

  await egreso(item.id, 1);
  assert.equal(await avisosDe(item.id), 1);
});

test("un egreso rechazado o un ítem sin mínimo no generan avisos", async () => {
  const conMinimo = await crearItem({ stock_actual: 2, stock_minimo: 1 });
  const res = await egreso(conMinimo.id, 5);
  assert.equal(res.status, 400);
  assert.equal(await avisosDe(conMinimo.id), 0);

  const sinMinimo = await crearItem({ stock_actual: 2, stock_minimo: 0 });
  await egreso(sinMinimo.id, 2);
  assert.equal(await avisosDe(sinMinimo.id), 0);
});

test("consultar las notificaciones no crea avisos", async () => {
  const item = await crearItem({ stock_actual: 0, stock_minimo: 5 });
  const res = await request(app).get("/api/notificaciones").set("Cookie", cookie);
  assert.equal(res.status, 200);
  assert.equal(await avisosDe(item.id), 0);
});

test("marcar como leídas es por usuario: al resto le siguen apareciendo", async () => {
  const item = await crearItem({ stock_actual: 4, stock_minimo: 3 });
  await egreso(item.id, 1);
  const direccion = await sesion("direccion");
  const notificacionesDe = (c) => request(app).get("/api/notificaciones").set("Cookie", c);

  await request(app).put("/api/notificaciones/leer-todas").set("Cookie", cookie);

  const propias = await notificacionesDe(cookie);
  assert.equal(propias.body.total, 0);
  assert.ok(propias.body.notificaciones.every((n) => n.leida));

  const deOtro = await notificacionesDe(direccion);
  assert.ok(deOtro.body.total > 0);
  const aviso = deOtro.body.notificaciones.find((n) => n.itemId === item.id);
  assert.equal(aviso.leida, false);
});

test("el aviso no se repite hasta que el stock se repone y vuelve a bajar", async () => {
  const item = await crearItem({ stock_actual: 4, stock_minimo: 3 });
  const movimiento = (tipo_movimiento, cantidad) =>
    request(app)
      .post("/api/movimientos")
      .set("Cookie", cookie)
      .send({ itemId: item.id, tipo_movimiento, cantidad });

  await movimiento("Egreso", 1); // queda en 3: avisa
  await movimiento("Egreso", 1); // queda en 2: sigue el mismo aviso
  assert.equal(await avisosDe(item.id), 1);

  await movimiento("Ingreso", 5); // queda en 7: el aviso deja de estar vigente
  const viejo = await Notificacion.findOne({ where: { itemId: item.id } });
  assert.equal(viejo.resuelta, true);

  await movimiento("Egreso", 5); // vuelve a bajar a 2: aviso nuevo
  assert.equal(await avisosDe(item.id), 2);
});

test("subir el stock mínimo de un ítem por encima de su stock también avisa", async () => {
  const item = await crearItem({ stock_actual: 10, stock_minimo: 3 });
  const res = await request(app)
    .put(`/api/items/${item.id}`)
    .set("Cookie", cookie)
    .send({ stock_minimo: 12 });
  assert.equal(res.status, 200);
  assert.equal(await avisosDe(item.id), 1);
});

test("egresos simultáneos crean un solo aviso", { skip: sinConcurrencia }, async () => {
  const item = await crearItem({ stock_actual: 10, stock_minimo: 8 });
  await Promise.all(Array.from({ length: 6 }, () => egreso(item.id, 1)));
  assert.equal(await avisosDe(item.id), 1);
});
