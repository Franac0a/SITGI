import { Router } from "express";
import {
  registrarMovimiento,
  obtenerHistorial,
} from "../controllers/movimiento.controller.js";
import { verificarAuth, verificarRol } from "../middlewares/auth.middleware.js";

const router = Router();

// Todo requiere estar logueado con cuenta activa
router.use(verificarAuth);

router.get("/", obtenerHistorial);

router.post(
  "/",
  verificarRol("Administración", "Inventario", "Investigador", "Dirección"),
  registrarMovimiento,
);

export default router;
