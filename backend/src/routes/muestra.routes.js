import { Router } from "express";
import {
  obtenerMuestras,
  obtenerResumenMuestras,
  registrarMuestra,
  cargarResultado,
} from "../controllers/muestra.controller.js";
import { verificarAuth, verificarRol } from "../middlewares/auth.middleware.js";
import { ROLES_GESTION, ROLES_SOLO_EGRESO } from "../utils/permisos.js";

const router = Router();

router.use(verificarAuth);

// Registran muestras y resultados quienes trabajan en el laboratorio:
// gestión, investigadores y técnicos/becarios.
const ROLES_LABORATORIO = [...ROLES_GESTION, ...ROLES_SOLO_EGRESO];

router.get("/resumen", obtenerResumenMuestras);
router.get("/", obtenerMuestras);
router.post("/", verificarRol(...ROLES_LABORATORIO), registrarMuestra);
router.put("/:id/resultado", verificarRol(...ROLES_LABORATORIO), cargarResultado);

export default router;
