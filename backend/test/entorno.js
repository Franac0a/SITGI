// Se carga antes de cada archivo de test.
// npm test: SQLite en memoria, no necesita Docker ni toca la base de desarrollo.
// npm run test:mysql: MySQL de Docker, siempre sobre la base citproyecto_test.
import dotenv from "dotenv";

process.env.NODE_ENV = "test";
process.env.DOTENV_CONFIG_QUIET = "true";
process.env.JWT_SECRET = "secreto-solo-para-tests";

if (process.env.TEST_DB === "mysql") {
  dotenv.config({ quiet: true });
  process.env.DB_DIALECT = "mysql";
  // Los tests borran las tablas: nunca se corren sobre la base real.
  process.env.DB_NAME = process.env.TEST_DB_NAME || "citproyecto_test";
} else {
  process.env.DB_DIALECT = "sqlite";
  process.env.DB_STORAGE = ":memory:";
}
