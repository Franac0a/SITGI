import { Router } from "express";
import {
  obtenerAlertas,
  exportarInventarioCsv,
  obtenerResumen,
} from "../controllers/reporte.controller.js";
import { verificarAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarAuth);

router.get("/alertas", obtenerAlertas);
router.get("/resumen", obtenerResumen);
router.get("/export", exportarInventarioCsv);

export default router;
