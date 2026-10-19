import dotenv from "dotenv";
import app from "./src/app.js";
import { startDB, sequelize } from "./src/config/db.js";
import { verificarEsquema } from "./src/config/esquema.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

// El servidor solo arranca si la base de datos está disponible.
const iniciar = async () => {
  if (!process.env.JWT_SECRET) {
    console.error(
      "Falta JWT_SECRET en backend/.env. Agregá una línea JWT_SECRET=<clave larga y aleatoria> y reiniciá el servidor.",
    );
    process.exit(1);
  }
  try {
    await startDB();
    await sequelize.sync();
    await verificarEsquema();
    console.log(
      "Modelos y tablas sincronizados correctamente en la base de datos.",
    );
    app.listen(PORT, () => {
      console.log(
        ` Servidor del CIT Formosa ejecutándose en http://localhost:${PORT}`,
      );
    });
  } catch (error) {
    console.error("Error crítico al inicializar la base de datos:", error);
    process.exit(1);
  }
};

iniciar();

export default app;
