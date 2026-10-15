import {
  useState,
  useEffect,
  useCallback,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { useSearchParams } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { NativeSelect as Select } from '@/components/ui/native-select'
import { useAuth } from '@/context'
import { allowedMovementTypes } from '@/utils/rbac'
import { getInventoryItems } from '@/services/inventory/inventory.service'
import { getSectores } from '@/services/sectores/sectores.service'
import {
  getMovements,
  registerMovement,
} from '@/services/movements/movements.service'
import { formatApiError } from '@/utils/errors'
import type {
  InventoryItem,
  Movimiento,
  MovementType,
  MovimientoFiltros,
  Sector,
} from '@/types/scientific.types'

const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  Ingreso: 'Ingreso',
  Egreso: 'Egreso (consumo)',
  Reposición: 'Reposición',
  Baja: 'Baja',
  Ajuste: 'Ajuste (conteo físico)',
  Reparación: 'Reparación',
  'Cambio de ubicación': 'Cambio de ubicación',
}

const MOVEMENT_TYPE_HELP: Record<MovementType, string> = {
  Ingreso: 'Suma stock (compra, donación, ingreso al inventario).',
  Egreso: 'Descuenta stock por consumo o uso.',
  Reposición: 'Suma stock por reposición de un pedido.',
  Baja: 'Descuenta stock por rotura, vencimiento o descarte.',
  Ajuste: 'Indicá el stock real contado: reemplaza el stock actual.',
  Reparación: 'Descuenta stock mientras el equipo está en reparación.',
  'Cambio de ubicación': 'No cambia el stock: mueve el elemento a otra ubicación.',
}

interface MovementFormState {
  itemId: string
  tipo_movimiento: MovementType
  cantidad: string
  responsable: string
  sector: string
  nueva_ubicacion: string
  origen_destino: string
  costo_unitario: string
  observaciones: string
}

function itemDisplayName(item: InventoryItem): string {
  const name = item.nombre || item.name || 'Sin nombre'
  const code = item.codigo_identificacion || item.code || ''
  return code ? `${name} (${code})` : name
}

