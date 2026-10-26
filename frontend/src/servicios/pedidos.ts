import { pedirApi } from '@/servicios/api'
import type { DatosPedido, EstadoPedido, Pedido } from '@/tipos'

export function obtenerPedidos(): Promise<Pedido[]> {
  return pedirApi<Pedido[]>('/pedidos')
}

export function crearPedido(datos: DatosPedido) {
  return pedirApi('/pedidos', 'POST', datos)
}

// Para pasar a "Ingresado" hay que indicar a qué ítem del inventario suma el stock,
// salvo que el pedido ya esté vinculado a uno.
export function cambiarEstadoPedido(id: number, estado: EstadoPedido, itemId?: number) {
  const datos = itemId ? { estado, itemId } : { estado }
  return pedirApi<{ mensaje: string; nuevo_stock: number }>(`/pedidos/${id}/estado`, 'PUT', datos)
}
