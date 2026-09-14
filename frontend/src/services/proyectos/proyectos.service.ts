import { apiClient } from '@/services/api/client'
import type { Proyecto } from '@/types/scientific.types'

const BASE = '/proyectos'

export interface ProyectoPayload {
  codigo?: string
  titulo: string
  descripcion?: string
  director?: string
  estado?: string
  fecha_inicio?: string
  fecha_fin?: string
}

export async function getProyectos(): Promise<Proyecto[]> {
  return apiClient<Proyecto[]>(BASE, {
    method: 'GET',
  })
}

export async function createProyecto(
  payload: ProyectoPayload,
): Promise<{ mensaje?: string; proyecto?: Proyecto }> {
  return apiClient<{ mensaje?: string; proyecto?: Proyecto }>(BASE, {
    method: 'POST',
    body: payload,
  })
}

export async function updateProyecto(
  id: string | number,
  payload: Partial<ProyectoPayload>,
): Promise<{ mensaje?: string; proyecto?: Proyecto }> {
  return apiClient<{ mensaje?: string; proyecto?: Proyecto }>(`${BASE}/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteProyecto(
  id: string | number,
): Promise<{ mensaje?: string }> {
  return apiClient<{ mensaje?: string }>(`${BASE}/${id}`, {
    method: 'DELETE',
  })
}
