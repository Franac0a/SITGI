import { apiClient } from '@/services/api/client'
import type { Pedido, RegisterPedidoPayload } from '@/types/scientific.types'

const BASE = '/pedidos'

export async function getPedidos(): Promise<Pedido[]> {
  return apiClient<Pedido[]>(BASE, {
    method: 'GET',
  })
}

export async function createPedido(
  payload: RegisterPedidoPayload,
): Promise<{ mensaje?: string; pedido?: Pedido }> {
  return apiClient<{ mensaje?: string; pedido?: Pedido }>(BASE, {
    method: 'POST',
    body: payload,
  })
}

export async function updatePedidoEstado(
  id: string | number,
  estado: string,
): Promise<{ mensaje?: string; pedido?: Pedido }> {
  return apiClient<{ mensaje?: string; pedido?: Pedido }>(`${BASE}/${id}/estado`, {
    method: 'PUT',
    body: { estado },
  })
}
