import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { useAuth } from '@/context'
import { UsersAdminPage } from '@/pages/admin/UsersAdminPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'

export function AppRoutes() {
  const { isAuthenticated, user } = useAuth()

  const defaultAuthRedirect =
    user?.rol === 'Dirección' ? '/admin/usuarios' : '/dashboard'

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to={defaultAuthRedirect} replace /> : <LoginPage />
        }
      />
      <Route
        path="/registro"
        element={
          isAuthenticated ? <Navigate to={defaultAuthRedirect} replace /> : <RegisterPage />
        }
      />

      {/* Protected Routes (All authenticated users) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      {/* Protected Routes (Exclusively Dirección) */}
      <Route element={<ProtectedRoute allowedRoles={['Dirección']} />}>
        <Route path="/admin/usuarios" element={<UsersAdminPage />} />
      </Route>

      {/* Root & Catch-all Navigation */}
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? defaultAuthRedirect : '/login'}
            replace
          />
        }
      />
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? defaultAuthRedirect : '/login'}
            replace
          />
        }
      />
    </Routes>
  )
}
