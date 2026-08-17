import { useNavigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { InventoryItemForm } from '@/components/inventory/InventoryItemForm'
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
      console.log('Payload de registro:', payload)
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
                className="hover:text-black hover:underline transition-colors"
              >
                Inventario Científico
              </button>
              <span>/</span>
              <span className="text-black font-semibold">Alta de Elemento</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-bordo-700 bg-bordo-50 px-2 py-0.5 rounded border border-bordo-200">
                  Módulo de Inventario
                </span>
                <h1 className="text-2xl font-bold text-black mt-2">
                  Alta de Elemento Científico
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Complete los datos técnicos para registrar un nuevo reactivo, insumo, material o equipo en el CIT Formosa.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/inventario')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-black transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Volver al listado
              </button>
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
