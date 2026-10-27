import { pedirApi } from '@/servicios/api'
import type { EstadoUsuario, Rol, Usuario } from '@/tipos'

export function obtenerUsuarios(): Promise<Usuario[]> {
  return pedirApi<Usuario[]>('/users')
}

// Solo la Dirección: le pone una contraseña nueva a otro usuario.
export function restablecerPassword(id: number, nueva: string) {
  return pedirApi<{ mensaje: string }>(`/users/${id}/password`, 'PUT', { nueva })
}

// Cambia el estado, el rol o las dos cosas a la vez.
export function actualizarUsuario(id: number, datos: { estado?: EstadoUsuario; rol?: Rol }) {
  return pedirApi<{ mensaje: string }>(`/users/${id}/estado`, 'PUT', datos)
}
