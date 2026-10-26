import { useEffect, useState, type ChangeEvent } from 'react'
import { PlantillaPrincipal } from '@/componentes/plantilla/PlantillaPrincipal'
import { Boton } from '@/componentes/ui/Boton'
import { CampoTexto } from '@/componentes/ui/CampoTexto'
import { EncabezadoPagina } from '@/componentes/ui/EncabezadoPagina'
import { Esqueleto } from '@/componentes/ui/Esqueleto'
import { EstadoVacio } from '@/componentes/ui/EstadoVacio'
import { Insignia, type Color } from '@/componentes/ui/Insignia'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { Selector } from '@/componentes/ui/Selector'
import { obtenerItems } from '@/servicios/items'
import {
  exportarInventario,
  exportarMovimientos,
  obtenerAlertas,
  obtenerConsumoPorSector,
  obtenerRotacion,
} from '@/servicios/reportes'
import { obtenerSectores } from '@/servicios/sectores'
import type { Alerta, ConsumoSector, FilaRotacion, FiltrosReporte, Sector, TipoAlerta } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'
import { formatearFecha } from '@/utilidades/fechas'

const ALERTAS: Record<TipoAlerta, { texto: string; color: Color }> = {
  agotado: { texto: 'Agotado', color: 'rojo' },
  stock_bajo: { texto: 'Stock bajo', color: 'ambar' },
  vencido: { texto: 'Vencido', color: 'rojo' },
  proximo_vencimiento: { texto: 'Vence pronto', color: 'celeste' },
}

const PERIODOS = [
  { valor: '7', texto: 'Últimos 7 días' },
  { valor: '30', texto: 'Últimos 30 días' },
  { valor: '90', texto: 'Últimos 90 días' },
]

// Texto de la alerta: el stock si es por cantidad, o la fecha si es por vencimiento.
function detalleDeAlerta(alerta: Alerta): string {
  const item = alerta.item
  if (alerta.tipo === 'agotado' || alerta.tipo === 'stock_bajo') {
    return `Stock actual: ${item.stock_actual} (mínimo ${item.stock_minimo})`
  }
  return `Vencimiento: ${formatearFecha(item.detalles_tecnicos.fechaVencimiento)}`
}

