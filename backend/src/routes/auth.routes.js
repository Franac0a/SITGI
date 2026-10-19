import { Router } from "express";
import {
  registrarUsuario,
  loginUsuario,
  logoutUsuario,
  usuarioActual,
} from "../controllers/auth.controller.js";
import { verificarAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registrarUsuario);
router.post("/login", loginUsuario);
router.post("/logout", logoutUsuario);
router.get("/me", verificarAuth, usuarioActual);

export default router;
