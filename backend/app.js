import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { startDB, sequelize } from "./src/config/db.js";

// Importación de enrutadores usando nuestra notación por punto
import authRoutes from "./src/routes/auth.routes.js";
import itemRoutes from "./src/routes/item.routes.js";
import userRoutes from "./src/routes/user.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 1. Middlewares Globales y Seguridad
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Puertos habituales de desarrollo frontend
    credentials: true, // ¡CRÍTICO! Permite al navegador enviar y recibir la cookie del token
  }),
);
app.use(express.json()); // Para poder leer el body en formato JSON
app.use(cookieParser()); // Habilita la lectura de req.cookies en los middlewares

// 2. Conexión a MySQL y Sincronización de Modelos
const inicializarBaseDeDatos = async () => {
  try {
    await startDB(); // Ejecuta tu función de prueba de conexión

    // Sincroniza los modelos con la base de datos (crea las tablas si no existen)
    // Nota: En desarrollo puedes usar { alter: true } si modificas columnas en el futuro
    await sequelize.sync();
    console.log(
      "Modelos y tablas sincronizados correctamente en la base de datos.",
    );
  } catch (error) {
    console.error("Error crítico al inicializar la base de datos:", error);
  }
};

inicializarBaseDeDatos();

// 3. Rutas Principales del Sistema CIT
app.use("/api/auth", authRoutes); // Rutas de registro, login y logout
app.use("/api/items", itemRoutes); // CRUD del inventario y reactivos
app.use("/api/users", userRoutes); // Panel exclusivo para la Dirección del CIT

// 4. Puesta en marcha del servidor
app.listen(PORT, () => {
  console.log(
    `🚀 Servidor del CIT Formosa ejecutándose en http://localhost:${PORT}`,
  );
});

export default app;
