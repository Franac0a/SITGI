import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context'
import { canCreateInventory } from '@/utils/rbac'
import { formatApiError } from '@/utils/errors'
import {
  getPedidos,
  createPedido,
  updatePedidoEstado,
} from '@/services/pedidos/pedidos.service'
import type { Pedido, PedidoEstado } from '@/types/scientific.types'

function estadoBadge(estado: PedidoEstado): string {
  switch (estado) {
    case 'Pendiente':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'Aprobado':
      return 'bg-sky-100 text-sky-800 border-sky-200'
    case 'Ingresado':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function PedidosPage() {
  const { user } = useAuth()
  const canManage = canCreateInventory(user?.rol)

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [itemNombre, setItemNombre] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [sector, setSector] = useState('')
  const [responsable, setResponsable] = useState(user?.nombre ?? '')
  const [observaciones, setObservaciones] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPedidos(await getPedidos())
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!itemNombre.trim()) {
      setFormError('El nombre del insumo es obligatorio.')
      return
    }
    if (cantidad === '' || isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
      setFormError('Ingrese una cantidad válida mayor a 0.')
      return
    }
    if (!responsable.trim()) {
      setFormError('El responsable es obligatorio.')
      return
    }

    setSubmitting(true)
    try {
      await createPedido({
        item_nombre: itemNombre.trim(),
        cantidad: Number(cantidad),
        sector: sector.trim() || undefined,
        responsable: responsable.trim(),
        observaciones: observaciones.trim() || undefined,
      })
      setFormSuccess('Pedido registrado con éxito.')
      setItemNombre('')
      setCantidad('')
      setSector('')
      setObservaciones('')
      await fetchData()
    } catch (err) {
      setFormError(formatApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEstado = async (id: number, estado: PedidoEstado) => {
    setError(null)
    try {
      await updatePedidoEstado(id, estado)
      await fetchData()
    } catch (err) {
      setError(formatApiError(err))
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cit-petroleo bg-cit-petroleo/10 px-2.5 py-0.5 rounded-full border border-cit-petroleo/20">
              Reposición
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Pedidos y Reposición
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Circuito de solicitud de insumos desde el sector hacia administración e inventario.
            </p>
          </div>

          <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cerrar formulario' : 'Nuevo Pedido'}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5"
          >
            {formError && (
              <Alert variant="error" title="No se pudo registrar" message={formError} />
            )}
            {formSuccess && <Alert variant="success" message={formSuccess} />}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <Input
                  id="itemNombre"
                  name="itemNombre"
                  label="Insumo solicitado *"
                  placeholder="Ej. Puntas de micropipeta 200 µL"
                  value={itemNombre}
                  onChange={(e) => setItemNombre(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <Input
                id="cantidad"
                name="cantidad"
                type="number"
                min="0.01"
                step="any"
                label="Cantidad *"
                placeholder="0.00"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                disabled={submitting}
              />
              <Input
                id="sector"
                name="sector"
                label="Sector (opcional)"
                placeholder="Ej. Laboratorio de Microbiología"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                disabled={submitting}
              />
              <Input
                id="responsable"
                name="responsable"
                label="Responsable *"
                placeholder="Nombre y apellido"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                disabled={submitting}
              />
              <Input
                id="observaciones"
                name="observaciones"
                label="Observaciones (opcional)"
                placeholder="Urgencia, proveedor sugerido, etc."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" isLoading={submitting} disabled={submitting}>
                Enviar Pedido
              </Button>
            </div>
          </form>
        )}

        {error && (
          <Alert variant="error" title="Error al cargar pedidos" message={error} />
        )}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : pedidos.length === 0 ? (
          <EmptyState
            title="No hay pedidos registrados"
            description="Aún no se han solicitado insumos ni reposiciones."
          />
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-5 py-3.5">Insumo</th>
                  <th className="px-5 py-3.5 text-center">Cantidad</th>
                  <th className="px-5 py-3.5">Sector</th>
                  <th className="px-5 py-3.5">Responsable</th>
                  <th className="px-5 py-3.5 text-center">Estado</th>
                  {canManage && <th className="px-5 py-3.5 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {pedidos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold">
                      {p.item_nombre}
                      {p.observaciones && (
                        <span className="block text-[11px] text-gray-500 font-normal">
                          {p.observaciones}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center font-mono">{p.cantidad}</td>
                    <td className="px-5 py-4 text-gray-700">{p.sector || '—'}</td>
                    <td className="px-5 py-4">{p.responsable}</td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase ${estadoBadge(p.estado)}`}
                      >
                        {p.estado}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {p.estado === 'Pendiente' && (
                          <button
                            type="button"
                            onClick={() => handleEstado(p.id, 'Aprobado')}
                            className="text-cit-petroleo font-bold hover:text-cit-azul-fuerte hover:underline"
                          >
                            Aprobar
                          </button>
                        )}
                        {p.estado === 'Aprobado' && (
                          <button
                            type="button"
                            onClick={() => handleEstado(p.id, 'Ingresado')}
                            className="text-emerald-700 font-bold hover:text-emerald-900 hover:underline"
                          >
                            Marcar Ingresado
                          </button>
                        )}
                      </td>
                    )}
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
