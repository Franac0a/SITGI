import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { InventoryItemForm } from '@/components/inventory/InventoryItemForm'
import { Alert } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { canCreateInventory } from '@/utils/rbac'
import { formatApiError } from '@/utils/errors'
import {
  getInventoryItemById,
  updateInventoryItem,
} from '@/services/inventory/inventory.service'
import { useNotifications } from '@/context'
import type {
  CreateInventoryItemPayload,
  InventoryItem,
  InventoryItemType,
} from '@/types/scientific.types'

function itemToDefaults(item: InventoryItem): Partial<CreateInventoryItemPayload> {
  const detalles = item.detalles_tecnicos || {}
  return {
    nombre: item.nombre || item.name || '',
    tipo: (item.categoria || item.category || 'Reactivo') as InventoryItemType,
    cantidadInicial:
      item.stock_actual ?? item.stockActual ?? item.currentStock ?? 0,
    unidadMedida:
      item.unidad_medida || item.unidadMedida || item.unit || '',
    laboratorioUbicacion:
      item.ubicacion || item.laboratorioUbicacion || item.location || '',
    condicion_almacenamiento: item.condicion_almacenamiento ?? '',
    fechaVencimiento:
      item.fechaVencimiento ||
      item.fecha_vencimiento ||
      item.expirationDate ||
      detalles.fechaVencimiento ||
      '',
    codigoCas:
      item.codigoCas ||
      item.numeroCAS ||
      item.casNumber ||
      detalles.codigoCas ||
      '',
    marca: item.marca || item.marcaFabricante || item.brand || '',
    numeroLote: item.numeroLote || item.batchNumber || detalles.numeroLote || '',
    stockMinimo: item.stock_minimo ?? item.stockMinimo ?? item.minStock,
    observaciones: item.observaciones || detalles.observaciones || '',
  }
}

export function EditInventoryItemPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addNotification } = useNotifications()

  const [item, setItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('No se especificó un ítem para editar.')
      setLoading(false)
      return
    }
    getInventoryItemById(id)
      .then(setItem)
      .catch((err) => setError(formatApiError(err)))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (payload: CreateInventoryItemPayload) => {
    if (!id) return
    await updateInventoryItem(id, payload)
    addNotification({
      title: 'Elemento actualizado',
      description: `Se actualizó "${payload.nombre}" en el inventario.`,
      type: 'success',
    })
    navigate('/inventario')
  }

  return (
    <MainLayout>
      <RoleGuard checkPermission={canCreateInventory} fallback="denied">
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
          <div className="border-b border-gray-200 pb-5">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <button
                type="button"
                onClick={() => navigate('/inventario')}
                className="hover:text-cit-petroleo hover:underline transition-colors"
              >
                Inventario Científico
              </button>
              <span>/</span>
              <span className="text-gray-900 font-semibold">Editar Elemento</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Editar Elemento Científico
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Actualice los datos técnicos del elemento seleccionado.
            </p>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : error ? (
            <Alert variant="error" title="No se pudo cargar el ítem" message={error} />
          ) : item ? (
            <InventoryItemForm
              onSubmit={handleSubmit}
              onCancel={() => navigate('/inventario')}
              defaultValues={itemToDefaults(item)}
            />
          ) : (
            <Alert variant="info" message="El ítem no existe." />
          )}
        </div>
      </RoleGuard>
    </MainLayout>
  )
}
