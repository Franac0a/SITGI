import { apiClient, API_BASE_URL } from '@/services/api/client'
import type {
  ReporteAlerta,
  ReporteFiltros,
  ResumenReporte,
  RotacionResponse,
} from '@/types/scientific.types'

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

function buildQuery(filtros: Record<string, string | undefined>): string {
  const params = new URLSearchParams()
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor) params.set(clave, valor)
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}

async function downloadCsv(
  endpoint: string,
  fileName: string,
  errorMessage: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: { Accept: 'text/csv' },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(errorMessage)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Inventario filtrado por categoría y/o sector (ubicación). */
export function exportInventarioCsv(filtros: ReporteFiltros = {}): Promise<void> {
  return downloadCsv(
    `/reportes/export${buildQuery({ categoria: filtros.categoria, sector: filtros.sector })}`,
    'inventario.csv',
    'No se pudo exportar el inventario.',
  )
}

/** Movimientos filtrados por categoría, sector y período. */
export function exportMovimientosCsv(filtros: ReporteFiltros = {}): Promise<void> {
  return downloadCsv(
    `/reportes/movimientos/export${buildQuery({ ...filtros })}`,
    'movimientos.csv',
    'No se pudieron exportar los movimientos.',
  )
}

export async function getRotacion(dias = 30): Promise<RotacionResponse> {
  return apiClient<RotacionResponse>(`/reportes/rotacion?dias=${dias}`, {
    method: 'GET',
  })
}
