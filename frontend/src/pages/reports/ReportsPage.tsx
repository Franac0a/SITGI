import { useState, useEffect, useCallback, type ChangeEvent } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/ui/alert'
import { formatApiError } from '@/utils/errors'
import { Input } from '@/components/ui/input'
import { NativeSelect as Select } from '@/components/ui/native-select'
import { getInventoryItems } from '@/services/inventory/inventory.service'
import { getSectores } from '@/services/sectores/sectores.service'
import {
  getAlertas,
  getRotacion,
  exportInventarioCsv,
  exportMovimientosCsv,
} from '@/services/reportes/reportes.service'
import type {
  AlertaTipo,
  ReporteAlerta,
  ReporteFiltros,
  RotacionItem,
  Sector,
} from '@/types/scientific.types'

function alertaInfo(tipo: AlertaTipo): { label: string; badge: string } {
  switch (tipo) {
    case 'agotado':
      return {
        label: 'Agotado',
        badge: 'bg-red-100 text-red-700 border-red-200',
      }
    case 'stock_bajo':
      return {
        label: 'Stock bajo',
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
      }
    case 'vencido':
      return {
        label: 'Vencido',
        badge: 'bg-red-100 text-red-700 border-red-200',
      }
    case 'proximo_vencimiento':
      return {
        label: 'Vence pronto',
        badge: 'bg-sky-100 text-sky-800 border-sky-200',
      }
    default:
      return {
        label: 'Alerta',
        badge: 'bg-gray-100 text-gray-800 border-gray-200',
      }
  }
}

