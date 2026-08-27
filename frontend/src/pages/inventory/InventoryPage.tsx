import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, Search } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import {
  Button,
  EmptyState,
  Skeleton,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui'
import { useAuth } from '@/context'
import { canCreateInventory } from '@/utils/rbac'
import type { InventoryItem } from '@/types/scientific.types'

interface InventoryPageProps {
  initialItems?: InventoryItem[]
  isLoading?: boolean
}

export function InventoryPage({
  initialItems = [],
  isLoading = false,
}: InventoryPageProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [items] = useState<InventoryItem[]>(initialItems)
  const [searchQuery, setSearchQuery] = useState('')

  const canCreate = canCreateInventory(user?.rol)

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.casNumber && item.casNumber.includes(searchQuery)),
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <Badge variant="cit" className="uppercase font-bold tracking-wider">
              Catálogo de Laboratorio
            </Badge>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Inventario Científico
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Registro y control de existencias de reactivos químicos, drogas, material biológico e insumos analíticos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canCreate ? (
              <Button
                variant="primary"
                onClick={() => navigate('/inventario/nuevo')}
              >
                <Plus className="w-4 h-4" />
                Nuevo Elemento
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => navigate('/reservas')}
              >
                <Calendar className="w-4 h-4" />
                Solicitar / Reservar
              </Button>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por código, nombre o CAS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No hay elementos en el inventario"
            description={
              canCreate
                ? 'No se encontraron registros de reactivos o insumos en la base de datos. Puede registrar el primer elemento ahora.'
                : 'No se encontraron registros de reactivos o insumos en la base de datos.'
            }
            action={
              canCreate ? (
                <Button
                  variant="primary"
                  onClick={() => navigate('/inventario/nuevo')}
                >
                  Registrar Primer Elemento
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => navigate('/reservas')}
                >
                  Ir a Solicitudes y Reservas
                </Button>
              )
            }
          />
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código / CAS</TableHead>
                  <TableHead>Nombre Químico / Insumo</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead className="text-center">Stock Actual</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-bold text-gray-900">{item.code}</TableCell>
                    <TableCell className="font-bold">
                      {item.name}
                      {item.casNumber && (
                        <span className="block text-[11px] text-gray-500 font-normal font-mono">
                          CAS: {item.casNumber}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="cit">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">{item.location}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {item.currentStock} / Mín {item.minStock} {item.unit}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700 font-mono">
                      {item.expirationDate || '---'}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {canCreate ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-cit-petroleo font-bold hover:text-cit-azul-fuerte mr-2"
                          >
                            Registrar Retiro
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 font-medium hover:text-cit-petroleo"
                          >
                            Detalles
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/reservas')}
                          className="text-cit-petroleo font-bold hover:text-cit-azul-fuerte"
                        >
                          Solicitar Uso
                        </Button>
                      )}
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

