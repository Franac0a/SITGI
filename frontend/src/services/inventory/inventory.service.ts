import { apiClient } from '@/services/api/client'
import type { CreateInventoryItemPayload, InventoryItem } from '@/types/scientific.types'

interface ItemsResponse {
  total?: number
  items?: InventoryItem[]
}

export async function createInventoryItem(
  payload: CreateInventoryItemPayload,
): Promise<{ mensaje?: string; item?: InventoryItem }> {
  const body = {
    ...payload,
    categoria: payload.tipo,
    stock_actual: payload.cantidadInicial,
    stock_minimo: payload.stockMinimo ?? 5,
    unidad_medida: payload.unidadMedida,
    ubicacion: payload.laboratorioUbicacion,
  }

  return apiClient<{ mensaje?: string; item?: InventoryItem }>('/items', {
    method: 'POST',
    body,
  })
}

export async function getInventoryItems(params?: {
  categoria?: string
  ubicacion?: string
  stock_bajo?: boolean
  busqueda?: string
}): Promise<InventoryItem[]> {
  const searchParams = new URLSearchParams()
  if (params?.categoria) searchParams.append('categoria', params.categoria)
  if (params?.ubicacion) searchParams.append('ubicacion', params.ubicacion)
  if (params?.stock_bajo) searchParams.append('stock_bajo', 'true')
  if (params?.busqueda) searchParams.append('busqueda', params.busqueda)

  const query = searchParams.toString()
  const endpoint = query ? `/items?${query}` : '/items'

  const response = await apiClient<InventoryItem[] | ItemsResponse>(endpoint, {
    method: 'GET',
  })

  if (Array.isArray(response)) {
    return response
  }

  if (response && Array.isArray(response.items)) {
    return response.items
  }

  return []
}

export async function getInventoryItemById(
  id: string | number,
): Promise<InventoryItem> {
  return apiClient<InventoryItem>(`/items/${id}`, {
    method: 'GET',
  })
}

export async function updateInventoryItem(
  id: string | number,
  payload: Partial<CreateInventoryItemPayload>,
): Promise<{ mensaje?: string; item?: InventoryItem }> {
  const body: Record<string, unknown> = { ...payload }
  if (payload.tipo !== undefined) body.categoria = payload.tipo
  if (payload.cantidadInicial !== undefined) {
    body.stock_actual = payload.cantidadInicial
  }
  if (payload.stockMinimo !== undefined) body.stock_minimo = payload.stockMinimo
  if (payload.unidadMedida !== undefined) {
    body.unidad_medida = payload.unidadMedida
  }
  if (payload.laboratorioUbicacion !== undefined) {
    body.ubicacion = payload.laboratorioUbicacion
  }

  return apiClient<{ mensaje?: string; item?: InventoryItem }>(`/items/${id}`, {
    method: 'PUT',
    body,
  })
}

export async function deleteInventoryItem(
  id: string | number,
): Promise<{ mensaje?: string }> {
  return apiClient<{ mensaje?: string }>(`/items/${id}`, {
    method: 'DELETE',
  })
}
