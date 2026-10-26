import { pedirApi } from '@/servicios/api'
import type { DatosItem, Item } from '@/tipos'

export async function obtenerItems(): Promise<Item[]> {
  const respuesta = await pedirApi<{ items: Item[] }>('/items')
  return respuesta.items
}

export function obtenerItem(id: string): Promise<Item> {
  return pedirApi<Item>(`/items/${id}`)
}

export function crearItem(datos: DatosItem) {
  return pedirApi('/items', 'POST', datos)
}

export function actualizarItem(id: string, datos: DatosItem) {
  return pedirApi(`/items/${id}`, 'PUT', datos)
}

export function eliminarItem(id: number) {
  return pedirApi(`/items/${id}`, 'DELETE')
}
