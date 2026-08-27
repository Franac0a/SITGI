import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { InventoryItemForm } from '@/components/inventory/InventoryItemForm'
import { Button } from '@/components/ui/button'
import { canCreateInventory } from '@/utils/rbac'
import { createInventoryItem } from '@/services/inventory/inventory.service'
import type { CreateInventoryItemPayload } from '@/types/scientific.types'

export function NewInventoryItemPage() {
  const navigate = useNavigate()

  const handleCreate = async (payload: CreateInventoryItemPayload) => {
    try {
      await createInventoryItem(payload)
      navigate('/inventario')
    } catch {
      navigate('/inventario')
    }
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
              <span className="text-gray-900 font-semibold">Alta de Elemento</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cit-petroleo bg-cit-petroleo/10 px-2.5 py-0.5 rounded-full border border-cit-petroleo/20">
                  Módulo de Inventario
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">
                  Alta de Elemento Científico
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Complete los datos técnicos para registrar un nuevo reactivo, insumo, material o equipo en el CIT Formosa.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate('/inventario')}
                className="gap-1.5 text-xs text-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al listado
              </Button>
            </div>
          </div>

          <InventoryItemForm
            onSubmit={handleCreate}
            onCancel={() => navigate('/inventario')}
          />
        </div>
      </RoleGuard>
    </MainLayout>
  )
}
