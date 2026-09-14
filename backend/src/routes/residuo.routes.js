import { Router } from "express";
import {
  obtenerResiduos,
  crearResiduo,
  actualizarResiduo,
} from "../controllers/residuo.controller.js";
import { verificarAuth, verificarRol } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarAuth);

router.get("/", obtenerResiduos);
router.post(
  "/",
  verificarRol("Administración", "Inventario", "Dirección"),
  crearResiduo,
);
router.put(
  "/:id",
  verificarRol("Administración", "Inventario", "Dirección"),
  actualizarResiduo,
);

export default router;
