import XLSX from "xlsx";
import { startDB, sequelize } from "../config/db.js";
import { Item } from "../models/Item.model.js";

const RUTA_DEFECTO = "C:\\Users\\facun\\Desktop\\inventario cit formosa.xlsx";
const ruta = process.argv[2] || RUTA_DEFECTO;

const str = (v) => (v === null || v === undefined ? "" : String(v).trim());
const num = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isNaN(n) ? null : n;
};

// Cada hoja -> { categoria, layout, headerSkip }
const configuracionHojas = [
  { nombre: "HERRAMIENTAS", categoria: "Herramientas", layout: "A", headerSkip: 1 },
  { nombre: "area brucelosis", categoria: "Brucelosis", layout: "Equipos", headerSkip: 6 },
  { nombre: "material de vidrio e insumos-LG", categoria: "Vidrio e Insumos", layout: "ATipo", headerSkip: 1 },
  { nombre: "DROGUERO", categoria: "Droguero", layout: "Droguero", headerSkip: 1 },
  { nombre: "BIOLOGIA MOLECULAR", categoria: "Biología Molecular", layout: "A", headerSkip: 1 },
  { nombre: "L. HEMOPARÁSITOS", categoria: "Hemoparásitos", layout: "Hemop", headerSkip: 1 },
  { nombre: "Bovinos insumos", categoria: "Bovinos Insumos", layout: "Insumos", headerSkip: 1 },
  { nombre: "Galpon bovinos-adquisiones", categoria: "Bovinos Adquisiciones", layout: "Adquisiciones", headerSkip: 1 },
  { nombre: "INTA", categoria: "INTA", layout: "INTA", headerSkip: 1 },
  { nombre: "TRIQUINELOSIS", categoria: "Triquinelosis", layout: "ATipo", headerSkip: 1 },
];

function mapearFila(hoja, fila) {
  const { layout } = hoja;

  let nombre = "";
  let codigo = "";
  let marca = "";
  let unidad = "";
  let ubicacion = "";
  let stock = 0;
  const detalles = {};

  switch (layout) {
    case "A": {
      codigo = str(fila[1]);
      nombre = str(fila[2]);
      unidad = str(fila[3]) || "Unidad";
      ubicacion = str(fila[7]);
      const stk = num(fila[6]);
      stock = stk !== null ? stk : (num(fila[4]) ?? 0) - (num(fila[5]) ?? 0);
      break;
    }
    case "ATipo": {
      codigo = str(fila[1]);
      nombre = str(fila[2]);
      unidad = str(fila[4]) || "Unidad";
      ubicacion = str(fila[8]);
      const stk = num(fila[7]);
      stock = stk !== null ? stk : (num(fila[5]) ?? 0) - (num(fila[6]) ?? 0);
      if (str(fila[3])) detalles.tipo = str(fila[3]);
      break;
    }
    case "Droguero": {
      codigo = str(fila[1]);
      nombre = str(fila[3]);
      marca = str(fila[4]);
      unidad = str(fila[5]) || "Unidad";
      ubicacion = str(fila[7]) || "Droguero";
      stock = num(fila[6]) ?? 0;
      if (str(fila[2])) detalles.letra = str(fila[2]);
      break;
    }
    case "Equipos": {
      codigo = str(fila[0]);
      nombre = str(fila[1]);
      marca = str(fila[3]);
      ubicacion = str(fila[7]) || "Lab Brucelosis";
      unidad = "Unidad";
      stock = 1;
      if (str(fila[2])) detalles.nInventario = str(fila[2]);
      if (str(fila[4])) detalles.modelo = str(fila[4]);
      if (str(fila[5])) detalles.nSerie = str(fila[5]);
      if (str(fila[9])) detalles.criticidad = str(fila[9]);
      if (str(fila[10])) detalles.enLineaEnsayos = str(fila[10]);
      break;
    }
    case "Hemop": {
      codigo = str(fila[1]);
      nombre = str(fila[2]);
      ubicacion = str(fila[7]);
      unidad = "Unidad";
      stock = 1;
      if (str(fila[3])) detalles.tipo = str(fila[3]);
      if (str(fila[8])) detalles.origen = str(fila[8]);
      if (str(fila[9])) detalles.pfi = str(fila[9]);
      break;
    }
    case "Insumos": {
      nombre = str(fila[1]);
      ubicacion = "Bovinos";
      unidad = "Unidad";
      stock = num(fila[2]) ?? 0;
      if (str(fila[3])) detalles.costo = str(fila[3]);
      if (str(fila[4])) detalles.observaciones = str(fila[4]);
      if (str(fila[5])) detalles.proveedor = str(fila[5]);
      break;
    }
    case "Adquisiciones": {
      nombre = str(fila[1]);
      ubicacion = "Galpón Bovinos";
      unidad = "Unidad";
      stock = num(fila[2]) ?? 0;
      if (str(fila[3])) detalles.costo = str(fila[3]);
      if (str(fila[4])) detalles.observaciones = str(fila[4]);
      break;
    }
    case "INTA": {
      codigo = str(fila[1]);
      nombre = str(fila[2]);
      unidad = "Unidad";
      const extra = fila.slice(3).map(str).filter(Boolean);
      ubicacion = extra.join(" / ");
      break;
    }
    default:
      return null;
  }

  if (!nombre) return null;

  return {
    codigo,
    nombre,
    categoria: hoja.categoria,
    marca: marca || null,
    stock_actual: stock,
    stock_minimo: 0,
    unidad_medida: unidad,
    ubicacion: ubicacion || "Sin asignar",
    detalles_tecnicos: detalles,
  };
}

const importar = async () => {
  await startDB();
  await sequelize.sync();

  const libro = XLSX.readFile(ruta);
  const hojas = libro.SheetNames;

  const codigosUsados = new Set();
  const resolverCodigo = (raw, prefijo, contador) => {
    if (raw && !codigosUsados.has(raw)) {
      codigosUsados.add(raw);
      return raw;
    }
    let c = `CIT-${prefijo}-${String(contador).padStart(4, "0")}`;
    while (codigosUsados.has(c)) {
      c = `CIT-${prefijo}-${String(contador).padStart(4, "0")}-${Math.random().toString(36).slice(2, 5)}`;
    }
    codigosUsados.add(c);
    return c;
  };

  let contador = 1;
  let total = 0;
  const resumen = [];

  for (const conf of configuracionHojas) {
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

    const prefijo = conf.categoria
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 3)
      .toUpperCase();

    const items = [];
    for (let i = conf.headerSkip; i < filas.length; i++) {
      const item = mapearFila(conf, filas[i]);
      if (!item) continue;
      const rawCodigo = item.codigo;
      delete item.codigo;
      item.codigo_identificacion = resolverCodigo(rawCodigo, prefijo, contador);
      items.push(item);
      contador++;
    }

    if (items.length === 0) {
      console.log(`ℹ️  ${conf.nombre}: sin filas con datos.`);
      continue;
    }

    await Item.bulkCreate(items, { ignoreDuplicates: true });
    total += items.length;
    resumen.push(`${conf.nombre} (${conf.categoria}): ${items.length}`);
    console.log(`✔  ${conf.nombre} -> ${items.length} ítems`);
  }

  console.log("------------------------------------------");
  console.log(`Resumen de importación:`);
  for (const r of resumen) console.log(`  - ${r}`);
  console.log(`Total: ${total} ítems procesados.`);
  process.exit(0);
};

importar().catch((error) => {
  console.error("❌ Error durante la importación:", error);
  process.exit(1);
});
