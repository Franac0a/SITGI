// Pasa una fecha del backend ("2026-10-25") a "25/10/2026".
// Se arma separando el texto y no con new Date(), porque new Date("2026-10-25")
// la toma como hora UTC y en Argentina mostraría el día anterior.
export function formatearFecha(fecha?: string | null): string {
  if (!fecha) return '—'
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha)
  if (!partes) return fecha
  const [, anio, mes, dia] = partes
  return `${dia}/${mes}/${anio}`
}
