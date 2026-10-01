import { Router } from "express";
import {
  obtenerPedidos,
  crearPedido,
  actualizarEstadoPedido,
} from "../controllers/pedido.controller.js";
import { verificarAuth, verificarRol } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarAuth);

router.get("/", obtenerPedidos);
router.post("/", crearPedido);
router.put(
  "/:id/estado",
  verificarRol("Administración", "Inventario", "Dirección"),
  actualizarEstadoPedido,
);

export default router;
