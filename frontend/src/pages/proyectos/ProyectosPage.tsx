import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect as Select } from '@/components/ui/native-select'
import { Alert } from '@/components/ui/alert'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context'
import { canManageUsers } from '@/utils/rbac'
import { formatApiError } from '@/utils/errors'
import {
  getProyectos,
  createProyecto,
  updateProyecto,
  deleteProyecto,
} from '@/services/proyectos/proyectos.service'
import type { Proyecto, ProyectoEstado } from '@/types/scientific.types'

const ESTADOS = [
  { value: 'En ejecución', label: 'En ejecución' },
  { value: 'Finalizado', label: 'Finalizado' },
  { value: 'Suspendido', label: 'Suspendido' },
]

function estadoBadge(estado: ProyectoEstado): string {
  switch (estado) {
    case 'En ejecución':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'Finalizado':
      return 'bg-gray-200 text-gray-700 border-gray-300'
    case 'Suspendido':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function ProyectosPage() {
  const { user } = useAuth()
  const canManage = canManageUsers(user?.rol)

  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [codigo, setCodigo] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [director, setDirector] = useState('')
  const [estado, setEstado] = useState<ProyectoEstado>('En ejecución')
  const [fechaInicio, setFechaInicio] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProyectos(await getProyectos())
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
    if (!titulo.trim()) {
      setFormError('El título del proyecto es obligatorio.')
      return
    }
    setSubmitting(true)
    try {
      await createProyecto({
        codigo: codigo.trim() || undefined,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        director: director.trim() || undefined,
        estado,
        fecha_inicio: fechaInicio || undefined,
      })
      setCodigo('')
      setTitulo('')
      setDescripcion('')
      setDirector('')
      setFechaInicio('')
      setShowForm(false)
      await fetchData()
    } catch (err) {
      setFormError(formatApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEstado = async (id: number, nuevoEstado: ProyectoEstado) => {
    setError(null)
    try {
      await updateProyecto(id, { estado: nuevoEstado })
      await fetchData()
    } catch (err) {
      setError(formatApiError(err))
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este proyecto?')) return
    setError(null)
    try {
      await deleteProyecto(id)
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
              Líneas de investigación
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Proyectos de Investigación
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Administración de proyectos científicos y seguimiento de consumo de insumos.
            </p>
          </div>

          {canManage && (
            <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Cerrar formulario' : 'Nuevo Proyecto'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Input
                id="titulo"
                name="titulo"
                label="Título *"
                placeholder="Ej. Brucelosis bovina"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={submitting}
              />
              <Input
                id="codigo"
                name="codigo"
                label="Código (opcional)"
                placeholder="Ej. PROY-001"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                disabled={submitting}
              />
              <Input
                id="director"
                name="director"
                label="Director (opcional)"
                placeholder="Nombre del director"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                disabled={submitting}
              />
              <Select
                id="estado"
                name="estado"
                label="Estado"
                options={ESTADOS}
                value={estado}
                onChange={(e) => setEstado(e.target.value as ProyectoEstado)}
                disabled={submitting}
              />
              <Input
                id="fechaInicio"
                name="fechaInicio"
                type="date"
                label="Fecha de inicio (opcional)"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                disabled={submitting}
              />
              <Input
                id="descripcion"
                name="descripcion"
                label="Descripción (opcional)"
                placeholder="Objetivo del proyecto"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="primary" isLoading={submitting} disabled={submitting}>
                Guardar Proyecto
              </Button>
            </div>
          </form>
        )}

        {error && (
          <Alert variant="error" title="Error al cargar proyectos" message={error} />
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
          </div>
        ) : proyectos.length === 0 ? (
          <EmptyState
            title="No hay proyectos registrados"
            description="No se han cargado líneas de investigación activas."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {proyectos.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-xl border border-gray-200 bg-white shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    {p.codigo && (
                      <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-cit-petroleo/10 text-cit-petroleo border border-cit-petroleo/20">
                        {p.codigo}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-gray-900 mt-2">{p.titulo}</h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${estadoBadge(p.estado)}`}
                  >
                    {p.estado}
                  </span>
                </div>
                {p.descripcion && (
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">{p.descripcion}</p>
                )}
                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {p.director ? (
                      <>
                        Director: <strong className="text-gray-900">{p.director}</strong>
                      </>
                    ) : (
                      'Sin director asignado'
                    )}
                  </span>
                  {canManage && (
                    <span className="flex items-center gap-3">
                      {p.estado !== 'Finalizado' && (
                        <button
                          type="button"
                          onClick={() => handleEstado(p.id, 'Finalizado')}
                          className="text-cit-petroleo font-bold hover:underline"
                        >
                          Finalizar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 font-medium hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
