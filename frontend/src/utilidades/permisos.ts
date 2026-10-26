// Qué puede hacer cada rol. Son las mismas reglas que valida el backend:
// acá solo se usan para mostrar u ocultar botones y pantallas.
import type { Opcion, TipoMovimiento } from '@/tipos'

// Roles para elegir en la pantalla de usuarios.
export const ROLES: Opcion[] = [
  { valor: 'Investigador', texto: 'Investigador' },
  { valor: 'Técnico/Becario', texto: 'Técnico / Becario' },
  { valor: 'Responsable de área', texto: 'Responsable de área o laboratorio' },
  { valor: 'Inventario', texto: 'Gestión de Inventario y Laboratorio' },
  { valor: 'Administración', texto: 'Administración Institucional' },
  { valor: 'Dirección', texto: 'Dirección del CIT' },
]

export const TIPOS_MOVIMIENTO: TipoMovimiento[] = [
  'Ingreso',
  'Egreso',
  'Reposición',
  'Baja',
  'Ajuste',
  'Reparación',
  'Cambio de ubicación',
]

const ROLES_GESTION = ['Dirección', 'Administración', 'Inventario']

// Investigador y Técnico/Becario solo pueden registrar consumos (egresos).
const ROLES_SOLO_EGRESO = ['Investigador', 'Técnico/Becario']

// Alta, edición y baja de ítems, sectores, residuos, documentos y pedidos.
export function puedeGestionarInventario(rol?: string): boolean {
  return ROLES_GESTION.includes(rol ?? '')
}

export function tiposDeMovimientoPermitidos(rol?: string): TipoMovimiento[] {
  if (puedeGestionarInventario(rol)) return TIPOS_MOVIMIENTO
  if (ROLES_SOLO_EGRESO.includes(rol ?? '')) return ['Egreso']
  return []
}

export function puedeRegistrarMovimientos(rol?: string): boolean {
  return tiposDeMovimientoPermitidos(rol).length > 0
}

export function puedeGestionarUsuarios(rol?: string): boolean {
  return rol === 'Dirección'
}

export function puedeGestionarProyectos(rol?: string): boolean {
  return rol === 'Dirección' || rol === 'Administración'
}

// Pantalla a la que se entra después de iniciar sesión.
export function rutaInicial(rol?: string): string {
  return puedeGestionarUsuarios(rol) ? '/admin/usuarios' : '/dashboard'
}
