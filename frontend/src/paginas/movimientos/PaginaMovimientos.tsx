import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PlantillaPrincipal } from '@/componentes/plantilla/PlantillaPrincipal'
import { Boton } from '@/componentes/ui/Boton'
import { EncabezadoPagina } from '@/componentes/ui/EncabezadoPagina'
import { CargandoTabla } from '@/componentes/ui/Esqueleto'
import { EstadoVacio } from '@/componentes/ui/EstadoVacio'
import { Insignia } from '@/componentes/ui/Insignia'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { Paginacion } from '@/componentes/ui/Paginacion'
import { usePaginacion } from '@/componentes/ui/usePaginacion'
import { useSesion } from '@/contexto/useSesion'
import { obtenerItems } from '@/servicios/items'
import { obtenerMovimientos } from '@/servicios/movimientos'
import { obtenerSectores } from '@/servicios/sectores'
import type { FiltrosMovimientos as Filtros, Item, Movimiento, Sector, TipoMovimiento } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'
import { formatearFecha } from '@/utilidades/fechas'
import { tiposDeMovimientoPermitidos } from '@/utilidades/permisos'
import { FiltrosMovimientos } from './FiltrosMovimientos'
import { FormularioMovimiento } from './FormularioMovimiento'
import { COLOR_TIPO } from './tiposMovimiento'

export default function PaginaMovimientos() {
  const { usuario } = useSesion()
  const tiposPermitidos = tiposDeMovimientoPermitidos(usuario?.rol)
  const puedeRegistrar = tiposPermitidos.length > 0

  // Desde el inventario se llega con ?itemId=...&tipo=Egreso (Retiro) o &tipo=Ajuste
  // (editar ítem): en ese caso el formulario se abre ya completado.
  const [parametros] = useSearchParams()
  const tipoDeLaUrl = parametros.get('tipo') as TipoMovimiento
  const tipoInicial = tiposPermitidos.includes(tipoDeLaUrl) ? tipoDeLaUrl : (tiposPermitidos[0] ?? 'Egreso')

  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [sectores, setSectores] = useState<Sector[]>([])
  const [filtros, setFiltros] = useState<Filtros>({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(parametros.has('itemId'))
  const paginacion = usePaginacion(movimientos)
  // Se suma 1 cada vez que se registra un movimiento, para que se vuelva a cargar la lista.
  const [recargas, setRecargas] = useState(0)

  // Se carga al entrar, al cambiar un filtro y después de registrar un movimiento.
  useEffect(() => {
    async function cargarDatos() {
      setCargando(true)
      setError('')
      try {
        // Las tres consultas se hacen al mismo tiempo.
        const [listaMovimientos, listaItems, listaSectores] = await Promise.all([
          obtenerMovimientos(filtros),
          obtenerItems(),
          obtenerSectores().catch(() => []),
        ])
        setMovimientos(listaMovimientos)
        setItems(listaItems)
        setSectores(listaSectores)
      } catch (e) {
        setError(mensajeDeError(e))
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [filtros, recargas])

  const hayFiltros = Object.values(filtros).some(Boolean)

  return (
    <PlantillaPrincipal>
      <div className="space-y-6">
        <EncabezadoPagina
          etiqueta="Trazabilidad de Stock"
          titulo="Stock y Movimientos"
          descripcion="Historial de ingresos, consumos, bajas, reposiciones, ajustes y cambios de ubicación, por elemento, sector y usuario."
        >
          {puedeRegistrar && (
            <Boton onClick={() => setMostrarFormulario(!mostrarFormulario)}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              {mostrarFormulario ? 'Cerrar formulario' : 'Registrar Movimiento'}
            </Boton>
          )}
        </EncabezadoPagina>

        {puedeRegistrar && mostrarFormulario && (
          <FormularioMovimiento
            items={items}
            sectores={sectores}
            tiposPermitidos={tiposPermitidos}
            responsable={usuario?.nombre ?? ''}
            itemInicial={parametros.get('itemId') ?? ''}
            tipoInicial={tipoInicial}
            alGuardar={() => setRecargas(recargas + 1)}
          />
        )}

        <FiltrosMovimientos
          filtros={filtros}
          sectores={sectores}
          alCambiar={(nuevos) => {
            setFiltros(nuevos)
            paginacion.volverAlInicio()
          }}
        />

        {error && <Mensaje tipo="error" titulo="Error al cargar movimientos" texto={error} />}

        {cargando ? (
          <CargandoTabla filas={2} />
        ) : movimientos.length === 0 ? (
          <EstadoVacio
            titulo={hayFiltros ? 'Sin resultados para esos filtros' : 'No hay movimientos registrados'}
            descripcion={
              hayFiltros
                ? 'Probá con otro sector, tipo, usuario o período.'
                : 'Aún no se han asentado ingresos, egresos ni ajustes en el registro de trazabilidad.'
            }
            accion={
              puedeRegistrar && <Boton onClick={() => setMostrarFormulario(true)}>Registrar Primer Movimiento</Boton>
            }
          />
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
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
                  {paginacion.elementos.map((movimiento) => (
                    <tr key={movimiento.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-4 font-mono whitespace-nowrap">{formatearFecha(movimiento.fecha_movimiento)}</td>
                      <td className="px-5 py-4">
                        <Insignia color={COLOR_TIPO[movimiento.tipo_movimiento]}>{movimiento.tipo_movimiento}</Insignia>
                      </td>
                      <td className="px-5 py-4 font-bold">
                        {movimiento.Item?.nombre || `Ítem #${movimiento.itemId}`}
                        {movimiento.Item?.codigo_identificacion && (
                          <span className="block text-[11px] text-gray-500 font-normal font-mono">
                            {movimiento.Item.codigo_identificacion}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center font-mono">
                        {/* En un cambio de ubicación la cantidad no importa */}
                        <span className="font-bold text-cit-petroleo">
                          {movimiento.tipo_movimiento === 'Cambio de ubicación'
                            ? '—'
                            : `${movimiento.cantidad} ${movimiento.Item?.unidad_medida ?? ''}`}
                        </span>
                      </td>
                      <td className="px-5 py-4">{movimiento.sector || '—'}</td>
                      <td className="px-5 py-4">{movimiento.responsable}</td>
                      <td className="px-5 py-4 text-gray-700">{movimiento.origen_destino || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paginacion
              pagina={paginacion.pagina}
              totalPaginas={paginacion.totalPaginas}
              totalElementos={movimientos.length}
              porPagina={paginacion.porPagina}
              alCambiar={paginacion.cambiarPagina}
            />
          </div>
        )}
      </div>
    </PlantillaPrincipal>
  )
}
