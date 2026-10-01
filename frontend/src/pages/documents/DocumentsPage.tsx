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
  getDocumentos,
  uploadDocumento,
  deleteDocumento,
  getDocumentoDownloadUrl,
} from '@/services/documentos/documentos.service'
import type { Documento, DocumentoCategoria } from '@/types/scientific.types'

const CATEGORIAS = [
  { value: 'MSDS', label: 'MSDS (Hoja de seguridad)' },
  { value: 'SOP', label: 'SOP (Protocolo operativo)' },
  { value: 'COA', label: 'COA (Certificado de análisis)' },
  { value: 'Protocolo', label: 'Protocolo' },
  { value: 'Otro', label: 'Otro' },
]

function formatoTamano(bytes?: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentsPage() {
  const { user } = useAuth()
  const canManage = canCreateInventory(user?.rol)

  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const [titulo, setTitulo] = useState('')
  const [categoria, setCategoria] = useState<DocumentoCategoria>('MSDS')
  const [codigo, setCodigo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setDocumentos(await getDocumentos())
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

    if (!titulo.trim()) {
      setFormError('El título es obligatorio.')
      return
    }

    setSubmitting(true)
    try {
      await uploadDocumento({
        titulo: titulo.trim(),
        categoria,
        codigo: codigo.trim() || undefined,
        descripcion: descripcion.trim() || undefined,
        archivo: archivo ?? undefined,
      })
      setFormSuccess('Documento cargado con éxito.')
      setTitulo('')
      setCodigo('')
      setDescripcion('')
      setArchivo(null)
      setShowForm(false)
      await fetchData()
    } catch (err) {
      setFormError(formatApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este documento?')) return
    setError(null)
    try {
      await deleteDocumento(id)
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
              Control Documental
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Documentos Asociados
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Repositorio de hojas de seguridad (MSDS), protocolos (SOP), certificados (COA) y remitos.
            </p>
          </div>

          <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cerrar formulario' : 'Subir Documento'}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5"
          >
            {formError && (
              <Alert variant="error" title="No se pudo cargar" message={formError} />
            )}
            {formSuccess && <Alert variant="success" message={formSuccess} />}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <Input
                  id="titulo"
                  name="titulo"
                  label="Título *"
                  placeholder="Ej. Hoja de seguridad Ácido Clorhídrico"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <Select
                id="categoria"
                name="categoria"
                label="Categoría *"
                options={CATEGORIAS}
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as DocumentoCategoria)}
                disabled={submitting}
              />
              <Input
                id="codigo"
                name="codigo"
                label="Código (opcional)"
                placeholder="Ej. MSDS-001"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                disabled={submitting}
              />
              <Input
                id="descripcion"
                name="descripcion"
                label="Descripción (opcional)"
                placeholder="Detalle del documento"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={submitting}
              />
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  Archivo (opcional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                  disabled={submitting}
                  className="w-full text-sm text-gray-700 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-cit-petroleo/10 file:text-cit-petroleo file:font-semibold hover:file:bg-cit-petroleo/20"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" isLoading={submitting} disabled={submitting}>
                Cargar Documento
              </Button>
            </div>
          </form>
        )}

        {error && (
          <Alert variant="error" title="Error al cargar documentos" message={error} />
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : documentos.length === 0 ? (
          <EmptyState
            title="No hay documentos"
            description="El repositorio documental está vacío. Cargue hojas de seguridad, protocolos o certificados."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentos.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-xl border border-gray-200 bg-white flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cit-petroleo/10 text-cit-petroleo border border-cit-petroleo/20 uppercase">
                    {doc.categoria}
                  </span>
                  <h3 className="font-bold text-gray-900 text-base mt-2">{doc.titulo}</h3>
                  {doc.codigo && (
                    <p className="text-xs font-mono text-gray-400 mt-0.5">{doc.codigo}</p>
                  )}
                  {doc.descripcion && (
                    <p className="text-xs text-gray-600 mt-1">{doc.descripcion}</p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                  <span className="font-mono text-gray-500">
                    {doc.nombre_archivo ? `${formatoTamano(doc.tamano)}` : 'Sin archivo'}
                  </span>
                  <div className="flex items-center gap-3">
                    {doc.nombre_archivo && (
                      <a
                        href={getDocumentoDownloadUrl(doc.id)}
                        className="text-cit-petroleo font-bold hover:text-cit-azul-fuerte hover:underline"
                      >
                        Descargar
                      </a>
                    )}
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 font-medium hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
