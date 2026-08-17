import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context'
import { AccessDenied } from '@/components/layout/AccessDenied'

interface RoleGuardProps {
  children?: ReactNode
  allowedRoles?: string[]
  checkPermission?: (role?: string | null) => boolean
  fallback?: 'denied' | 'redirect'
  redirectTo?: string
}

export function RoleGuard({
  children,
  allowedRoles,
  checkPermission,
  fallback = 'denied',
  redirectTo = '/inventario',
}: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  const hasAccess = checkPermission
    ? checkPermission(user.rol)
    : allowedRoles
      ? allowedRoles.some(
          (role) => role.toLowerCase() === user.rol.toLowerCase(),
        )
      : true

  if (!hasAccess) {
    if (fallback === 'redirect') {
      return <Navigate to={redirectTo} replace />
    }
    return <AccessDenied />
  }

  return children ? <>{children}</> : <Outlet />
}
