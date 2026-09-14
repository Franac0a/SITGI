import { apiClient } from '@/services/api/client'
import type { Muestra } from '@/types/scientific.types'

const BASE = '/muestras'

export async function getMuestras(tipo?: string): Promise<Muestra[]> {
  const query = tipo ? `?tipo=${encodeURIComponent(tipo)}` : ''
  return apiClient<Muestra[]>(`${BASE}${query}`, {
    method: 'GET',
  })
}

export interface ResumenMuestras {
  total: number
  porTipo: {
    tipo: string
    cantidad: number
    positivos: number | null
    negativos: number | null
  }[]
}

export async function getResumenMuestras(): Promise<ResumenMuestras> {
  return apiClient<ResumenMuestras>(`${BASE}/resumen`, {
    method: 'GET',
  })
}
