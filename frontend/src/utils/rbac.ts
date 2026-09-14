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
