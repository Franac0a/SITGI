import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/context'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-2xs">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-bordo-600 bg-bordo-50 px-2.5 py-1 rounded-md border border-bordo-100">
              CIT Formosa &bull; Panel Principal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
              Bienvenido/a, {user?.nombre || 'Usuario'}
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed">
              Has iniciado sesión como{' '}
              <strong className="text-gray-900">{user?.rol}</strong>. Desde aquí podrás acceder a las herramientas institucionales para el control de inventario, registro de movimientos y trazabilidad.
            </p>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {user?.rol === 'Dirección' && (
            <Link
              to="/admin/usuarios"
              className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-bordo-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-base group-hover:text-bordo-700 transition-colors">
                  Gestión de Usuarios
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Aprobar solicitudes pendientes, asignar roles institucionales y gestionar el personal.
                </p>
              </div>
              <span className="text-xs font-semibold text-bordo-600 mt-4 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Acceder al panel &rarr;
              </span>
            </Link>
          )}

          <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col justify-between opacity-75">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                Inventario de Reactivos e Insumos
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Catálogo general de reactivos, drogas, insumos y control de stock crítico.
              </p>
            </div>
            <span className="text-xs font-medium text-gray-400 mt-4">
              Próximamente disponible
            </span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col justify-between opacity-75">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                Registro de Movimientos
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Auditoría de ingresos, retiros para proyectos, descartes y devoluciones.
              </p>
            </div>
            <span className="text-xs font-medium text-gray-400 mt-4">
              Próximamente disponible
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
