import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Alert } from '@/components/ui/alert'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { formatApiError } from '@/utils/errors'
import { getMuestras } from '@/services/muestras/muestras.service'
import type { Muestra } from '@/types/scientific.types'

const TIPOS = [
  { value: '', label: 'Todas' },
  { value: 'Brucelosis', label: 'Brucelosis' },
  { value: 'Campilobacteriosis', label: 'Campilobacteriosis' },
  { value: 'Anemia Infecciosa Equina', label: 'Anemia Infecciosa Equina' },
]

export function MuestrasPage() {
  const [tipo, setTipo] = useState('')
  const [muestras, setMuestras] = useState<Muestra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setMuestras(await getMuestras(tipo || undefined))
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }, [tipo])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cit-petroleo bg-cit-petroleo/10 px-2.5 py-0.5 rounded-full border border-cit-petroleo/20">
              Diagnóstico
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Muestras y Diagnóstico
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Ingreso de muestras y resultados de Brucelosis, Campilobacteriosis y Anemia Infecciosa Equina.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {TIPOS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTipo(t.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                tipo === t.value
                  ? 'bg-cit-petroleo text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <Alert variant="error" title="Error al cargar muestras" message={error} />
        )}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : muestras.length === 0 ? (
          <EmptyState
            title="No hay muestras registradas"
            description="Ejecutá `npm run import:diagnostico` en el backend para cargar las muestras desde el Excel."
          />
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-5 py-3.5">Fecha</th>
                  <th className="px-5 py-3.5">Ingreso</th>
                  <th className="px-5 py-3.5">Propietario</th>
                  <th className="px-5 py-3.5">Establecimiento</th>
                  <th className="px-5 py-3.5">Especie</th>
                  <th className="px-5 py-3.5 text-center">Muestras</th>
                  <th className="px-5 py-3.5 text-center">Pos.</th>
                  <th className="px-5 py-3.5 text-center">Sosp.</th>
                  <th className="px-5 py-3.5 text-center">Neg.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {muestras.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono whitespace-nowrap">
                      {m.fecha_ingreso || '—'}
                    </td>
                    <td className="px-5 py-4 font-mono">{m.numero_ingreso || '—'}</td>
                    <td className="px-5 py-4 font-bold">{m.propietario || '—'}</td>
                    <td className="px-5 py-4 text-gray-700">{m.establecimiento || '—'}</td>
                    <td className="px-5 py-4">{m.especie || '—'}</td>
                    <td className="px-5 py-4 text-center font-mono">{m.cantidad_muestras}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-red-600">{m.positivos}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-amber-600">{m.sospechosos}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-emerald-700">{m.negativos}</span>
                    </td>
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
