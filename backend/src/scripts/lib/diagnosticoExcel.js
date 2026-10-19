import XLSX from "xlsx";

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
    const iso = `${anio}-${mes}-${dia}`;
    // Descarta fechas imposibles del Excel (día 0, 31/02...) que MySQL rechaza.
    const d = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) return null;
    return iso;
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

/** Lee el Excel de diagnóstico y devuelve las muestras. No toca la base. */
export function leerDiagnosticoExcel(ruta) {
  const libro = XLSX.readFile(ruta);
  const hojas = libro.SheetNames;
  const muestras = [];
  const avisos = [];

  for (const conf of hojasConfig) {
    if (!hojas.includes(conf.nombre)) {
      avisos.push(`Hoja no encontrada: ${conf.nombre}`);
      continue;
    }
    const filas = XLSX.utils.sheet_to_json(libro.Sheets[conf.nombre], {
      header: 1,
      raw: true,
      defval: "",
    });
    let cantidad = 0;
    for (let i = conf.headerSkip; i < filas.length; i++) {
      const m = mapearFila(conf, filas[i]);
      if (m) {
        muestras.push(m);
        cantidad++;
      }
    }
    avisos.push(`${conf.nombre} (${conf.tipo}): ${cantidad} muestras`);
  }
  return { muestras, avisos };
}
