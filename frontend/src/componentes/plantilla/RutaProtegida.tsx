import { Navigate, Outlet } from 'react-router-dom'
import { useSesion } from '@/contexto/useSesion'

// Envuelve las rutas internas: si no hay sesión, manda al login.
export function RutaProtegida() {
  const { estaLogueado } = useSesion()

  if (!estaLogueado) {
    return <Navigate to="/login" replace />
  }

  // <Outlet /> muestra la página de la ruta hija que corresponda.
  return <Outlet />
}
