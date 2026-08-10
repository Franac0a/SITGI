import { Router } from "express";
import {
  obtenerItems,
  obtenerItemPorId,
  crearItem,
  actualizarItem,
  eliminarItem,
  obtenerItemsEliminados,
  restaurarItem,
} from "../controllers/item.controller.js";
import { verificarAuth, verificarRol } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarAuth);

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
