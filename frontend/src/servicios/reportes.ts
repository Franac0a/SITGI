import { armarConsulta, pedirApi, URL_API } from '@/servicios/api'
import type { Alerta, FilaRotacion, FiltrosReporte, Resumen } from '@/tipos'

export async function obtenerAlertas(): Promise<Alerta[]> {
  const respuesta = await pedirApi<{ alertas: Alerta[] }>('/reportes/alertas')
  return respuesta.alertas
}

export function obtenerResumen(): Promise<Resumen> {
  return pedirApi<Resumen>('/reportes/resumen')
}

// Elementos con más consumo en los últimos "dias".
export async function obtenerRotacion(dias: number): Promise<FilaRotacion[]> {
  const respuesta = await pedirApi<{ rotacion: FilaRotacion[] }>(`/reportes/rotacion?dias=${dias}`)
  return respuesta.rotacion
}

// Descarga un CSV del backend y lo guarda como archivo en la computadora.
async function descargarCsv(ruta: string, nombreArchivo: string, mensajeError: string) {
  const respuesta = await fetch(URL_API + ruta, {
    headers: { Accept: 'text/csv' },
    credentials: 'include',
  })
  if (!respuesta.ok) {
    throw new Error(mensajeError)
  }

  const archivo = await respuesta.blob()
  const url = URL.createObjectURL(archivo)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}

// El inventario se filtra por categoría y sector; el período solo aplica a los movimientos.
export function exportarInventario(filtros: FiltrosReporte) {
  const consulta = armarConsulta({ categoria: filtros.categoria, sector: filtros.sector })
  return descargarCsv(`/reportes/export${consulta}`, 'inventario.csv', 'No se pudo exportar el inventario.')
}

export function exportarMovimientos(filtros: FiltrosReporte) {
  return descargarCsv(
    `/reportes/movimientos/export${armarConsulta(filtros)}`,
    'movimientos.csv',
    'No se pudieron exportar los movimientos.',
  )
}
