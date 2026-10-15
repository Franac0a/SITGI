import { Router } from "express";
import {
  registrarMovimiento,
  obtenerHistorialPorItem,
  obtenerMovimientos,
} from "../controllers/movimiento.controller.js";
import { verificarAuth, verificarRol } from "../middlewares/auth.middleware.js";
import { ROLES_GESTION, ROLES_SOLO_EGRESO } from "../utils/permisos.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarAuth);

// Listado general de movimientos
router.get("/", obtenerMovimientos);

// Historial de un ítem
router.get("/historial/:itemId", obtenerHistorialPorItem);

// Registrar un movimiento
// Gestión: todos los tipos. Investigador y Técnico/Becario: solo egresos
// (la restricción por tipo se valida en el controlador).
router.post(
  "/",
  verificarRol(...ROLES_GESTION, ...ROLES_SOLO_EGRESO),
  registrarMovimiento,
);

export default router;
