import { Router } from "express";
import {
  obtenerSectores,
  crearSector,
  actualizarSector,
  eliminarSector,
} from "../controllers/sector.controller.js";
import { verificarAuth, verificarRol } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarAuth);

router.get("/", obtenerSectores);
router.post(
  "/",
  verificarRol("Administración", "Inventario", "Dirección"),
  crearSector,
);
router.put(
  "/:id",
  verificarRol("Administración", "Inventario", "Dirección"),
  actualizarSector,
);
router.delete(
  "/:id",
  verificarRol("Administración", "Inventario", "Dirección"),
  eliminarSector,
);

export default router;
