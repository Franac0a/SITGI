import type { MovementType } from '@/types/scientific.types'

const normalizar = (role?: string | null): string =>
  (role ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

/** Todos los tipos de movimiento, en el orden en que se muestran. */
export const MOVEMENT_TYPES_ALL: MovementType[] = [
  'Ingreso',
  'Egreso',
  'Reposición',
  'Baja',
  'Ajuste',
  'Reparación',
  'Cambio de ubicación',
]

/** Investigador y Técnico/Becario registran "usos permitidos": solo consumos. */
function isConsumptionOnlyRole(role?: string | null): boolean {
  const r = normalizar(role)
  return r === 'investigador' || r === 'tecnico/becario'
}

/** Tipos de movimiento que el rol puede registrar (espeja la regla del backend). */
export function allowedMovementTypes(role?: string | null): MovementType[] {
  if (canCreateInventory(role)) return MOVEMENT_TYPES_ALL
  if (isConsumptionOnlyRole(role)) return ['Egreso']
  return []
}

export function canRegisterMovements(role?: string | null): boolean {
  return allowedMovementTypes(role).length > 0
}

export function canCreateInventory(role?: string | null): boolean {
  if (!role) return false
  const normalized = role.toLowerCase().trim()
  return (
    normalized === 'dirección' ||
    normalized === 'direccion' ||
    normalized === 'administración' ||
    normalized === 'administracion' ||
    normalized === 'inventario'
  )
}

export function canManageUsers(role?: string | null): boolean {
  if (!role) return false
  const normalized = role.toLowerCase().trim()
  return (
    normalized === 'dirección' ||
    normalized === 'direccion' ||
    normalized === 'administración' ||
    normalized === 'administracion'
  )
}
