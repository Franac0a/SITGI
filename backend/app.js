import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { startDB, sequelize } from "./src/config/db.js";

import authRoutes from "./src/routes/auth.routes.js";
import itemRoutes from "./src/routes/item.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import movimientoRoutes from "./src/routes/movimiento.routes.js";
import { MovimientoModel } from "./src/models/Movimiento.model.js";

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

app.listen(PORT, () => {
  console.log(
    ` Servidor del CIT Formosa ejecutándose en http://localhost:${PORT}`,
  );
});

export default app;
