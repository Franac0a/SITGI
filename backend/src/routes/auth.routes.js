import { Router } from "express";
import {
  registrarUsuario,
  loginUsuario,
  logoutUsuario,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registrarUsuario);
router.post("/login", loginUsuario);
router.post("/logout", logoutUsuario);

export default router;
