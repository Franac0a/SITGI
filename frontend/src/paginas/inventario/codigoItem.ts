import type { Item } from '@/tipos'

// Si el ítem no tiene código cargado, se arma uno con su id.
export function codigoDe(item: Item): string {
  return item.codigo_identificacion || `CIT-${item.id}`
}
