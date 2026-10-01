import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { startDB, sequelize } from "./src/config/db.js";

import authRoutes from "./src/routes/auth.routes.js";
import itemRoutes from "./src/routes/item.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import movimientoRoutes from "./src/routes/movimiento.routes.js";
import sectorRoutes from "./src/routes/sector.routes.js";
import pedidoRoutes from "./src/routes/pedido.routes.js";
import residuoRoutes from "./src/routes/residuo.routes.js";
import reporteRoutes from "./src/routes/reporte.routes.js";
import documentoRoutes from "./src/routes/documento.routes.js";
import muestraRoutes from "./src/routes/muestra.routes.js";
import notificacionRoutes from "./src/routes/notificacion.routes.js";
import proyectoRoutes from "./src/routes/proyecto.routes.js";
import "./src/models/Item.model.js";
import "./src/models/Movimiento.model.js";
import "./src/models/Sector.model.js";
import "./src/models/Pedido.model.js";
import "./src/models/Residuo.model.js";
import "./src/models/Documento.model.js";
import "./src/models/Muestra.model.js";
import "./src/models/Notificacion.model.js";
import "./src/models/Proyecto.model.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const FRONTEND_URLS = (process.env.FRONTEND_URLS || "")
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
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
app.use(express.json());
app.use(cookieParser());

const inicializarBaseDeDatos = async () => {
  try {
    await startDB();

    await sequelize.sync();
    console.log(
      "Modelos y tablas sincronizados correctamente en la base de datos.",
    );
  } catch (error) {
    console.error("Error crítico al inicializar la base de datos:", error);
  }
};

inicializarBaseDeDatos();

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

app.listen(PORT, () => {
  console.log(
    ` Servidor del CIT Formosa ejecutándose en http://localhost:${PORT}`,
  );
});

export default app;
