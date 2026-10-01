import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/ui/alert'
import { formatApiError } from '@/utils/errors'
import {
  getAlertas,
  exportInventarioCsv,
} from '@/services/reportes/reportes.service'
import type { AlertaTipo, ReporteAlerta } from '@/types/scientific.types'

function alertaInfo(tipo: AlertaTipo): { label: string; badge: string } {
  switch (tipo) {
    case 'agotado':
      return {
        label: 'Agotado',
        badge: 'bg-red-100 text-red-700 border-red-200',
      }
    case 'stock_bajo':
      return {
        label: 'Stock bajo',
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
      }
    case 'vencido':
      return {
        label: 'Vencido',
        badge: 'bg-red-100 text-red-700 border-red-200',
      }
    case 'proximo_vencimiento':
      return {
        label: 'Vence pronto',
        badge: 'bg-sky-100 text-sky-800 border-sky-200',
      }
    default:
      return {
        label: 'Alerta',
        badge: 'bg-gray-100 text-gray-800 border-gray-200',
      }
  }
}

export function ReportsPage() {
  const [alertas, setAlertas] = useState<ReporteAlerta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setAlertas(await getAlertas())
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleExport = async () => {
    setExporting(true)
    setExportError(null)
    try {
      await exportInventarioCsv()
    } catch (err) {
      setExportError(formatApiError(err))
    } finally {
      setExporting(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cit-petroleo bg-cit-petroleo/10 px-2.5 py-0.5 rounded-full border border-cit-petroleo/20">
              Auditoría y Notificaciones
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Alertas y Reportes
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Monitoreo de stock mínimo, vencimientos y exportación de informes del CIT.
            </p>
          </div>

          <Button variant="primary" onClick={handleExport} isLoading={exporting} disabled={exporting}>
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Exportar Informe (CSV)
          </Button>
        </div>

        {exportError && (
          <Alert variant="error" title="Error al exportar" message={exportError} />
        )}

        {error && (
          <Alert variant="error" title="Error al cargar alertas" message={error} />
        )}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : alertas.length === 0 ? (
          <EmptyState
            title="No hay alertas pendientes"
            description="El sistema no registra stock crítico ni vencimientos inminentes."
          />
        ) : (
          <div className="space-y-3">
            {alertas.map((alerta, index) => {
              const info = alertaInfo(alerta.tipo)
              const item = alerta.item
              const venc =
                item.detalles_tecnicos?.fechaVencimiento || item.fechaVencimiento
              const detalle =
                alerta.tipo === 'agotado' || alerta.tipo === 'stock_bajo'
                  ? `Stock actual: ${item.stock_actual ?? 0} (mínimo ${item.stock_minimo ?? 0})`
                  : `Vencimiento: ${venc || '—'}`

              return (
                <div
                  key={`${alerta.tipo}-${item.id}-${index}`}
                  className="p-4 rounded-xl border border-gray-200 bg-white flex items-start justify-between gap-4 shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase ${info.badge}`}
                    >
                      {info.label}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        {item.nombre || item.name || 'Sin nombre'}
                        {item.codigo_identificacion && (
                          <span className="ml-2 font-mono text-xs text-gray-400">
                            {item.codigo_identificacion}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">{detalle}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
