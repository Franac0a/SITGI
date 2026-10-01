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
  getSectores,
  createSector,
  deleteSector,
} from '@/services/sectores/sectores.service'
import type { Sector } from '@/types/scientific.types'

const SECTOR_TIPOS = [
  { value: 'Laboratorio', label: 'Laboratorio' },
  { value: 'Heladera', label: 'Heladera / Freezer' },
  { value: 'Droguero', label: 'Droguero' },
  { value: 'Estante', label: 'Estante' },
  { value: 'Depósito', label: 'Depósito' },
  { value: 'Otro', label: 'Otro' },
]

export function SectoresPage() {
  const { user } = useAuth()
  const canManage = canCreateInventory(user?.rol)

  const [sectores, setSectores] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState('Laboratorio')
  const [descripcion, setDescripcion] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setSectores(await getSectores())
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
    if (!nombre.trim()) {
      setFormError('El nombre del sector es obligatorio.')
      return
    }
    setSubmitting(true)
    try {
      await createSector({
        nombre: nombre.trim(),
        tipo,
        descripcion: descripcion.trim() || undefined,
      })
      setNombre('')
      setTipo('Laboratorio')
      setDescripcion('')
      setShowForm(false)
      await fetchData()
    } catch (err) {
      setFormError(formatApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    setError(null)
    try {
      await deleteSector(id)
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
              Ubicación
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Ubicación y Sectores
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Laboratorios, heladeras, droguero, estantes y depósitos donde se almacenan los elementos.
            </p>
          </div>

          {canManage && (
            <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Cerrar formulario' : 'Nuevo Sector'}
            </Button>
          )}
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5"
          >
            {formError && (
              <Alert variant="error" title="No se pudo guardar" message={formError} />
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                id="nombre"
                name="nombre"
                label="Nombre del sector *"
                placeholder="Ej. Droguero Estante A"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={submitting}
              />
              <Select
                id="tipo"
                name="tipo"
                label="Tipo *"
                options={SECTOR_TIPOS}
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                disabled={submitting}
              />
              <Input
                id="descripcion"
                name="descripcion"
                label="Descripción (opcional)"
                placeholder="Detalle de la ubicación"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="primary" isLoading={submitting} disabled={submitting}>
                Guardar Sector
              </Button>
            </div>
          </form>
        )}

        {error && (
          <Alert variant="error" title="Error al cargar sectores" message={error} />
        )}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : sectores.length === 0 ? (
          <EmptyState
            title="No hay sectores registrados"
            description="Cargue los laboratorios, heladeras, droguero y estantes del CIT."
          />
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-5 py-3.5">Nombre</th>
                  <th className="px-5 py-3.5">Tipo</th>
                  <th className="px-5 py-3.5">Descripción</th>
                  {canManage && <th className="px-5 py-3.5 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {sectores.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold">{s.nombre}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded bg-cit-petroleo/10 border border-cit-petroleo/20 text-cit-petroleo text-[11px] font-semibold">
                        {s.tipo}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{s.descripcion || '—'}</td>
                    {canManage && (
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id)}
                          className="text-red-600 font-medium hover:text-red-700 hover:underline"
                        >
                          Eliminar
                        </button>
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
