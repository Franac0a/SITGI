import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { useAuth } from '@/context'
import { UsersAdminPage } from '@/pages/admin/UsersAdminPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardHome } from '@/pages/dashboard/DashboardHome'
import { DocumentsPage } from '@/pages/documents/DocumentsPage'
import { InventoryPage, NewInventoryItemPage } from '@/pages/inventory'
import { MovementsPage } from '@/pages/movements/MovementsPage'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import { ReservationsPage } from '@/pages/reservations/ReservationsPage'
import { canCreateInventory } from '@/utils/rbac'

export function AppRoutes() {
  const { isAuthenticated, user } = useAuth()

  const defaultAuthRedirect =
    user?.rol === 'Dirección' ? '/admin/usuarios' : '/dashboard'

  return (
    <Routes>
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

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/inventario" element={<InventoryPage />} />
        <Route
          path="/inventario/nuevo"
          element={
            <RoleGuard checkPermission={canCreateInventory} fallback="denied">
              <NewInventoryItemPage />
            </RoleGuard>
          }
        />
        <Route path="/movimientos" element={<MovementsPage />} />
        <Route path="/proyectos" element={<ProjectsPage />} />
        <Route path="/reservas" element={<ReservationsPage />} />
        <Route path="/documentos" element={<DocumentsPage />} />
        <Route path="/reportes" element={<ReportsPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Dirección', 'Administración']} />}>
        <Route path="/admin/usuarios" element={<UsersAdminPage />} />
      </Route>

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
