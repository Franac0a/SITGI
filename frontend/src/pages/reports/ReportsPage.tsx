import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import type { SystemAlert } from '@/types/scientific.types'

interface ReportsPageProps {
  initialAlerts?: SystemAlert[]
  isLoading?: boolean
}

export function ReportsPage({
  initialAlerts = [],
  isLoading = false,
}: ReportsPageProps) {
  const [alerts] = useState<SystemAlert[]>(initialAlerts)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-bordo-700 bg-bordo-50 px-2 py-0.5 rounded border border-bordo-200">
              Auditoría y Notificaciones
            </span>
            <h1 className="text-2xl font-bold text-black mt-2">
              Alertas y Reportes
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Monitoreo de stock mínimo, vencimientos críticos y exportación de informes periódicos del CIT.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Informe
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : alerts.length === 0 ? (
          <EmptyState
            title="No hay alertas pendientes"
            description="El sistema no registra contingencias de stock crítico ni vencimientos inminentes."
          />
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-xl border border-gray-200 bg-white flex items-start justify-between gap-4 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-bordo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    !
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {alert.description}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-gray-400 font-mono whitespace-nowrap">
                  {alert.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
