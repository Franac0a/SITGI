import { pedirApi } from '@/servicios/api'
import type { Notificacion } from '@/tipos'

export async function obtenerNotificaciones(): Promise<Notificacion[]> {
  const respuesta = await pedirApi<{ notificaciones: Notificacion[] }>('/notificaciones')
  return respuesta.notificaciones
}

export function marcarTodasLeidas() {
  return pedirApi('/notificaciones/leer-todas', 'PUT')
}
