import { armarConsulta, pedirApi } from '@/servicios/api'
import type { DatosMovimiento, FiltrosMovimientos, Movimiento } from '@/tipos'

export function obtenerMovimientos(filtros: FiltrosMovimientos): Promise<Movimiento[]> {
  return pedirApi<Movimiento[]>(`/movimientos${armarConsulta(filtros)}`)
}

export function registrarMovimiento(datos: DatosMovimiento) {
  return pedirApi<{ mensaje: string }>('/movimientos', 'POST', datos)
}

export function obtenerHistorial(itemId: number): Promise<Movimiento[]> {
  return pedirApi<Movimiento[]>(`/movimientos/historial/${itemId}`)
}
