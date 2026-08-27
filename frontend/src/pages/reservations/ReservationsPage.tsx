import { useState } from 'react'
import { Plus } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import {
  Button,
  EmptyState,
  Skeleton,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui'
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
            <Badge variant="cit" className="uppercase font-bold tracking-wider">
              Uso de Instalaciones
            </Badge>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Reservas y Solicitudes
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Turnos para equipamiento científico de alta complejidad, cabinas de flujo y material restringido.
            </p>
          </div>

          <Button variant="primary">
            <Plus className="w-4 h-4" />
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código / Equipo</TableHead>
                  <TableHead>Investigador</TableHead>
                  <TableHead>Fecha y Turno</TableHead>
                  <TableHead>Laboratorio</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell>
                      <span className="font-bold text-gray-900">{res.equipmentOrItemName}</span>
                      <span className="block text-[11px] text-gray-500 font-mono">{res.equipmentOrItemCode}</span>
                    </TableCell>
                    <TableCell className="font-medium">{res.researcherName}</TableCell>
                    <TableCell className="font-mono text-gray-700">{res.date} ({res.shift})</TableCell>
                    <TableCell className="text-gray-700">{res.laboratory}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="uppercase">
                        {res.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-cit-petroleo font-bold hover:text-cit-azul-fuerte"
                      >
                        Ver Ficha
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

