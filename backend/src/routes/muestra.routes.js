import { Router } from "express";
import {
  obtenerMuestras,
  obtenerResumenMuestras,
} from "../controllers/muestra.controller.js";
import { verificarAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarAuth);

router.get("/resumen", obtenerResumenMuestras);
router.get("/", obtenerMuestras);

export default router;
