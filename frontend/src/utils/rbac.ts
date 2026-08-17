export function canCreateInventory(role?: string | null): boolean {
  if (!role) return false
  const normalized = role.toLowerCase().trim()
  return (
    normalized === 'dirección' ||
    normalized === 'direccion' ||
    normalized === 'administración' ||
    normalized === 'administracion' ||
    normalized === 'administrador general' ||
    normalized === 'administrador' ||
    normalized === 'admin' ||
    normalized === 'inventario' ||
    normalized === 'gestión de inventario' ||
    normalized === 'gestion de inventario'
  )
}

export function canManageUsers(role?: string | null): boolean {
  if (!role) return false
  const normalized = role.toLowerCase().trim()
  return (
    normalized === 'dirección' ||
    normalized === 'direccion' ||
    normalized === 'administración' ||
    normalized === 'administracion' ||
    normalized === 'administrador general' ||
    normalized === 'admin'
  )
}
