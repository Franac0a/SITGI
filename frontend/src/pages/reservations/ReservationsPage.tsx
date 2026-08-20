import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import type { ReservationRequest } from '@/types/scientific.types'

interface ReservationsPageProps {
  initialReservations?: ReservationRequest[]
  isLoading?: boolean
}

export function ReservationsPage({
  initialReservations = [],
  isLoading = false,
}: ReservationsPageProps) {
  const [reservations] = useState<ReservationRequest[]>(initialReservations)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cit-petroleo bg-cit-petroleo/10 px-2.5 py-0.5 rounded-full border border-cit-petroleo/20">
              Uso de Instalaciones
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Reservas y Solicitudes
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Turnos para equipamiento científico de alta complejidad, cabinas de flujo y material restringido.
            </p>
          </div>

          <Button variant="primary">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Reserva
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : reservations.length === 0 ? (
          <EmptyState
            title="No hay reservas activas"
            description="No se encuentran solicitudes de reserva de equipamiento o insumos para este período."
            action={
              <Button variant="primary">
                Crear Primera Solicitud
              </Button>
            }
          />
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-5 py-3.5">Código / Equipo</th>
                  <th className="px-5 py-3.5">Investigador</th>
                  <th className="px-5 py-3.5">Fecha y Turno</th>
                  <th className="px-5 py-3.5">Laboratorio</th>
                  <th className="px-5 py-3.5 text-center">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-bold text-gray-900">{res.equipmentOrItemName}</span>
                      <span className="block text-[11px] text-gray-500 font-mono">{res.equipmentOrItemCode}</span>
                    </td>
                    <td className="px-5 py-4 font-medium">{res.researcherName}</td>
                    <td className="px-5 py-4 font-mono text-gray-700">{res.date} ({res.shift})</td>
                    <td className="px-5 py-4 text-gray-700">{res.laboratory}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200 uppercase">
                        {res.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="text-cit-petroleo font-bold hover:text-cit-azul-fuerte hover:underline">
                        Ver Ficha
                      </button>
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
