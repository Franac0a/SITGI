import { Router } from "express";
import {
  obtenerAlertas,
  exportarInventarioCsv,
  exportarMovimientosCsv,
  obtenerRotacion,
  obtenerResumen,
} from "../controllers/reporte.controller.js";
import { verificarAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarAuth);

router.get("/alertas", obtenerAlertas);
router.get("/resumen", obtenerResumen);
router.get("/export", exportarInventarioCsv);
router.get("/movimientos/export", exportarMovimientosCsv);
router.get("/rotacion", obtenerRotacion);

export default router;
