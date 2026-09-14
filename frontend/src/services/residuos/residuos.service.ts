import { apiClient } from '@/services/api/client'
import type { RegisterResiduoPayload, Residuo } from '@/types/scientific.types'

const BASE = '/residuos'

export async function getResiduos(): Promise<Residuo[]> {
  return apiClient<Residuo[]>(BASE, {
    method: 'GET',
  })
}

export async function createResiduo(
  payload: RegisterResiduoPayload,
): Promise<{ mensaje?: string; residuo?: Residuo }> {
  return apiClient<{ mensaje?: string; residuo?: Residuo }>(BASE, {
    method: 'POST',
    body: payload,
  })
}

export async function updateResiduo(
  id: string | number,
  payload: Partial<RegisterResiduoPayload> & { estado?: string },
): Promise<{ mensaje?: string; residuo?: Residuo }> {
  return apiClient<{ mensaje?: string; residuo?: Residuo }>(`${BASE}/${id}`, {
    method: 'PUT',
    body: payload,
  })
}
