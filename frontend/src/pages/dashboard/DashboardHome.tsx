import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Alert } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context'
import { formatApiError } from '@/utils/errors'
import { getResumen } from '@/services/reportes/reportes.service'
import type { ResumenReporte } from '@/types/scientific.types'

export function DashboardHome() {
  const { user } = useAuth()
  const [resumen, setResumen] = useState<ResumenReporte | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setResumen(await getResumen())
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cit-petroleo bg-cit-petroleo/10 px-2.5 py-0.5 rounded-full border border-cit-petroleo/20">
              Panel de control
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Bienvenido/a, {user?.nombre || 'Usuario'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {user?.rol || 'Personal Científico'}
              {user?.dni ? ` · DNI: ${user.dni}` : ''}
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="error" title="Error al cargar el resumen" message={error} />
        )}

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : resumen ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-2xs">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Ítems en inventario
                </p>
                <p className="text-3xl font-bold text-cit-petroleo mt-2">
                  {resumen.totalItems}
                </p>
              </div>
              <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-2xs">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Stock total
                </p>
                <p className="text-3xl font-bold text-cit-petroleo mt-2">
                  {resumen.totalStock}
                </p>
              </div>
              <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-2xs">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Con stock bajo
                </p>
                <p className="text-3xl font-bold text-amber-600 mt-2">
                  {resumen.bajoStock}
                </p>
              </div>
              <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-2xs">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Categorías
                </p>
                <p className="text-3xl font-bold text-cit-petroleo mt-2">
                  {resumen.porCategoria.length}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
                <h2 className="text-sm font-bold text-gray-900 mb-3">
                  Ítems por categoría
                </h2>
                <ul className="space-y-2">
                  {resumen.porCategoria.map((c) => (
                    <li key={c.categoria} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{c.categoria}</span>
                      <span className="font-bold text-cit-petroleo">{c.cantidad}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
                <h2 className="text-sm font-bold text-gray-900 mb-3">
                  Movimientos recientes
                </h2>
                {resumen.recientes.length === 0 ? (
                  <p className="text-xs text-gray-500">Sin movimientos registrados.</p>
                ) : (
                  <ul className="space-y-2">
                    {resumen.recientes.map((m) => (
                      <li key={m.id} className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
                        <span className="text-gray-900 font-semibold">
                          {m.Item?.nombre || `Ítem #${m.itemId}`}
                        </span>
                        <span className="text-gray-500">
                          {m.tipo_movimiento} x{m.cantidad}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </MainLayout>
  )
}
