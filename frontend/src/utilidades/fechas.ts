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

// Fecha de hoy como "2026-10-26", el formato de los <input type="date">.
// Se arma con la hora local para que no cambie de día por la zona horaria.
export function fechaDeHoy(): string {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}
