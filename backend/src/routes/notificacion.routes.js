import { Router } from "express";
import {
  obtenerNotificaciones,
  marcarTodasLeidas,
} from "../controllers/notificacion.controller.js";
import { verificarAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarAuth);

router.get("/", obtenerNotificaciones);
router.put("/leer-todas", marcarTodasLeidas);

export default router;
