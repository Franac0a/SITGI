import { apiClient, API_BASE_URL } from '@/services/api/client'
import type { ReporteAlerta, ResumenReporte } from '@/types/scientific.types'

interface AlertasResponse {
  total?: number
  alertas?: ReporteAlerta[]
}

export async function getAlertas(): Promise<ReporteAlerta[]> {
  const response = await apiClient<ReporteAlerta[] | AlertasResponse>(
    '/reportes/alertas',
    { method: 'GET' },
  )

  if (Array.isArray(response)) {
    return response
  }

  if (response && Array.isArray(response.alertas)) {
    return response.alertas
  }

  return []
}

export async function getResumen(): Promise<ResumenReporte> {
  return apiClient<ResumenReporte>('/reportes/resumen', { method: 'GET' })
}

export async function exportInventarioCsv(): Promise<void> {
  const token = localStorage.getItem('sitgi_token')
  const headers: Record<string, string> = { Accept: 'text/csv' }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/reportes/export`, {
    method: 'GET',
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('No se pudo exportar el inventario.')
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'inventario.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
