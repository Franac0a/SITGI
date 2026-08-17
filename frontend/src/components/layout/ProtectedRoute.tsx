import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context'
import type { InstitutionalRole } from '@/types/auth.types'

interface ProtectedRouteProps {
  allowedRoles?: InstitutionalRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
