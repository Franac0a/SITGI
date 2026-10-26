import type { Item } from '@/tipos'

// Si el ítem no tiene código cargado, se arma uno con su id.
export function codigoDe(item: Item): string {
  return item.codigo_identificacion || `CIT-${item.id}`
}

// Nombres para mostrar de los datos técnicos que trae el Excel del CIT.
const NOMBRES_DATOS: Record<string, string> = {
  letra: 'Letra (droguero)',
  tipo: 'Tipo',
  nInventario: 'N° de inventario',
  modelo: 'Modelo',
  nSerie: 'N° de serie',
  criticidad: 'Criticidad',
  enLineaEnsayos: 'En línea de ensayos',
  origen: 'Origen',
  pfi: 'PFI',
  costo: 'Costo',
  proveedor: 'Proveedor',
}

// Estos ya se muestran aparte en el detalle del ítem.
const YA_MOSTRADOS = ['codigoCas', 'fechaVencimiento', 'numeroLote', 'observaciones']

// Devuelve los otros datos técnicos del ítem que tienen valor, con un nombre legible.
// Si aparece uno que no está en la lista, se muestra con su nombre tal cual.
export function otrosDatosTecnicos(item: Item): { titulo: string; valor: string }[] {
  return Object.entries(item.detalles_tecnicos ?? {})
    .filter(([clave, valor]) => !YA_MOSTRADOS.includes(clave) && valor)
    .map(([clave, valor]) => ({ titulo: NOMBRES_DATOS[clave] ?? clave, valor: sinComillas(String(valor)) }))
}

// En el Excel algunos valores vienen entre comillas, como la letra del droguero ("A").
function sinComillas(texto: string): string {
  return texto.replace(/^"(.*)"$/, '$1')
}

export type EstadoStock = 'agotado' | 'bajo' | 'disponible'

// Agotado: no queda nada. Bajo: queda algo pero llegó al mínimo. Si no, disponible.
export function estadoDeStock(item: Item): EstadoStock {
  if (item.stock_actual <= 0) return 'agotado'
  if (item.stock_minimo > 0 && item.stock_actual <= item.stock_minimo) return 'bajo'
  return 'disponible'
}
