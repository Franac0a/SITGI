import { apiClient } from '@/services/api/client'
import type { CreateInventoryItemPayload, InventoryItem } from '@/types/scientific.types'

export async function createInventoryItem(
  payload: CreateInventoryItemPayload,
): Promise<{ mensaje?: string; item?: InventoryItem }> {
  return apiClient<{ mensaje?: string; item?: InventoryItem }>('/inventory/items', {
    method: 'POST',
    body: payload,
  })
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  return apiClient<InventoryItem[]>('/inventory/items', {
    method: 'GET',
  })
}
