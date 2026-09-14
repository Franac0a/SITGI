import XLSX from "xlsx";
import { startDB, sequelize } from "../config/db.js";
import { Muestra } from "../models/Muestra.model.js";

const RUTA_DEFECTO = "C:\\Users\\facun\\Desktop\\DIAGNOSTICO 2026- CIT.xlsx";
const ruta = process.argv[2] || RUTA_DEFECTO;

const str = (v) => (v === null || v === undefined ? "" : String(v).trim());

function aFecha(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  if (!Number.isNaN(n) && n > 20000 && n < 80000) {
    const d = new Date(Math.round((n - 25569) * 86400 * 1000));
    return d.toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    const dia = m[1].padStart(2, "0");
    const mes = m[2].padStart(2, "0");
    const anio = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${anio}-${mes}-${dia}`;
  }
  return null;
}

function aInt(v) {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : Math.round(n);
}

// Cada hoja -> { tipo, headerSkip, conSospechosos }
const hojasConfig = [
  { nombre: "Bruce 2026", tipo: "Brucelosis", headerSkip: 7, conSospechosos: true },
  { nombre: "Campy", tipo: "Campilobacteriosis", headerSkip: 6, conSospechosos: false },
  { nombre: "Anemia", tipo: "Anemia Infecciosa Equina", headerSkip: 5, conSospechosos: false },
];

function mapearFila(conf, fila) {
  const col = (i) => str(fila[i]);

  const numeroIngreso = col(1);
  const propietario = col(3);

  if (!numeroIngreso && !propietario) return null;

  const base = {
    tipo: conf.tipo,
    fecha_ingreso: aFecha(fila[0]),
    numero_ingreso: numeroIngreso || null,
    numero_protocolo: col(2) || null,
    propietario: propietario || null,
    renspa: col(4) || null,
    veterinario: col(5) || null,
    establecimiento: col(6) || null,
    ubicacion: col(7) || null,
    departamento: col(8) || null,
    especie: col(9) || null,
    cantidad_muestras: aInt(fila[10]),
  };

  if (conf.conSospechosos) {
    base.positivos = aInt(fila[11]);
    base.sospechosos = aInt(fila[12]);
    base.negativos = aInt(fila[13]);
    base.fecha_resultado = aFecha(fila[14]);
  } else {
    base.positivos = aInt(fila[11]);
    base.sospechosos = 0;
    base.negativos = aInt(fila[12]);
    base.fecha_resultado = aFecha(fila[13]);
  }

  return base;
}

const importar = async () => {
  await startDB();
  await sequelize.sync();

  const libro = XLSX.readFile(ruta);
  const hojas = libro.SheetNames;

  await Muestra.destroy({ where: {}, force: true });

  let total = 0;

  for (const conf of hojasConfig) {
    if (!hojas.includes(conf.nombre)) {
      console.log(`⚠️  Hoja no encontrada: ${conf.nombre}`);
      continue;
    }

    const ws = libro.Sheets[conf.nombre];
    const filas = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      raw: true,
      defval: "",
    });

    const items = [];
    for (let i = conf.headerSkip; i < filas.length; i++) {
      const m = mapearFila(conf, filas[i]);
      if (m) items.push(m);
    }

    if (items.length === 0) {
      console.log(`ℹ️  ${conf.nombre}: sin filas con datos.`);
      continue;
    }

    await Muestra.bulkCreate(items);
    total += items.length;
    console.log(`✔  ${conf.nombre} (${conf.tipo}) -> ${items.length} muestras`);
  }

  console.log("------------------------------------------");
  console.log(`Total: ${total} muestras cargadas.`);
  process.exit(0);
};

importar().catch((error) => {
  console.error("❌ Error durante la importación:", error);
  process.exit(1);
});
