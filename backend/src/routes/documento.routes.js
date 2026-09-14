import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import {
  obtenerDocumentos,
  subirDocumento,
  descargarDocumento,
  eliminarDocumento,
} from "../controllers/documento.controller.js";
import { verificarAuth, verificarRol } from "../middlewares/auth.middleware.js";

const dirUploads = path.resolve("uploads");
if (!fs.existsSync(dirUploads)) {
  fs.mkdirSync(dirUploads, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dirUploads),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, "_");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router = Router();

router.use(verificarAuth);

router.get("/", obtenerDocumentos);
router.post("/", upload.single("archivo"), subirDocumento);
router.get("/:id/descargar", descargarDocumento);
router.delete(
  "/:id",
  verificarRol("Administración", "Inventario", "Dirección"),
  eliminarDocumento,
);

export default router;
