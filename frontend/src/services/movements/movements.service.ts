import { apiClient } from '@/services/api/client'
import type {
  Movimiento,
  MovimientoFiltros,
  RegisterMovementPayload,
} from '@/types/scientific.types'

const MOVEMENTS_BASE = '/movimientos'

export async function getMovements(
  filtros: MovimientoFiltros = {},
): Promise<Movimiento[]> {
  const params = new URLSearchParams()
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor) params.set(clave, valor)
  })
  const query = params.toString()
  return apiClient<Movimiento[]>(`${MOVEMENTS_BASE}${query ? `?${query}` : ''}`, {
    method: 'GET',
  })
}

export async function registerMovement(
  payload: RegisterMovementPayload,
): Promise<{
  mensaje?: string
  movimiento?: Movimiento
  nuevo_stock?: number
  ubicacion?: string
}> {
  return apiClient<{
    mensaje?: string
    movimiento?: Movimiento
    nuevo_stock?: number
    ubicacion?: string
  }>(MOVEMENTS_BASE, {
    method: 'POST',
    body: payload,
  })
}

export async function getMovementHistory(
  itemId: string | number,
): Promise<Movimiento[]> {
  return apiClient<Movimiento[]>(`${MOVEMENTS_BASE}/historial/${itemId}`, {
    method: 'GET',
  })
}