function badgeClasses(tipo: MovementType): string {
  switch (tipo) {
    case 'Ingreso':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'Egreso':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'Ajuste':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'Reparación':
      return 'bg-sky-100 text-sky-800 border-sky-200'
    case 'Reposición':
      return 'bg-teal-100 text-teal-800 border-teal-200'
    case 'Baja':
      return 'bg-rose-100 text-rose-800 border-rose-200'
    case 'Cambio de ubicación':
      return 'bg-violet-100 text-violet-800 border-violet-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function MovementsPage() {
  const { user } = useAuth()
  // Qué tipos puede registrar este rol (espeja la regla del backend).
  const allowedTypes = allowedMovementTypes(user?.rol)
  const canManage = allowedTypes.length > 0
  const movementTypeOptions = allowedTypes.map((t) => ({
    value: t,
    label: MOVEMENT_TYPE_LABELS[t],
  }))
  const [searchParams] = useSearchParams()

  const initialTipo = searchParams.get('tipo') as MovementType | null
  const defaultTipo: MovementType =
    initialTipo && allowedTypes.includes(initialTipo)
      ? initialTipo
      : (allowedTypes[0] ?? 'Egreso')

  const [movements, setMovements] = useState<Movimiento[]>([])
  const [items, setItems] = useState<InventoryItem[]>([])
  const [sectores, setSectores] = useState<Sector[]>([])
  const [filtros, setFiltros] = useState<MovimientoFiltros>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<MovementFormState>({
    itemId: searchParams.get('itemId') ?? '',
    tipo_movimiento: defaultTipo,
    cantidad: '',
    responsable: user?.nombre ?? '',
    sector: '',
    nueva_ubicacion: '',
    origen_destino: '',
    costo_unitario: '',
    observaciones: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [movs, its, secs] = await Promise.all([
        getMovements(filtros),
        getInventoryItems(),
        getSectores().catch(() => [] as Sector[]),
      ])
      setMovements(movs)
      setItems(its)
      setSectores(secs)
    } catch (err: unknown) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }, [filtros])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!form.itemId) {
      setFormError('Debe seleccionar el ítem afectado.')
      return
    }
    const tipo = form.tipo_movimiento
    const cantidadNum = Number(form.cantidad)
    const esAjuste = tipo === 'Ajuste'
    const esCambio = tipo === 'Cambio de ubicación'

    if (esCambio) {
      if (!form.nueva_ubicacion.trim()) {
        setFormError('Indique la nueva ubicación del elemento.')
        return
      }
    } else if (
      form.cantidad === '' ||
      isNaN(cantidadNum) ||
      cantidadNum < 0 ||
      (!esAjuste && cantidadNum === 0)
    ) {
      setFormError(
        esAjuste
          ? 'Ingrese el stock real contado (0 o más).'
          : 'Ingrese una cantidad válida mayor a 0.',
      )
      return
    }

    setSubmitting(true)
    try {
      const respuesta = await registerMovement({
        itemId: form.itemId,
        tipo_movimiento: tipo,
        cantidad: esCambio ? undefined : cantidadNum,
        sector: form.sector.trim() || undefined,
        nueva_ubicacion: esCambio ? form.nueva_ubicacion.trim() : undefined,
        origen_destino: form.origen_destino.trim() || undefined,
        costo_unitario:
          form.costo_unitario !== '' ? Number(form.costo_unitario) : undefined,
        observaciones: form.observaciones.trim() || undefined,
      })

      setFormSuccess(respuesta.mensaje ?? 'Movimiento registrado con éxito.')
      setForm((prev) => ({
        ...prev,
        cantidad: '',
        nueva_ubicacion: '',
        origen_destino: '',
        costo_unitario: '',
        observaciones: '',
      }))
      await fetchData()
    } catch (err: unknown) {
      setFormError(formatApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleFiltro = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFiltros((prev) => ({ ...prev, [name]: value }))
  }
  const hayFiltros = Object.values(filtros).some(Boolean)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cit-petroleo bg-cit-petroleo/10 px-2.5 py-0.5 rounded-full border border-cit-petroleo/20">
              Trazabilidad de Stock
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Stock y Movimientos
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Historial de ingresos, consumos, bajas, reposiciones, ajustes y cambios de ubicación, por elemento, sector y usuario.
            </p>
          </div>

          {canManage && (
          <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
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
            {showForm ? 'Cerrar formulario' : 'Registrar Movimiento'}
          </Button>
          )}
        </div>

        {canManage && showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5"
          >
            {formError && (
              <Alert variant="error" title="No se pudo registrar" message={formError} />
            )}
            {formSuccess && (
              <Alert variant="success" message={formSuccess} />
            )}

            <p className="text-xs text-gray-600 bg-cit-petroleo/5 border border-cit-petroleo/10 rounded-lg px-3 py-2">
              <span className="font-bold">{form.tipo_movimiento}:</span>{' '}
              {MOVEMENT_TYPE_HELP[form.tipo_movimiento]}
              {allowedTypes.length === 1 && (
                <span className="block mt-0.5 text-gray-500">
                  Tu rol puede registrar solo consumos (egresos).
                </span>
              )}
            </p>

            <datalist id="ubicaciones-sugeridas">
              {sectores.map((sec) => (
                <option key={sec.id} value={sec.nombre} />
              ))}
            </datalist>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Select
                id="itemId"
                name="itemId"
                label="Ítem / Reactivo *"
                placeholder="Seleccionar ítem"
                options={items.map((it) => ({
                  value: String(it.id),
                  label: itemDisplayName(it),
                }))}
                value={form.itemId}
                onChange={handleChange}
                disabled={submitting}
              />

              <Select
                id="tipo_movimiento"
                name="tipo_movimiento"
                label="Tipo de movimiento *"
                options={movementTypeOptions}
                value={form.tipo_movimiento}
                onChange={handleChange}
                disabled={submitting}
              />

              {form.tipo_movimiento === 'Cambio de ubicación' ? (
                <Input
                  id="nueva_ubicacion"
                  name="nueva_ubicacion"
                  label="Nueva ubicación *"
                  placeholder="Ej. Heladera 2, Estante B"
                  list="ubicaciones-sugeridas"
                  value={form.nueva_ubicacion}
                  onChange={handleChange}
                  disabled={submitting}
                />
              ) : (
                <Input
                  id="cantidad"
                  name="cantidad"
                  type="number"
                  min={form.tipo_movimiento === 'Ajuste' ? '0' : '0.01'}
                  step="any"
                  label={
                    form.tipo_movimiento === 'Ajuste'
                      ? 'Stock real contado *'
                      : 'Cantidad *'
                  }
                  placeholder="0.00"
                  value={form.cantidad}
                  onChange={handleChange}
                  disabled={submitting}
                />
              )}

              <Select
                id="sector"
                name="sector"
                label="Sector (opcional)"
                placeholder="Sin sector"
                options={sectores.map((sec) => ({
                  value: sec.nombre,
                  label: sec.nombre,
                }))}
                value={form.sector}
                onChange={handleChange}
                disabled={submitting}
              />

              <Input
                id="responsable"
                name="responsable"
                label="Responsable (usuario actual)"
                value={form.responsable}
                readOnly
                disabled
              />

              <Input
                id="origen_destino"
                name="origen_destino"
                label="Origen / Destino (opcional)"
                placeholder="Ej. INTA Mercedes, proveedor"
                value={form.origen_destino}
                onChange={handleChange}
                disabled={submitting}
              />

              <Input
                id="costo_unitario"
                name="costo_unitario"
                type="number"
                min="0"
                step="any"
                label="Costo unitario (opcional)"
                placeholder="0.00"
                value={form.costo_unitario}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div>
              <label
                htmlFor="observaciones"
                className="block text-sm font-medium text-gray-800 mb-1.5"
              >
                Observaciones (opcional)
              </label>
              <textarea
                id="observaciones"
                name="observaciones"
                rows={2}
                value={form.observaciones}
                onChange={handleChange}
                placeholder="Motivo del movimiento, paciente, tratamiento, etc."
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cit-turquesa focus:border-cit-turquesa transition-all duration-150"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" isLoading={submitting} disabled={submitting}>
                Guardar Movimiento
              </Button>
            </div>
          </form>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <Select
              id="filtro-sector"
              name="sector"
              label="Sector"
              placeholder="Todos"
              options={sectores.map((sec) => ({
                value: sec.nombre,
                label: sec.nombre,
              }))}
              value={filtros.sector ?? ''}
              onChange={handleFiltro}
            />
            <Select
              id="filtro-tipo"
              name="tipo"
              label="Tipo"
              placeholder="Todos"
              options={Object.entries(MOVEMENT_TYPE_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
              value={filtros.tipo ?? ''}
              onChange={handleFiltro}
            />
            <Input
              id="filtro-responsable"
              name="responsable"
              label="Usuario"
              placeholder="Nombre"
              value={filtros.responsable ?? ''}
              onChange={handleFiltro}
            />
            <Input
              id="filtro-desde"
              name="desde"
              type="date"
              label="Desde"
              value={filtros.desde ?? ''}
              onChange={handleFiltro}
            />
            <Input
              id="filtro-hasta"
              name="hasta"
              type="date"
              label="Hasta"
              value={filtros.hasta ?? ''}
              onChange={handleFiltro}
            />
          </div>
          {hayFiltros && (
            <button
              type="button"
              onClick={() => setFiltros({})}
              className="mt-3 text-xs font-semibold text-cit-petroleo hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {error && (
          <Alert variant="error" title="Error al cargar movimientos" message={error} />
        )}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : movements.length === 0 ? (
          <EmptyState
            title={hayFiltros ? 'Sin resultados para esos filtros' : 'No hay movimientos registrados'}
            description={
              hayFiltros
                ? 'Probá con otro sector, tipo, usuario o período.'
                : 'Aún no se han asentado ingresos, egresos ni ajustes en el registro de trazabilidad.'
            }
            action={
              canManage ? (
                <Button variant="primary" onClick={() => setShowForm(true)}>
                  Registrar Primer Movimiento
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-5 py-3.5">Fecha</th>
                  <th className="px-5 py-3.5">Tipo</th>
                  <th className="px-5 py-3.5">Ítem / Reactivo</th>
                  <th className="px-5 py-3.5 text-center">Cantidad</th>
                  <th className="px-5 py-3.5">Sector</th>
                  <th className="px-5 py-3.5">Responsable</th>
                  <th className="px-5 py-3.5">Origen / Destino</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {movements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono whitespace-nowrap">
                      {mov.fecha_movimiento || mov.createdAt?.slice(0, 10) || '---'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase ${badgeClasses(mov.tipo_movimiento)}`}
                      >
                        {mov.tipo_movimiento}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold">
                      {mov.Item?.nombre || `Ítem #${mov.itemId}`}
                      {mov.Item?.codigo_identificacion && (
                        <span className="block text-[11px] text-gray-500 font-normal font-mono">
                          {mov.Item.codigo_identificacion}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center font-mono">
                      <span className="font-bold text-cit-petroleo">
                        {mov.tipo_movimiento === 'Cambio de ubicación'
                          ? '—'
                          : `${mov.cantidad}${mov.Item?.unidad_medida ? ` ${mov.Item.unidad_medida}` : ''}`}
                      </span>
                    </td>
                    <td className="px-5 py-4">{mov.sector || '---'}</td>
                    <td className="px-5 py-4">{mov.responsable}</td>
                    <td className="px-5 py-4 text-gray-700">{mov.origen_destino || '---'}</td>
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
