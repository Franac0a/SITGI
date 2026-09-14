import { apiClient } from '@/services/api/client'
import type { Notificacion } from '@/types/scientific.types'

const BASE = '/notificaciones'

export interface NotificacionesResponse {
  total: number
  notificaciones: Notificacion[]
}

export async function getNotificaciones(): Promise<NotificacionesResponse> {
  return apiClient<NotificacionesResponse>(BASE, {
    method: 'GET',
  })
}

export async function marcarTodasLeidas(): Promise<{ mensaje?: string }> {
  return apiClient<{ mensaje?: string }>(`${BASE}/leer-todas`, {
    method: 'PUT',
  })
}
