import { Router } from "express";
import {
  obtenerAlertas,
  exportarInventarioCsv,
  exportarMovimientosCsv,
  obtenerRotacion,
  obtenerResumen,
  obtenerConsumoPorSector,
} from "../controllers/reporte.controller.js";
import { verificarAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarAuth);

router.get("/alertas", obtenerAlertas);
router.get("/resumen", obtenerResumen);
router.get("/export", exportarInventarioCsv);
router.get("/movimientos/export", exportarMovimientosCsv);
router.get("/rotacion", obtenerRotacion);
router.get("/consumo-sector", obtenerConsumoPorSector);

export default router;
