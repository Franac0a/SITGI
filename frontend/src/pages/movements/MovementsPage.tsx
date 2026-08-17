import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import type { MovementRecord } from '@/types/scientific.types'

interface MovementsPageProps {
  initialMovements?: MovementRecord[]
  isLoading?: boolean
}

export function MovementsPage({
  initialMovements = [],
  isLoading = false,
}: MovementsPageProps) {
  const [movements] = useState<MovementRecord[]>(initialMovements)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-bordo-700 bg-bordo-50 px-2 py-0.5 rounded border border-bordo-200">
              Trazabilidad de Stock
            </span>
            <h1 className="text-2xl font-bold text-black mt-2">
              Stock y Movimientos
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Registro inmutable de ingresos, retiros de reactivos, descartes y auditoría de uso por proyecto.
            </p>
          </div>

          <Button variant="primary">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Registrar Movimiento
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : movements.length === 0 ? (
          <EmptyState
            title="No hay movimientos registrados"
            description="Aún no se han asentado ingresos, retiros ni descartes de reactivos en el registro de trazabilidad."
            action={
              <Button variant="primary">
                Registrar Primer Movimiento
              </Button>
            }
          />
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-5 py-3.5">ID / Fecha</th>
                  <th className="px-5 py-3.5">Tipo</th>
                  <th className="px-5 py-3.5">Ítem / Reactivo</th>
                  <th className="px-5 py-3.5 text-center">Variación</th>
                  <th className="px-5 py-3.5">Investigador</th>
                  <th className="px-5 py-3.5">Proyecto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-black">
                {movements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono">
                      <span className="font-bold text-gray-900">{mov.code}</span>
                      <span className="block text-[11px] text-gray-500">{mov.timestamp}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-black border border-gray-200 text-[11px] font-bold uppercase">
                        {mov.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold">
                      {mov.itemName}
                      <span className="block text-[11px] text-gray-500 font-normal font-mono">{mov.itemCode}</span>
                    </td>
                    <td className="px-5 py-4 text-center font-mono">
                      <span className="font-bold text-bordo-700">
                        {mov.quantity} {mov.unit}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold">{mov.userName}</span>
                      <span className="block text-[11px] text-gray-500">{mov.userRole}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-medium">
                      {mov.projectName || '---'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
