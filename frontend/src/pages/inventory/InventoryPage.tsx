import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/ui/alert'
import { useAuth } from '@/context'
import { canCreateInventory } from '@/utils/rbac'
import { getInventoryItems } from '@/services/inventory/inventory.service'
import type { InventoryItem } from '@/types/scientific.types'

interface InventoryPageProps {
  initialItems?: InventoryItem[]
  isLoading?: boolean
}

export function InventoryPage({
  initialItems = [],
  isLoading: initialLoading = false,
}: InventoryPageProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [items, setItems] = useState<InventoryItem[]>(initialItems)
  const [loading, setLoading] = useState<boolean>(initialItems.length === 0 && !initialLoading)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const canCreate = canCreateInventory(user?.rol)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getInventoryItems()
      setItems(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar el inventario.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const filteredItems = items.filter((item) => {
    const name = (item.nombre || item.name || '').toLowerCase()
    const code = (item.codigo_identificacion || item.code || '').toLowerCase()
    const cas = (item.numeroCAS || item.casNumber || '').toLowerCase()
    const location = (item.laboratorioUbicacion || item.ubicacion || item.location || '').toLowerCase()
    const category = (item.tipoElemento || item.categoria || item.category || '').toLowerCase()
    const q = searchQuery.toLowerCase().trim()

    return (
      name.includes(q) ||
      code.includes(q) ||
      cas.includes(q) ||
      location.includes(q) ||
      category.includes(q)
    )
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cit-petroleo bg-cit-petroleo/10 px-2.5 py-0.5 rounded-full border border-cit-petroleo/20">
              Catálogo de Laboratorio
            </span>
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nuevo Elemento
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => navigate('/reservas')}
              >
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Solicitar / Reservar
              </Button>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Buscar por nombre, CAS o ubicación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cit-turquesa focus:border-cit-turquesa font-sans"
            />
          </div>
        </div>

        {error && (
          <Alert
            variant="error"
            title="Error al cargar inventario"
            message={error}
          />
        )}

        {loading ? (
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
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-5 py-3.5">N° CAS</th>
                  <th className="px-5 py-3.5">Nombre Químico / Insumo</th>
                  <th className="px-5 py-3.5">Tipo / Categoría</th>
                  <th className="px-5 py-3.5">Ubicación</th>
                  <th className="px-5 py-3.5 text-center">Stock Actual</th>
                  <th className="px-5 py-3.5 text-center">Estado</th>
                  <th className="px-5 py-3.5">Vencimiento</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {filteredItems.map((item) => {
                  const itemName = item.nombre || item.name || 'Sin nombre'
                  const itemCas = item.numeroCAS || item.casNumber
                  const itemCategory =
                    item.tipoElemento ||
                    item.categoria ||
                    item.category ||
                    'Reactivo'
                  const itemLocation =
                    item.laboratorioUbicacion ||
                    item.ubicacion ||
                    item.location ||
                    'Laboratorio'
                  const currentStock =
                    item.stockActual ??
                    item.stock_actual ??
                    item.currentStock ??
                    0
                  const minStock =
                    item.stockMinimo ??
                    item.stock_minimo ??
                    item.minStock ??
                    0
                  const unit = item.unidadMedida || item.unit || 'u'
                  const expDate =
                    item.fechaVencimiento ||
                    item.fecha_vencimiento ||
                    item.expirationDate

                  const isAgotado = currentStock <= 0
                  const isBajoStock =
                    !isAgotado && minStock > 0 && currentStock <= minStock

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono">
                        {itemCas ? (
                          <span className="font-bold text-gray-900">
                            {itemCas}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-sans font-normal text-[11px] italic">
                            Sin CAS
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-900">
                        {itemName}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded bg-cit-petroleo/10 border border-cit-petroleo/20 text-cit-petroleo text-[11px] font-semibold capitalize">
                          {itemCategory}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {itemLocation}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
                          {currentStock} / Mín {minStock} {unit}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {isAgotado ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                            Agotado
                          </span>
                        ) : isBajoStock ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Stock Bajo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Disponible
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-700 font-mono">
                        {expDate || '---'}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {canCreate ? (
                          <>
                            <button
                              type="button"
                              className="text-cit-petroleo font-bold hover:text-cit-azul-fuerte hover:underline mr-3"
                            >
                              Registrar Retiro
                            </button>
                            <button
                              type="button"
                              className="text-gray-500 font-medium hover:text-cit-petroleo"
                            >
                              Detalles
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => navigate('/reservas')}
                            className="text-cit-petroleo font-bold hover:text-cit-azul-fuerte hover:underline"
                          >
                            Solicitar Uso
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
