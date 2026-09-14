import { Router } from "express";
import {
  registrarMovimiento,
  obtenerHistorialPorItem,
  obtenerMovimientos,
} from "../controllers/movimiento.controller.js";
import { verificarAuth, verificarRol } from "../middlewares/auth.middleware.js";

const router = Router();

// Protegemos todas las rutas con el middleware de autenticación
router.use(verificarAuth);

// Listado general de movimientos
router.get("/", obtenerMovimientos);

// Ruta para ver el historial de un ítem específico (ideal para mostrar en una tabla al hacer clic en un producto)
router.get("/historial/:itemId", obtenerHistorialPorItem);

// Ruta para registrar un nuevo ingreso, egreso o ajuste de stock
router.post(
  "/",
  verificarRol("Administración", "Inventario", "Dirección"),
  registrarMovimiento,
);

export default router;
