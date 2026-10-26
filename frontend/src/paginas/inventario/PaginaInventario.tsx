import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PlantillaPrincipal } from '@/componentes/plantilla/PlantillaPrincipal'
import { Boton } from '@/componentes/ui/Boton'
import { EncabezadoPagina } from '@/componentes/ui/EncabezadoPagina'
import { CargandoTabla } from '@/componentes/ui/Esqueleto'
import { EstadoVacio } from '@/componentes/ui/EstadoVacio'
import { EtiquetaCategoria } from '@/componentes/ui/Insignia'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { Paginacion } from '@/componentes/ui/Paginacion'
import { Selector } from '@/componentes/ui/Selector'
import { usePaginacion } from '@/componentes/ui/usePaginacion'
import { useSesion } from '@/contexto/useSesion'
import { eliminarItem, obtenerItems } from '@/servicios/items'
import type { Item, Opcion } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'
import { formatearFecha } from '@/utilidades/fechas'
import { puedeGestionarInventario, puedeRegistrarMovimientos } from '@/utilidades/permisos'
import { codigoDe, estadoDeStock, type EstadoStock } from './datosItem'
import { DetalleItem } from './DetalleItem'

const PASTILLA_ESTADO: Record<EstadoStock, { texto: string; clases: string }> = {
  agotado: { texto: 'Agotado', clases: 'bg-red-100 text-red-700 border-red-200' },
  bajo: { texto: 'Stock Bajo', clases: 'bg-amber-100 text-amber-800 border-amber-200' },
  disponible: { texto: 'Disponible', clases: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
}

// "reponer" junta los bajos y los agotados: son los que hay que volver a pedir.
const FILTROS_ESTADO: Opcion[] = [
  { valor: 'disponible', texto: 'Disponible' },
  { valor: 'bajo', texto: 'Stock bajo' },
  { valor: 'agotado', texto: 'Agotado' },
  { valor: 'reponer', texto: 'Necesita reposición' },
]

function cumpleFiltroEstado(item: Item, filtro: string): boolean {
  if (!filtro) return true
  const estado = estadoDeStock(item)
  if (filtro === 'reponer') return estado === 'bajo' || estado === 'agotado'
  return estado === filtro
}

// Devuelve true si el texto buscado aparece en el nombre, código, CAS, ubicación o categoría.
function coincideConBusqueda(item: Item, busqueda: string): boolean {
  const texto = busqueda.toLowerCase().trim()
  const campos = [item.nombre, item.codigo_identificacion, item.codigoCas, item.ubicacion, item.categoria]
  return campos.some((campo) => (campo ?? '').toLowerCase().includes(texto))
}

export default function PaginaInventario() {
  const navigate = useNavigate()
  const { usuario } = useSesion()
  const puedeGestionar = puedeGestionarInventario(usuario?.rol)
  const puedeRetirar = puedeRegistrarMovimientos(usuario?.rol)

  // Desde el dashboard se puede llegar con ?estado=reponer ya filtrado.
  const [parametros] = useSearchParams()

  const [items, setItems] = useState<Item[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')
  const [estado, setEstado] = useState(parametros.get('estado') ?? '')
  // Ítem que se está viendo en la ventana de detalle (null = ventana cerrada).
  const [itemDetalle, setItemDetalle] = useState<Item | null>(null)

  async function cargarItems() {
    setCargando(true)
    setError('')
    try {
      setItems(await obtenerItems())
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarItems()
  }, [])

  async function borrar(item: Item) {
    if (!window.confirm(`¿Eliminar "${item.nombre}" del inventario?`)) return
    try {
      await eliminarItem(item.id)
      await cargarItems()
    } catch (e) {
      setError(mensajeDeError(e))
    }
  }

  const itemsFiltrados = items.filter(
    (item) =>
      coincideConBusqueda(item, busqueda) &&
      (!categoria || item.categoria === categoria) &&
      cumpleFiltroEstado(item, estado),
  )
  const paginacion = usePaginacion(itemsFiltrados)

  // Categorías sin repetir y ordenadas, para el selector.
  const categorias = [...new Set(items.map((item) => item.categoria))].sort()
  const hayFiltros = busqueda !== '' || categoria !== '' || estado !== ''

  // Cada vez que cambia un filtro se vuelve a la primera página.
  function filtrar(cambiar: () => void) {
    cambiar()
    paginacion.volverAlInicio()
  }

  return (
    <PlantillaPrincipal>
      <div className="space-y-6">
        <EncabezadoPagina
          etiqueta="Catálogo de Laboratorio"
          titulo="Inventario Científico"
          descripcion="Registro y control de existencias de reactivos químicos, drogas, material biológico e insumos analíticos."
        >
          <div className="flex items-center gap-3">
            {puedeGestionar && (
              <Boton onClick={() => navigate('/inventario/nuevo')}>
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Elemento
              </Boton>
            )}
          </div>
        </EncabezadoPagina>

        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center gap-3">
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Buscar por código, nombre o CAS..."
              value={busqueda}
              onChange={(e) => filtrar(() => setBusqueda(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cit-turquesa focus:border-cit-turquesa font-sans"
            />
          </div>
          <div className="w-full md:w-56">
            <Selector
              id="filtro-categoria"
              aria-label="Filtrar por categoría"
              textoVacio="Todas las categorías"
              opciones={categorias.map((c) => ({ valor: c, texto: c }))}
              value={categoria}
              onChange={(e) => filtrar(() => setCategoria(e.target.value))}
              className="py-2 text-xs bg-white"
            />
          </div>
          <div className="w-full md:w-56">
            <Selector
              id="filtro-estado"
              aria-label="Filtrar por estado del stock"
              textoVacio="Todos los estados"
              opciones={FILTROS_ESTADO}
              value={estado}
              onChange={(e) => filtrar(() => setEstado(e.target.value))}
              className="py-2 text-xs bg-white"
            />
          </div>
          {hayFiltros && (
            <button
              type="button"
              onClick={() =>
                filtrar(() => {
                  setBusqueda('')
                  setCategoria('')
                  setEstado('')
                })
              }
              className="text-xs font-semibold text-cit-petroleo hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {error && <Mensaje tipo="error" titulo="Error al cargar inventario" texto={error} />}

        {cargando ? (
          <CargandoTabla filas={2} />
        ) : itemsFiltrados.length === 0 ? (
          <EstadoVacio
            titulo={hayFiltros ? 'Sin resultados para esos filtros' : 'No hay elementos en el inventario'}
            descripcion={
              hayFiltros
                ? 'Probá con otra búsqueda, categoría o estado.'
                : puedeGestionar
                  ? 'No se encontraron registros de reactivos o insumos en la base de datos. Puede registrar el primer elemento ahora.'
                  : 'No se encontraron registros de reactivos o insumos en la base de datos.'
            }
            accion={
              puedeGestionar &&
              !hayFiltros && <Boton onClick={() => navigate('/inventario/nuevo')}>Registrar Primer Elemento</Boton>
            }
          />
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                  <tr>
                    <th className="px-5 py-3.5">Código / CAS</th>
                    <th className="px-5 py-3.5">Nombre Químico / Insumo</th>
                    <th className="px-5 py-3.5">Tipo / Categoría</th>
                    <th className="px-5 py-3.5">Ubicación</th>
                    <th className="px-5 py-3.5 text-center">Stock Actual</th>
                    <th className="px-5 py-3.5 text-center">Estado</th>
                    <th className="px-5 py-3.5">Vencimiento</th>
                    <th className="px-5 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {paginacion.elementos.map((item) => {
                    const pastilla = PASTILLA_ESTADO[estadoDeStock(item)]
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-gray-900">{codigoDe(item)}</td>
                        <td className="px-5 py-4 font-bold">
                          {item.nombre}
                          {item.codigoCas && (
                            <span className="block text-[11px] text-gray-500 font-normal font-mono">
                              CAS: {item.codigoCas}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <EtiquetaCategoria>{item.categoria}</EtiquetaCategoria>
                        </td>
                        <td className="px-5 py-4 text-gray-700">{item.ubicacion || 'Laboratorio'}</td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
                            {item.stock_actual} / Mín {item.stock_minimo} {item.unidad_medida}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${pastilla.clases}`}
                          >
                            {pastilla.texto}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-700 font-mono">{formatearFecha(item.fechaVencimiento)}</td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          {puedeRetirar && (
                            <button
                              type="button"
                              onClick={() => navigate(`/movimientos?itemId=${item.id}&tipo=Egreso`)}
                              className="text-cit-petroleo font-bold hover:text-cit-azul-fuerte hover:underline mr-3"
                            >
                              Retiro
                            </button>
                          )}
                          {puedeGestionar && (
                            <button
                              type="button"
                              onClick={() => navigate(`/inventario/editar/${item.id}`)}
                              className="text-cit-petroleo font-bold hover:text-cit-azul-fuerte hover:underline mr-3"
                            >
                              Editar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setItemDetalle(item)}
                            className={`text-gray-500 font-medium hover:text-cit-petroleo ${puedeGestionar ? 'mr-3' : ''}`}
                          >
                            Detalles
                          </button>
                          {puedeGestionar && (
                            <button
                              type="button"
                              onClick={() => borrar(item)}
                              className="text-red-600 font-medium hover:text-red-700"
                            >
                              Eliminar
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Paginacion
              pagina={paginacion.pagina}
              totalPaginas={paginacion.totalPaginas}
              totalElementos={itemsFiltrados.length}
              porPagina={paginacion.porPagina}
              alCambiar={paginacion.cambiarPagina}
            />
          </div>
        )}
      </div>

      {itemDetalle && <DetalleItem item={itemDetalle} alCerrar={() => setItemDetalle(null)} />}
    </PlantillaPrincipal>
  )
}
