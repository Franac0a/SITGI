import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import itemRoutes from "./routes/item.routes.js";
import userRoutes from "./routes/user.routes.js";
import movimientoRoutes from "./routes/movimiento.routes.js";
import sectorRoutes from "./routes/sector.routes.js";
import pedidoRoutes from "./routes/pedido.routes.js";
import residuoRoutes from "./routes/residuo.routes.js";
import reporteRoutes from "./routes/reporte.routes.js";
import documentoRoutes from "./routes/documento.routes.js";
import muestraRoutes from "./routes/muestra.routes.js";
import notificacionRoutes from "./routes/notificacion.routes.js";
import proyectoRoutes from "./routes/proyecto.routes.js";
import "./models/Item.model.js";
import "./models/Movimiento.model.js";
import "./models/Sector.model.js";
import "./models/Pedido.model.js";
import "./models/Residuo.model.js";
import "./models/Documento.model.js";
import "./models/Muestra.model.js";
import "./models/Notificacion.model.js";
import "./models/Proyecto.model.js";

dotenv.config();

const app = express();

const FRONTEND_URLS = (process.env.FRONTEND_URLS || "")
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  ...FRONTEND_URLS,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requests sin origin (Postman, curl) y cualquier IP de red local
      // (ej: http://192.168.x.x:5173) para trabajar con base compartida en LAN.
      if (
        !origin ||
        ALLOWED_ORIGINS.includes(origin) ||
        /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin) ||
        /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origen no permitido: ${origin}`));
      }
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Límite de intentos en login/registro para frenar fuerza bruta.
const limitadorAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: "Demasiados intentos. Probá de nuevo en unos minutos." },
});
app.use("/api/auth/login", limitadorAuth);
app.use("/api/auth/register", limitadorAuth);

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/movimientos", movimientoRoutes);
app.use("/api/sectores", sectorRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/residuos", residuoRoutes);
app.use("/api/reportes", reporteRoutes);
app.use("/api/documentos", documentoRoutes);
app.use("/api/muestras", muestraRoutes);
app.use("/api/notificaciones", notificacionRoutes);
app.use("/api/proyectos", proyectoRoutes);

// Manejo central de errores (por ejemplo, archivo no permitido en uploads)
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const esErrorDeCarga = err?.name === "MulterError" || /archivo/i.test(err?.message || "");
  res.status(esErrorDeCarga ? 400 : 500).json({
    mensaje: err?.message || "Error interno del servidor.",
  });
});

export default app;
