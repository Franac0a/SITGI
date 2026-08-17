import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context'

interface ProtectedRouteProps {
  allowedRoles?: string[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (
    allowedRoles &&
    !allowedRoles.some(
      (role) => role.toLowerCase() === user.rol.toLowerCase(),
    )
  ) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
