import { MainLayout } from '@/components/layout/MainLayout'
import { useAuth } from '@/context'

export function DashboardHome() {
  const { user } = useAuth()

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
        <div
          id="logo-main-placeholder"
          className="w-56 h-56 sm:w-72 sm:h-72 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-8 shadow-xs"
        />

        <div className="max-w-xl space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Bienvenido/a, {user?.nombre || 'Usuario'}
          </h1>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cit-petroleo/10 text-cit-petroleo border border-cit-petroleo/20">
            <span className="text-xs font-bold uppercase tracking-wider">
              {user?.rol || 'Personal Científico'}
            </span>
            {user?.dni && (
              <span className="text-xs text-gray-500 font-mono">
                &bull; DNI: {user.dni}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 leading-relaxed pt-2">
            Sistema Integral de Inventario, Stock y Trazabilidad Científica (CIT Formosa). Utilice el menú superior para acceder a los módulos de trabajo.
          </p>
        </div>
      </div>
    </MainLayout>
  )
}
