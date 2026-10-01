import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect as Select } from '@/components/ui/native-select'
import { Alert } from '@/components/ui/alert'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context'
import { canCreateInventory } from '@/utils/rbac'
import { formatApiError } from '@/utils/errors'
import {
  getResiduos,
  createResiduo,
  updateResiduo,
} from '@/services/residuos/residuos.service'
import type { Residuo, ResiduoEstado, ResiduoTipo } from '@/types/scientific.types'

const RESIDUO_TIPOS = [
  { value: 'Patológico', label: 'Patológico' },
  { value: 'Químico', label: 'Químico' },
  { value: 'Tóxico', label: 'Tóxico' },
  { value: 'Biológico', label: 'Biológico' },
  { value: 'Otro', label: 'Otro' },
]

function estadoBadge(estado: ResiduoEstado): string {
  return estado === 'Retirado'
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : 'bg-amber-100 text-amber-800 border-amber-200'
}

export function ResiduosPage() {
  const { user } = useAuth()
  const canManage = canCreateInventory(user?.rol)

  const [residuos, setResiduos] = useState<Residuo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [tipo, setTipo] = useState<ResiduoTipo>('Químico')
  const [descripcion, setDescripcion] = useState('')
  const [sector, setSector] = useState('')
  const [responsable, setResponsable] = useState(user?.nombre ?? '')
  const [retiroProgramado, setRetiroProgramado] = useState('')
  const [observaciones, setObservaciones] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setResiduos(await getResiduos())
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

    if (!descripcion.trim()) {
      setFormError('La descripción del residuo es obligatoria.')
      return
    }
    if (!responsable.trim()) {
      setFormError('El responsable es obligatorio.')
      return
    }

    setSubmitting(true)
    try {
      await createResiduo({
        tipo,
        descripcion: descripcion.trim(),
        sector: sector.trim() || undefined,
        responsable: responsable.trim(),
        retiro_programado: retiroProgramado || undefined,
        observaciones: observaciones.trim() || undefined,
      })
      setDescripcion('')
      setSector('')
      setRetiroProgramado('')
      setObservaciones('')
      setShowForm(false)
      await fetchData()
    } catch (err) {
      setFormError(formatApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarcarRetirado = async (id: number) => {
    setError(null)
    try {
      await updateResiduo(id, { estado: 'Retirado' })
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
              Descarte diferenciado
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Residuos Especiales
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Registro de residuos patológicos, químicos, tóxicos y biológicos con retiro programado.
            </p>
          </div>

          {canManage && (
            <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Cerrar formulario' : 'Registrar Residuo'}
            </Button>
          )}
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5"
          >
            {formError && (
              <Alert variant="error" title="No se pudo registrar" message={formError} />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Select
                id="tipo"
                name="tipo"
                label="Tipo de residuo *"
                options={RESIDUO_TIPOS}
                value={tipo}
                onChange={(e) => setTipo(e.target.value as ResiduoTipo)}
                disabled={submitting}
              />
              <div className="lg:col-span-2">
                <Input
                  id="descripcion"
                  name="descripcion"
                  label="Descripción *"
                  placeholder="Ej. Bolsas rojas con material patológico"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <Input
                id="sector"
                name="sector"
                label="Sector (opcional)"
                placeholder="Ej. Biología Molecular"
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
                id="retiroProgramado"
                name="retiroProgramado"
                type="date"
                label="Retiro programado (opcional)"
                value={retiroProgramado}
                onChange={(e) => setRetiroProgramado(e.target.value)}
                disabled={submitting}
              />
            </div>
            <Input
              id="observaciones"
              name="observaciones"
              label="Observaciones (opcional)"
              placeholder="Condiciones de congelamiento, recipiente, etc."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={submitting}
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" isLoading={submitting} disabled={submitting}>
                Guardar Residuo
              </Button>
            </div>
          </form>
        )}

        {error && (
          <Alert variant="error" title="Error al cargar residuos" message={error} />
        )}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : residuos.length === 0 ? (
          <EmptyState
            title="No hay residuos registrados"
            description="Aún no se han registrado residuos especiales con descarte diferenciado."
          />
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-5 py-3.5">Tipo</th>
                  <th className="px-5 py-3.5">Descripción</th>
                  <th className="px-5 py-3.5">Sector</th>
                  <th className="px-5 py-3.5">Responsable</th>
                  <th className="px-5 py-3.5">Retiro programado</th>
                  <th className="px-5 py-3.5 text-center">Estado</th>
                  {canManage && <th className="px-5 py-3.5 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {residuos.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded bg-cit-petroleo/10 border border-cit-petroleo/20 text-cit-petroleo text-[11px] font-semibold">
                        {r.tipo}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold">
                      {r.descripcion}
                      {r.observaciones && (
                        <span className="block text-[11px] text-gray-500 font-normal">
                          {r.observaciones}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{r.sector || '—'}</td>
                    <td className="px-5 py-4">{r.responsable}</td>
                    <td className="px-5 py-4 font-mono text-gray-700">
                      {r.retiro_programado || '—'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase ${estadoBadge(r.estado)}`}
                      >
                        {r.estado}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-5 py-4 text-right">
                        {r.estado === 'Pendiente' && (
                          <button
                            type="button"
                            onClick={() => handleMarcarRetirado(r.id)}
                            className="text-emerald-700 font-bold hover:text-emerald-900 hover:underline"
                          >
                            Marcar Retirado
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
