// Carga los datos iniciales desde backend/seed/*.json.
// Se puede correr las veces que haga falta sin duplicar datos.
import { startDB, sequelize } from "../config/db.js";
import "../models/Item.model.js";
import "../models/Muestra.model.js";
import "../models/User.model.js";
import {
  leerJsonSeed,
  cargarItems,
  cargarMuestrasSiVacio,
  asegurarDirector,
} from "../seed/cargar.js";

const main = async () => {
  await startDB();
  await sequelize.sync();

  const director = await asegurarDirector();
  console.log(
    director.creado
      ? `Usuario Dirección creado: ${director.email}`
      : `Usuario Dirección ya existía: ${director.email}`,
  );
  if (director.passwordGenerada) {
    console.log(
      `Contraseña generada (anotala, no se vuelve a mostrar): ${director.passwordGenerada}`,
    );
  }

  const items = leerJsonSeed("items.json");
  if (items) {
    const r = await cargarItems(items);
    console.log(`Inventario: ${r.nuevos} nuevos de ${r.total} en el seed.`);
  } else {
    console.log("No hay seed/items.json, se omite el inventario.");
  }

  const muestras = leerJsonSeed("muestras.json");
  if (muestras) {
    const r = await cargarMuestrasSiVacio(muestras);
    console.log(
      r.omitido
        ? "Muestras: la tabla ya tiene datos, se omite."
        : `Muestras: ${r.nuevas} cargadas.`,
    );
  } else {
    console.log("No hay seed/muestras.json, se omiten las muestras.");
  }

  await sequelize.close();
};

main().catch((e) => {
  console.error("Error en el seed:", e);
  process.exit(1);
});
