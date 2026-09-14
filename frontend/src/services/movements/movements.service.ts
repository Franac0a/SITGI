import { apiClient } from '@/services/api/client'
import type {
  Movimiento,
  RegisterMovementPayload,
} from '@/types/scientific.types'

const MOVEMENTS_BASE = '/movimientos'

export async function getMovements(): Promise<Movimiento[]> {
  return apiClient<Movimiento[]>(MOVEMENTS_BASE, {
    method: 'GET',
  })
}

export async function registerMovement(
  payload: RegisterMovementPayload,
): Promise<{ mensaje?: string; movimiento?: Movimiento; nuevo_stock?: number }> {
  return apiClient<{
    mensaje?: string
    movimiento?: Movimiento
    nuevo_stock?: number
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
