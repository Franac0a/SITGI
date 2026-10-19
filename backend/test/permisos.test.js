import { test, before } from "node:test";
import assert from "node:assert/strict";
import { request, app, prepararBase, sesiones, crearItem, USUARIOS } from "./helpers.js";
import { TIPOS_MOVIMIENTO, puedeRegistrarTipo } from "../src/utils/permisos.js";

let cookies;
let item;

before(async () => {
  await prepararBase();
  cookies = await sesiones();
  item = await crearItem({ stock_actual: 1000 });
});

const GESTION = ["direccion", "administracion", "inventario"];
const SOLO_EGRESO = ["investigador", "tecnico"];

const datosDe = (tipo) => ({
  itemId: item.id,
  tipo_movimiento: tipo,
  cantidad: tipo === "Ajuste" ? 1000 : 1,
  nueva_ubicacion: tipo === "Cambio de ubicación" ? "Estante B" : undefined,
});

test("gestión puede registrar todos los tipos de movimiento", async () => {
  for (const quien of GESTION) {
    for (const tipo of TIPOS_MOVIMIENTO) {
      const res = await request(app)
        .post("/api/movimientos")
        .set("Cookie", cookies[quien])
        .send(datosDe(tipo));
      assert.equal(res.status, 201, `${quien} / ${tipo}: ${res.body.mensaje}`);
    }
  }
});

test("investigador y técnico solo registran egresos", async () => {
  for (const quien of SOLO_EGRESO) {
    for (const tipo of TIPOS_MOVIMIENTO) {
      const res = await request(app)
        .post("/api/movimientos")
        .set("Cookie", cookies[quien])
        .send(datosDe(tipo));
      assert.equal(res.status, tipo === "Egreso" ? 201 : 403, `${quien} / ${tipo}`);
    }
  }
});

test("responsable de área no registra movimientos pero consulta el stock", async () => {
  const mov = await request(app)
    .post("/api/movimientos")
    .set("Cookie", cookies.responsable)
    .send(datosDe("Egreso"));
  assert.equal(mov.status, 403);

  const items = await request(app).get("/api/items").set("Cookie", cookies.responsable);
  assert.equal(items.status, 200);
});

test("puedeRegistrarTipo coincide con la tabla de roles", () => {
  assert.equal(puedeRegistrarTipo("Inventario", "Baja"), true);
  assert.equal(puedeRegistrarTipo("Técnico/Becario", "Egreso"), true);
  assert.equal(puedeRegistrarTipo("Técnico/Becario", "Ingreso"), false);
  assert.equal(puedeRegistrarTipo("Responsable de área", "Egreso"), false);
  assert.equal(puedeRegistrarTipo("Rol inventado", "Egreso"), false);
});

test("alta de ítems solo para gestión", async () => {
  for (const quien of Object.keys(cookies)) {
    const res = await request(app)
      .post("/api/items")
      .set("Cookie", cookies[quien])
      .send({ nombre: `Item de ${quien}`, categoria: "Droguero" });
    assert.equal(res.status, GESTION.includes(quien) ? 201 : 403, quien);
  }
});

test("gestión de usuarios solo para Dirección", async () => {
  for (const quien of Object.keys(cookies)) {
    const res = await request(app).get("/api/users").set("Cookie", cookies[quien]);
    assert.equal(res.status, quien === "direccion" ? 200 : 403, quien);
  }
});

test("cualquiera crea pedidos pero solo gestión cambia su estado", async () => {
  for (const quien of Object.keys(cookies)) {
    const pedido = await request(app)
      .post("/api/pedidos")
      .set("Cookie", cookies[quien])
      .send({ item_nombre: "Guantes", cantidad: 1 });
    assert.equal(pedido.status, 201, quien);
    assert.equal(pedido.body.pedido.responsable, `Usuario ${USUARIOS[quien]}`);

    const estado = await request(app)
      .put(`/api/pedidos/${pedido.body.pedido.id}/estado`)
      .set("Cookie", cookies[quien])
      .send({ estado: "Aprobado" });
    assert.equal(estado.status, GESTION.includes(quien) ? 200 : 403, quien);
  }
});
