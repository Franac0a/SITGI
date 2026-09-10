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

// -------------------------------------------------------------------------
// RUTAS DE ACTUALIZACIÓN Y BAJA
// -------------------------------------------------------------------------

export async function updateInventoryItem(
  id: string | number,
  payload: Partial<CreateInventoryItemPayload>,
): Promise<{ mensaje?: string; item?: InventoryItem }> {
  return apiClient<{ mensaje?: string; item?: InventoryItem }>(`/items/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteInventoryItem(
  id: string | number,
): Promise<{ mensaje?: string }> {
  return apiClient<{ mensaje?: string }>(`/items/${id}`, {
    method: 'DELETE',
  })
}

// -------------------------------------------------------------------------
// SECCIÓN DE TRAZABILIDAD (Papelera)
// -------------------------------------------------------------------------

export async function getDeletedItems(): Promise<InventoryItem[]> {
  const response = await apiClient<InventoryItem[] | ItemsResponse>('/items/trazabilidad/borrados', {
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

export async function restoreInventoryItem(
  id: string | number,
): Promise<{ mensaje?: string; item?: InventoryItem }> {
  return apiClient<{ mensaje?: string; item?: InventoryItem }>(`/items/trazabilidad/restaurar/${id}`, {
    method: 'PUT',
  })
}

// -------------------------------------------------------------------------
// SECCIÓN DE MOVIMIENTOS (Historial y Stock)
// -------------------------------------------------------------------------

// Define los tipos rápidos para los movimientos (podés moverlos a scientific.types después)
export interface MovimientoPayload {
  itemId: number | string;
  tipo_movimiento: 'Ingreso' | 'Egreso' | 'Ajuste' | 'Reparación';
  cantidad: number;
  origen_destino?: string;
  costo_unitario?: number;
  responsable: string;
  observaciones?: string;
}

export async function registrarMovimiento(
  payload: MovimientoPayload
): Promise<any> {
  return apiClient<any>('/movimientos', {
    method: 'POST',
    body: payload,
  })
}

export async function getHistorialMovimientos(
  itemId: string | number
): Promise<any[]> {
  return apiClient<any[]>(`/movimientos/historial/${itemId}`, {
    method: 'GET',
  })
}