export function ReportsPage() {
  const [alertas, setAlertas] = useState<ReporteAlerta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState<'inventario' | 'movimientos' | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<ReporteFiltros>({})
  const [categorias, setCategorias] = useState<string[]>([])
  const [sectores, setSectores] = useState<Sector[]>([])
  const [rotacion, setRotacion] = useState<RotacionItem[]>([])
  const [diasRotacion, setDiasRotacion] = useState(30)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [alertasData, rot, items, secs] = await Promise.all([
        getAlertas(),
        getRotacion(diasRotacion),
        getInventoryItems().catch(() => []),
        getSectores().catch(() => [] as Sector[]),
      ])
      setAlertas(alertasData)
      setRotacion(rot.rotacion)
      setSectores(secs)
      setCategorias(
        Array.from(
          new Set(
            items
              .map((it) => it.categoria || it.category || '')
              .filter((c): c is string => Boolean(c)),
          ),
        ).sort(),
      )
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }, [diasRotacion])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFiltro = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFiltros((prev) => ({ ...prev, [name]: value }))
  }

  const handleExport = async (tipo: 'inventario' | 'movimientos') => {
    setExporting(tipo)
    setExportError(null)
    try {
      if (tipo === 'inventario') await exportInventarioCsv(filtros)
      else await exportMovimientosCsv(filtros)
    } catch (err) {
      setExportError(formatApiError(err))
    } finally {
      setExporting(null)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cit-petroleo bg-cit-petroleo/10 px-2.5 py-0.5 rounded-full border border-cit-petroleo/20">
              Auditoría y Notificaciones
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Alertas y Reportes
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Monitoreo de stock mínimo, vencimientos y exportación de informes del CIT.
            </p>
          </div>

        </div>

        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Exportar informes</h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Filtrá por categoría, sector o período y descargá el CSV (se abre directo en Excel).
              El período se aplica a los movimientos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <Select
              id="rep-categoria"
              name="categoria"
              label="Categoría"
              placeholder="Todas"
              options={categorias.map((c) => ({ value: c, label: c }))}
              value={filtros.categoria ?? ''}
              onChange={handleFiltro}
            />
            <Select
              id="rep-sector"
              name="sector"
              label="Sector"
              placeholder="Todos"
              options={sectores.map((sec) => ({ value: sec.nombre, label: sec.nombre }))}
              value={filtros.sector ?? ''}
              onChange={handleFiltro}
            />
            <Input
              id="rep-desde"
              name="desde"
              type="date"
              label="Desde"
              value={filtros.desde ?? ''}
              onChange={handleFiltro}
            />
            <Input
              id="rep-hasta"
              name="hasta"
              type="date"
              label="Hasta"
              value={filtros.hasta ?? ''}
              onChange={handleFiltro}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => handleExport('inventario')}
              isLoading={exporting === 'inventario'}
              disabled={exporting !== null}
            >
              Exportar inventario (CSV)
            </Button>
            <Button
              variant="primary"
              onClick={() => handleExport('movimientos')}
              isLoading={exporting === 'movimientos'}
              disabled={exporting !== null}
            >
              Exportar movimientos (CSV)
            </Button>
          </div>
        </section>

        {exportError && (
          <Alert variant="error" title="Error al exportar" message={exportError} />
        )}

        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Alta rotación</h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Elementos con más consumo (egresos, bajas y reparaciones) en el período.
              </p>
            </div>
            <div className="w-40">
              <Select
                id="rep-dias"
                name="dias"
                label="Período"
                placeholder="Período"
                options={[
                  { value: '7', label: 'Últimos 7 días' },
                  { value: '30', label: 'Últimos 30 días' },
                  { value: '90', label: 'Últimos 90 días' },
                ]}
                value={String(diasRotacion)}
                onChange={(e) => setDiasRotacion(Number(e.target.value) || 30)}
              />
            </div>
          </div>

          {rotacion.length === 0 ? (
            <p className="text-sm text-gray-500">
              Todavía no hay consumos registrados en este período.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Elemento</th>
                    <th className="px-4 py-3 text-center">Consumo</th>
                    <th className="px-4 py-3 text-center">Movimientos</th>
                    <th className="px-4 py-3 text-center">Stock actual</th>
                    <th className="px-4 py-3 text-center">Cobertura estimada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {rotacion.map((r) => (
                    <tr key={r.itemId}>
                      <td className="px-4 py-3 font-bold">
                        {r.nombre}
                        {r.codigo_identificacion && (
                          <span className="block text-[11px] text-gray-500 font-normal font-mono">
                            {r.codigo_identificacion}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        {r.consumo} {r.unidad_medida ?? ''}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">{r.movimientos}</td>
                      <td className="px-4 py-3 text-center font-mono">{r.stock_actual}</td>
                      <td className="px-4 py-3 text-center font-mono">
                        {r.dias_cobertura === null ? '—' : `${r.dias_cobertura} días`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {error && (
          <Alert variant="error" title="Error al cargar alertas" message={error} />
        )}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : alertas.length === 0 ? (
          <EmptyState
            title="No hay alertas pendientes"
            description="El sistema no registra stock crítico ni vencimientos inminentes."
          />
        ) : (
          <div className="space-y-3">
            {alertas.map((alerta, index) => {
              const info = alertaInfo(alerta.tipo)
              const item = alerta.item
              const venc =
                item.detalles_tecnicos?.fechaVencimiento || item.fechaVencimiento
              const detalle =
                alerta.tipo === 'agotado' || alerta.tipo === 'stock_bajo'
                  ? `Stock actual: ${item.stock_actual ?? 0} (mínimo ${item.stock_minimo ?? 0})`
                  : `Vencimiento: ${venc || '—'}`

              return (
                <div
                  key={`${alerta.tipo}-${item.id}-${index}`}
                  className="p-4 rounded-xl border border-gray-200 bg-white flex items-start justify-between gap-4 shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase ${info.badge}`}
                    >
                      {info.label}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        {item.nombre || item.name || 'Sin nombre'}
                        {item.codigo_identificacion && (
                          <span className="ml-2 font-mono text-xs text-gray-400">
                            {item.codigo_identificacion}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">{detalle}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
