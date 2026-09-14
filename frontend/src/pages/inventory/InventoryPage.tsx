import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/ui/alert'
import { useAuth } from '@/context'
import { canCreateInventory } from '@/utils/rbac'
import { getInventoryItems, deleteInventoryItem } from '@/services/inventory/inventory.service'
import { getMovementHistory } from '@/services/movements/movements.service'
import type { InventoryItem, Movimiento } from '@/types/scientific.types'

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
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null)
  const [detailHistory, setDetailHistory] = useState<Movimiento[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

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

  const openDetail = async (item: InventoryItem) => {
    setDetailItem(item)
    setDetailHistory([])
    setDetailLoading(true)
    try {
      const history = await getMovementHistory(item.id)
      setDetailHistory(history)
    } catch {
      setDetailHistory([])
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setDetailItem(null)
    setDetailHistory([])
  }

  const handleDelete = async (item: InventoryItem) => {
    const name = item.nombre || item.name || 'el elemento'
    if (!window.confirm(`¿Eliminar "${name}" del inventario?`)) return
    try {
      await deleteInventoryItem(item.id)
      await fetchItems()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el ítem.')
    }
  }

  const filteredItems = items.filter((item) => {
    const name = (item.nombre || item.name || '').toLowerCase()
    const code = (item.codigo_identificacion || item.code || '').toLowerCase()
    const cas = (item.numeroCAS || item.casNumber || item.codigoCas || item.detalles_tecnicos?.codigoCas || '').toLowerCase()
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
            {canCreate && (
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
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Buscar por código, nombre o CAS..."
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
              ) : undefined
            }
          />
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-5 py-3.5">Código / CAS</th>
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
                  const itemCode =
                    item.codigo_identificacion ||
                    item.code ||
                    `CIT-${item.id}`
                  const itemName = item.nombre || item.name || 'Sin nombre'
                  const itemCas =
                    item.numeroCAS ||
                    item.casNumber ||
                    item.codigoCas ||
                    item.detalles_tecnicos?.codigoCas
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
                  const unit =
                    item.unidadMedida ||
                    item.unidad_medida ||
                    item.unit ||
                    'u'
                  const expDate =
                    item.fechaVencimiento ||
                    item.fecha_vencimiento ||
                    item.expirationDate ||
                    item.detalles_tecnicos?.fechaVencimiento

                  const isAgotado = currentStock <= 0
                  const isBajoStock =
                    !isAgotado && minStock > 0 && currentStock <= minStock

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono font-bold text-gray-900">
                        {itemCode}
                      </td>
                      <td className="px-5 py-4 font-bold">
                        {itemName}
                        {itemCas && (
                          <span className="block text-[11px] text-gray-500 font-normal font-mono">
                            CAS: {itemCas}
                          </span>
                        )}
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
                              onClick={() =>
                                navigate(
                                  `/movimientos?itemId=${item.id}&tipo=Egreso`,
                                )
                              }
                              className="text-cit-petroleo font-bold hover:text-cit-azul-fuerte hover:underline mr-3"
                            >
                              Retiro
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/inventario/editar/${item.id}`)}
                              className="text-cit-petroleo font-bold hover:text-cit-azul-fuerte hover:underline mr-3"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => openDetail(item)}
                              className="text-gray-500 font-medium hover:text-cit-petroleo mr-3"
                            >
                              Detalles
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              className="text-red-600 font-medium hover:text-red-700"
                            >
                              Eliminar
                            </button>
                          </>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={closeDetail}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-200 pb-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cit-petroleo bg-cit-petroleo/10 px-2.5 py-0.5 rounded-full border border-cit-petroleo/20">
                  Detalle del Elemento
                </span>
                <h2 className="text-xl font-bold text-gray-900 mt-2">
                  {detailItem.nombre || detailItem.name || 'Sin nombre'}
                </h2>
                <p className="text-xs font-mono text-gray-500 mt-1">
                  {detailItem.codigo_identificacion ||
                    detailItem.code ||
                    `CIT-${detailItem.id}`}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDetail}
                className="text-gray-400 hover:text-gray-700"
                aria-label="Cerrar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4 flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <QRCodeSVG
                value={
                  detailItem.codigo_identificacion ||
                  detailItem.code ||
                  `CIT-${detailItem.id}`
                }
                size={84}
                level="M"
              />
              <div className="text-xs text-gray-600">
                <p className="font-bold text-gray-900 font-mono">
                  {detailItem.codigo_identificacion ||
                    detailItem.code ||
                    `CIT-${detailItem.id}`}
                </p>
                <p>Escaneá el código para identificar el elemento.</p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs font-bold text-gray-500 uppercase">Tipo / Categoría</dt>
                <dd className="text-gray-900">
                  {detailItem.tipoElemento ||
                    detailItem.categoria ||
                    detailItem.category ||
                    '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-gray-500 uppercase">Ubicación</dt>
                <dd className="text-gray-900">
                  {detailItem.laboratorioUbicacion ||
                    detailItem.ubicacion ||
                    detailItem.location ||
                    '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-gray-500 uppercase">Stock actual</dt>
                <dd className="text-gray-900">
                  {detailItem.stockActual ??
                    detailItem.stock_actual ??
                    detailItem.currentStock ??
                    0}{' '}
                  {detailItem.unidadMedida ||
                    detailItem.unidad_medida ||
                    detailItem.unit ||
                    'u'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-gray-500 uppercase">Stock mínimo</dt>
                <dd className="text-gray-900">
                  {detailItem.stockMinimo ??
                    detailItem.stock_minimo ??
                    detailItem.minStock ??
                    '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-gray-500 uppercase">Número CAS</dt>
                <dd className="text-gray-900 font-mono">
                  {detailItem.numeroCAS ||
                    detailItem.casNumber ||
                    detailItem.codigoCas ||
                    detailItem.detalles_tecnicos?.codigoCas ||
                    '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-gray-500 uppercase">Marca / Fabricante</dt>
                <dd className="text-gray-900">
                  {detailItem.marcaFabricante || detailItem.marca || detailItem.brand || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-gray-500 uppercase">Número de Lote</dt>
                <dd className="text-gray-900">
                  {detailItem.numeroLote ||
                    detailItem.batchNumber ||
                    detailItem.detalles_tecnicos?.numeroLote ||
                    '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-gray-500 uppercase">Vencimiento</dt>
                <dd className="text-gray-900">
                  {detailItem.fechaVencimiento ||
                    detailItem.fecha_vencimiento ||
                    detailItem.expirationDate ||
                    detailItem.detalles_tecnicos?.fechaVencimiento ||
                    '—'}
                </dd>
              </div>
            </dl>

            {detailItem.observaciones && (
              <p className="text-xs text-gray-600 mt-4">
                <strong>Observaciones:</strong> {detailItem.observaciones}
              </p>
            )}

            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">
                Historial de movimientos
              </h3>
              {detailLoading ? (
                <p className="text-xs text-gray-500">Cargando historial...</p>
              ) : detailHistory.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Este ítem no tiene movimientos registrados.
                </p>
              ) : (
                <ul className="space-y-2">
                  {detailHistory.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between text-xs border-b border-gray-100 pb-2"
                    >
                      <span>
                        <span className="font-bold text-gray-900">{m.tipo_movimiento}</span>{' '}
                        <span className="text-gray-600">
                          x{m.cantidad} — {m.responsable}
                        </span>
                      </span>
                      <span className="font-mono text-gray-400">
                        {m.fecha_movimiento || m.createdAt?.slice(0, 10)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
