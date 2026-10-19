import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    dialect: process.env.DB_DIALECT,
    // Solo para SQLite (los tests usan ":memory:").
    storage: process.env.DB_STORAGE,
    logging: process.env.NODE_ENV === "test" ? false : console.log,
  },
);

export const startDB = async () => {
  try {
    await sequelize.authenticate();

    console.log("Conexión a la base de datos establecida correctamente.");
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    throw error;
  }
};
