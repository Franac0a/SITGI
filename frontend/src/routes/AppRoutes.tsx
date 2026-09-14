import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { useAuth } from '@/context'
import { UsersAdminPage } from '@/pages/admin/UsersAdminPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardHome } from '@/pages/dashboard/DashboardHome'
import { DocumentsPage } from '@/pages/documents/DocumentsPage'
import { InventoryPage, NewInventoryItemPage, EditInventoryItemPage } from '@/pages/inventory'
import { MovementsPage } from '@/pages/movements/MovementsPage'
import { MuestrasPage } from '@/pages/muestras/MuestrasPage'
import { PedidosPage } from '@/pages/pedidos/PedidosPage'
import { ProyectosPage } from '@/pages/proyectos/ProyectosPage'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import { ResiduosPage } from '@/pages/residuos/ResiduosPage'
import { SectoresPage } from '@/pages/sectores/SectoresPage'
import { canCreateInventory, canManageUsers } from '@/utils/rbac'

export function AppRoutes() {
  const { isAuthenticated, user } = useAuth()

  const isUserAdmin = canManageUsers(user?.rol)
  const defaultAuthRedirect = isUserAdmin ? '/admin/usuarios' : '/dashboard'

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
        <Route
          path="/inventario/editar/:id"
          element={
            <RoleGuard checkPermission={canCreateInventory} fallback="denied">
              <EditInventoryItemPage />
            </RoleGuard>
          }
        />
        <Route path="/movimientos" element={<MovementsPage />} />
        <Route path="/pedidos" element={<PedidosPage />} />
        <Route path="/sectores" element={<SectoresPage />} />
        <Route path="/residuos" element={<ResiduosPage />} />
        <Route path="/muestras" element={<MuestrasPage />} />
        <Route path="/proyectos" element={<ProyectosPage />} />
        <Route path="/documentos" element={<DocumentsPage />} />
        <Route path="/reportes" element={<ReportsPage />} />
      </Route>

      <Route
        element={
          <RoleGuard checkPermission={canManageUsers} fallback="redirect" redirectTo="/dashboard" />
        }
      >
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
