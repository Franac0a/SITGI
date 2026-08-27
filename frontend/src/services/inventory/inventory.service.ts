import { apiClient } from '@/services/api/client'
import type { CreateInventoryItemPayload, InventoryItem } from '@/types/scientific.types'

interface ItemsResponse {
  total?: number
  items?: InventoryItem[]
}

export async function createInventoryItem(
  payload: CreateInventoryItemPayload,
): Promise<{ mensaje?: string; item?: InventoryItem }> {
  return apiClient<{ mensaje?: string; item?: InventoryItem }>('/items', {
    method: 'POST',
    body: payload,
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
