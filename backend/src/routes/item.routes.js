import { Router } from "express";
import {
  obtenerItems,
  obtenerItemPorId,
  crearItem,
  actualizarItem,
  eliminarItem,
  obtenerItemsEliminados, // <-- 1. Agregamos el import nuevo
  restaurarItem, // <-- 2. Agregamos el import nuevo
} from "../controllers/item.controller.js";
import { verificarAuth, verificarRol } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas del inventario requieren que el usuario haya iniciado sesión y esté "activo"
router.use(verificarAuth);

// -------------------------------------------------------------------------
// RUTAS DE TRAZABILIDAD (Van ARRIBA para que no choquen con /:id)
// -------------------------------------------------------------------------
router.get("/trazabilidad/borrados", obtenerItemsEliminados);
router.put(
  "/trazabilidad/restaurar/:id",
  verificarRol("Administración", "Inventario"),
  restaurarItem,
);

// -------------------------------------------------------------------------
// RUTAS GENERALES DEL INVENTARIO
// -------------------------------------------------------------------------
router.get("/", obtenerItems);
router.get("/:id", obtenerItemPorId);
router.post("/", verificarRol("Administración", "Inventario"), crearItem);
router.put(
  "/:id",
  verificarRol("Administración", "Inventario"),
  actualizarItem,
);
router.delete(
  "/:id",
  verificarRol("Administración", "Inventario"),
  eliminarItem,
);

export default router;
