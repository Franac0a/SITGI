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

// Blindaje de seguridad: solo la Dirección del CIT puede acceder a estas rutas
router.use(verificarAuth);
router.use(soloDireccion);

// 1. Obtener lista de usuarios (Soporta query para ver pendientes: /api/users?estado=pendiente)
router.get("/", obtenerUsuarios);

// 2. Aprobar, rechazar o cambiar el rol de un usuario
router.put("/:id/estado", gestionarEstadoUsuario);

export default router;
