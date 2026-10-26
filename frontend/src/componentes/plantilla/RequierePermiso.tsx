import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSesion } from '@/contexto/useSesion'
import { AccesoDenegado } from './AccesoDenegado'

interface PropsRequierePermiso {
  // Función de utilidades/permisos.ts que dice si el rol puede entrar.
  permiso: (rol?: string) => boolean
  children: ReactNode
  // Si se indica, en vez de mostrar "Acceso denegado" se redirige a esta ruta.
  redirigirA?: string
}

// Muestra la página solo si el rol del usuario tiene el permiso pedido.
export function RequierePermiso({ permiso, children, redirigirA }: PropsRequierePermiso) {
  const { usuario } = useSesion()

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (!permiso(usuario.rol)) {
    return redirigirA ? <Navigate to={redirigirA} replace /> : <AccesoDenegado />
  }

  return children
}
