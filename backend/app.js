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

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
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
