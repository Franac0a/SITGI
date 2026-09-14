import { apiClient } from '@/services/api/client'
import type { Sector } from '@/types/scientific.types'

const BASE = '/sectores'

export interface CreateSectorPayload {
  nombre: string
  tipo: string
  descripcion?: string
}

export async function getSectores(): Promise<Sector[]> {
  return apiClient<Sector[]>(BASE, {
    method: 'GET',
  })
}

export async function createSector(
  payload: CreateSectorPayload,
): Promise<{ mensaje?: string; sector?: Sector }> {
  return apiClient<{ mensaje?: string; sector?: Sector }>(BASE, {
    method: 'POST',
    body: payload,
  })
}

export async function deleteSector(
  id: string | number,
): Promise<{ mensaje?: string }> {
  return apiClient<{ mensaje?: string }>(`${BASE}/${id}`, {
    method: 'DELETE',
  })
}
