import { Router } from "express";
import {
  obtenerUsuarios,
  gestionarEstadoUsuario,
} from "../controllers/user.controller.js";
import {
  verificarAuth,
  soloDireccion,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarAuth);
router.use(soloDireccion);

router.get("/", obtenerUsuarios);

router.put("/:id/estado", gestionarEstadoUsuario);

export default router;
