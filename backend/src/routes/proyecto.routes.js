import { Router } from "express";
import {
  obtenerProyectos,
  crearProyecto,
  actualizarProyecto,
  eliminarProyecto,
} from "../controllers/proyecto.controller.js";
import { verificarAuth, verificarRol } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarAuth);

router.get("/", obtenerProyectos);
router.post(
  "/",
  verificarRol("Administración", "Dirección"),
  crearProyecto,
);
router.put(
  "/:id",
  verificarRol("Administración", "Dirección"),
  actualizarProyecto,
);
router.delete(
  "/:id",
  verificarRol("Administración", "Dirección"),
  eliminarProyecto,
);

export default router;
