import type { Item } from '@/tipos'

// Si el ítem no tiene código cargado, se arma uno con su id.
export function codigoDe(item: Item): string {
  return item.codigo_identificacion || `CIT-${item.id}`
}

export type EstadoStock = 'agotado' | 'bajo' | 'disponible'

// Agotado: no queda nada. Bajo: queda algo pero llegó al mínimo. Si no, disponible.
export function estadoDeStock(item: Item): EstadoStock {
  if (item.stock_actual <= 0) return 'agotado'
  if (item.stock_minimo > 0 && item.stock_actual <= item.stock_minimo) return 'bajo'
  return 'disponible'
}
