import { Router } from "express";
import {
  obtenerUsuarios,
  gestionarEstadoUsuario,
  restablecerPassword,
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
router.put("/:id/password", restablecerPassword);

export default router;
