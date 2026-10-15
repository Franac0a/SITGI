// Convierte los Excel en los JSON de backend/seed/.
// Uso: npm run seed:export -- <inventario.xlsx> <diagnostico.xlsx>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { leerInventarioExcel } from "./lib/inventarioExcel.js";
import { leerDiagnosticoExcel } from "./lib/diagnosticoExcel.js";

const DIR_SEED = fileURLToPath(new URL("../../seed", import.meta.url));

const [rutaInventario, rutaDiagnostico] = process.argv.slice(2);

if (!rutaInventario && !rutaDiagnostico) {
  console.error(
    "Uso: npm run seed:export -- <inventario.xlsx> [diagnostico.xlsx]",
  );
  process.exit(1);
}

fs.mkdirSync(DIR_SEED, { recursive: true });

if (rutaInventario) {
  const { items, avisos } = leerInventarioExcel(rutaInventario);
  fs.writeFileSync(
    path.join(DIR_SEED, "items.json"),
    JSON.stringify(items, null, 2),
  );
  avisos.forEach((a) => console.log("  -", a));
  console.log(`seed/items.json: ${items.length} ítems`);
}

if (rutaDiagnostico) {
  const { muestras, avisos } = leerDiagnosticoExcel(rutaDiagnostico);
  fs.writeFileSync(
    path.join(DIR_SEED, "muestras.json"),
    JSON.stringify(muestras, null, 2),
  );
  avisos.forEach((a) => console.log("  -", a));
  console.log(`seed/muestras.json: ${muestras.length} muestras`);
}