export default function PaginaReportes() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [rotacion, setRotacion] = useState<FilaRotacion[]>([])
  const [consumoPorSector, setConsumoPorSector] = useState<ConsumoSector[]>([])
  // Período (en días) de la alta rotación y del consumo por sector.
  const [dias, setDias] = useState(30)
  const [categorias, setCategorias] = useState<string[]>([])
  const [sectores, setSectores] = useState<Sector[]>([])
  const [filtros, setFiltros] = useState<FiltrosReporte>({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  // Qué exportación se está descargando (null = ninguna).
  const [exportando, setExportando] = useState<'inventario' | 'movimientos' | null>(null)
  const [errorExportar, setErrorExportar] = useState('')

  // Se carga al entrar y cada vez que se elige otro período de rotación.
  useEffect(() => {
    async function cargarDatos() {
      setCargando(true)
      setError('')
      try {
        const [listaAlertas, filasRotacion, consumos, items, listaSectores] = await Promise.all([
          obtenerAlertas(),
          obtenerRotacion(dias),
          obtenerConsumoPorSector(dias),
          obtenerItems().catch(() => []),
          obtenerSectores().catch(() => []),
        ])
        setAlertas(listaAlertas)
        setRotacion(filasRotacion)
        setConsumoPorSector(consumos)
        setSectores(listaSectores)
        // Categorías sin repetir y ordenadas, para el filtro.
        setCategorias([...new Set(items.map((item) => item.categoria))].sort())
      } catch (e) {
        setError(mensajeDeError(e))
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [dias])

  function cambiarFiltro(evento: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFiltros({ ...filtros, [evento.target.name]: evento.target.value })
  }

  async function exportar(tipo: 'inventario' | 'movimientos') {
    setExportando(tipo)
    setErrorExportar('')
    try {
      if (tipo === 'inventario') {
        await exportarInventario(filtros)
      } else {
        await exportarMovimientos(filtros)
      }
    } catch (e) {
      setErrorExportar(mensajeDeError(e))
    } finally {
      setExportando(null)
    }
  }

  return (
    <PlantillaPrincipal>
      <div className="space-y-6">
        <EncabezadoPagina
          etiqueta="Auditoría y Notificaciones"
          titulo="Alertas y Reportes"
          descripcion="Monitoreo de stock mínimo, vencimientos y exportación de informes del CIT."
        />

        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Exportar informes</h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Filtrá por categoría, sector o período y descargá el CSV (se abre directo en Excel). El período se aplica
              a los movimientos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <Selector
              id="rep-categoria"
              name="categoria"
              etiqueta="Categoría"
              textoVacio="Todas"
              opciones={categorias.map((c) => ({ valor: c, texto: c }))}
              value={filtros.categoria ?? ''}
              onChange={cambiarFiltro}
            />
            <Selector
              id="rep-sector"
              name="sector"
              etiqueta="Sector"
              textoVacio="Todos"
              opciones={sectores.map((s) => ({ valor: s.nombre, texto: s.nombre }))}
              value={filtros.sector ?? ''}
              onChange={cambiarFiltro}
            />
            <CampoTexto
              id="rep-desde"
              name="desde"
              type="date"
              etiqueta="Desde"
              value={filtros.desde ?? ''}
              onChange={cambiarFiltro}
            />
            <CampoTexto
              id="rep-hasta"
              name="hasta"
              type="date"
              etiqueta="Hasta"
              value={filtros.hasta ?? ''}
              onChange={cambiarFiltro}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Boton
              onClick={() => exportar('inventario')}
              cargando={exportando === 'inventario'}
              disabled={exportando !== null}
            >
              Exportar inventario (CSV)
            </Boton>
            <Boton
              onClick={() => exportar('movimientos')}
              cargando={exportando === 'movimientos'}
              disabled={exportando !== null}
            >
              Exportar movimientos (CSV)
            </Boton>
          </div>
        </section>

        {errorExportar && <Mensaje tipo="error" titulo="Error al exportar" texto={errorExportar} />}

        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Alta rotación</h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Elementos con más consumo (egresos, bajas y reparaciones) en el período.
              </p>
            </div>
            <div className="w-40">
              <Selector
                id="rep-dias"
                name="dias"
                etiqueta="Período"
                textoVacio="Período"
                opciones={PERIODOS}
                value={String(dias)}
                onChange={(e) => setDias(Number(e.target.value) || 30)}
              />
            </div>
          </div>

          {rotacion.length === 0 ? (
            <p className="text-sm text-gray-500">Todavía no hay consumos registrados en este período.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
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
                    {rotacion.map((fila) => (
                      <tr key={fila.itemId}>
                        <td className="px-4 py-3 font-bold">
                          {fila.nombre}
                          {fila.codigo_identificacion && (
                            <span className="block text-[11px] text-gray-500 font-normal font-mono">
                              {fila.codigo_identificacion}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-mono">
                          {fila.consumo} {fila.unidad_medida ?? ''}
                        </td>
                        <td className="px-4 py-3 text-center font-mono">{fila.movimientos}</td>
                        <td className="px-4 py-3 text-center font-mono">{fila.stock_actual}</td>
                        <td className="px-4 py-3 text-center font-mono">
                          {fila.dias_cobertura === null ? '—' : `${fila.dias_cobertura} días`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Consumo por sector</h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Consumos (egresos, bajas y reparaciones) de los últimos {dias} días, según el sector donde se
              registraron. El período es el mismo elegido en Alta rotación.
            </p>
          </div>

          {consumoPorSector.length === 0 ? (
            <p className="text-sm text-gray-500">Todavía no hay consumos registrados en este período.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                  <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Sector</th>
                      <th className="px-4 py-3 text-center">Consumos</th>
                      <th className="px-4 py-3 text-center">Elementos distintos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-900">
                    {consumoPorSector.map((fila) => (
                      <tr key={fila.sector ?? 'sin-sector'}>
                        <td className="px-4 py-3 font-bold">
                          {fila.sector ?? <span className="font-normal text-gray-500">Sin sector</span>}
                        </td>
                        <td className="px-4 py-3 text-center font-mono">{fila.consumos}</td>
                        <td className="px-4 py-3 text-center font-mono">{fila.elementos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {error && <Mensaje tipo="error" titulo="Error al cargar alertas" texto={error} />}

        {cargando ? (
          <div className="space-y-3">
            <Esqueleto className="h-20 w-full rounded-xl" />
            <Esqueleto className="h-20 w-full rounded-xl" />
          </div>
        ) : alertas.length === 0 ? (
          <EstadoVacio
            titulo="No hay alertas pendientes"
            descripcion="El sistema no registra stock crítico ni vencimientos inminentes."
          />
        ) : (
          <div className="space-y-3">
            {alertas.map((alerta) => (
              // Un ítem puede tener dos alertas (por stock y por vencimiento), por eso la clave usa el tipo.
              <div
                key={`${alerta.tipo}-${alerta.item.id}`}
                className="p-4 rounded-xl border border-gray-200 bg-white flex items-start justify-between gap-4 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <Insignia color={ALERTAS[alerta.tipo].color} className="mt-0.5">
                    {ALERTAS[alerta.tipo].texto}
                  </Insignia>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {alerta.item.nombre}
                      {alerta.item.codigo_identificacion && (
                        <span className="ml-2 font-mono text-xs text-gray-400">{alerta.item.codigo_identificacion}</span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">{detalleDeAlerta(alerta)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PlantillaPrincipal>
  )
}
