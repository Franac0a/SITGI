import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { useAuth } from '@/context'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { canCreateInventory, canManageUsers } from '@/utils/rbac'

// Cada página se descarga recién cuando se visita, para achicar la carga inicial.
const UsersAdminPage = lazy(() =>
  import('@/pages/admin/UsersAdminPage').then((m) => ({ default: m.UsersAdminPage })),
)
const DashboardHome = lazy(() =>
  import('@/pages/dashboard/DashboardHome').then((m) => ({ default: m.DashboardHome })),
)
const DocumentsPage = lazy(() =>
  import('@/pages/documents/DocumentsPage').then((m) => ({ default: m.DocumentsPage })),
)
const InventoryPage = lazy(() =>
  import('@/pages/inventory/InventoryPage').then((m) => ({ default: m.InventoryPage })),
)
const NewInventoryItemPage = lazy(() =>
  import('@/pages/inventory/NewInventoryItemPage').then((m) => ({ default: m.NewInventoryItemPage })),
)
const EditInventoryItemPage = lazy(() =>
  import('@/pages/inventory/EditInventoryItemPage').then((m) => ({ default: m.EditInventoryItemPage })),
)
const MovementsPage = lazy(() =>
  import('@/pages/movements/MovementsPage').then((m) => ({ default: m.MovementsPage })),
)
const MuestrasPage = lazy(() =>
  import('@/pages/muestras/MuestrasPage').then((m) => ({ default: m.MuestrasPage })),
)
const PedidosPage = lazy(() =>
  import('@/pages/pedidos/PedidosPage').then((m) => ({ default: m.PedidosPage })),
)
const ProyectosPage = lazy(() =>
  import('@/pages/proyectos/ProyectosPage').then((m) => ({ default: m.ProyectosPage })),
)
const ReportsPage = lazy(() =>
  import('@/pages/reports/ReportsPage').then((m) => ({ default: m.ReportsPage })),
)
const ResiduosPage = lazy(() =>
  import('@/pages/residuos/ResiduosPage').then((m) => ({ default: m.ResiduosPage })),
)
const SectoresPage = lazy(() =>
  import('@/pages/sectores/SectoresPage').then((m) => ({ default: m.SectoresPage })),
)

function Cargando() {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
      Cargando...
    </div>
  )
}

export function AppRoutes() {
  const { isAuthenticated, user } = useAuth()

  const isUserAdmin = canManageUsers(user?.rol)
  const defaultAuthRedirect = isUserAdmin ? '/admin/usuarios' : '/dashboard'

  return (
    <Suspense fallback={<Cargando />}>
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
    </Suspense>
  )
}
