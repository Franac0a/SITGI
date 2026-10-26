import { pedirApi } from '@/servicios/api'
import type { Usuario } from '@/tipos'

export async function iniciarSesion(email: string, password: string): Promise<Usuario> {
  const respuesta = await pedirApi<{ usuario: Usuario }>('/auth/login', 'POST', { email, password })
  return respuesta.usuario
}

export function registrarUsuario(datos: {
  dni: string
  nombre: string
  email: string
  password: string
}) {
  return pedirApi('/auth/register', 'POST', datos)
}

// Pregunta al backend quién es el usuario de la cookie actual.
export async function obtenerUsuarioActual(): Promise<Usuario> {
  const respuesta = await pedirApi<{ usuario: Usuario }>('/auth/me')
  return respuesta.usuario
}

export function cerrarSesion() {
  return pedirApi('/auth/logout', 'POST')
}
