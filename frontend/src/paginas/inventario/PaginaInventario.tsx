import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlantillaPrincipal } from '@/componentes/plantilla/PlantillaPrincipal'
import { Boton } from '@/componentes/ui/Boton'
import { EncabezadoPagina } from '@/componentes/ui/EncabezadoPagina'
import { CargandoTabla } from '@/componentes/ui/Esqueleto'
import { EstadoVacio } from '@/componentes/ui/EstadoVacio'
import { EtiquetaCategoria } from '@/componentes/ui/Insignia'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { useSesion } from '@/contexto/useSesion'
import { eliminarItem, obtenerItems } from '@/servicios/items'
import type { Item } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'
import { puedeGestionarInventario, puedeRegistrarMovimientos } from '@/utilidades/permisos'
import { codigoDe } from './codigoItem'
import { DetalleItem } from './DetalleItem'

// Pastilla con el estado del stock: agotado, bajo o disponible.
function EstadoStock({ item }: { item: Item }) {
  if (item.stock_actual <= 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
        Agotado
      </span>
    )
  }
  if (item.stock_minimo > 0 && item.stock_actual <= item.stock_minimo) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
        Stock Bajo
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
      Disponible
    </span>
  )
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

  const [items, setItems] = useState<Item[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
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

  const itemsFiltrados = items.filter((item) => coincideConBusqueda(item, busqueda))

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

        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Buscar por código, nombre o CAS..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cit-turquesa focus:border-cit-turquesa font-sans"
            />
          </div>
        </div>

        {error && <Mensaje tipo="error" titulo="Error al cargar inventario" texto={error} />}

        {cargando ? (
          <CargandoTabla filas={2} />
        ) : itemsFiltrados.length === 0 ? (
          <EstadoVacio
            titulo="No hay elementos en el inventario"
            descripcion={
              puedeGestionar
                ? 'No se encontraron registros de reactivos o insumos en la base de datos. Puede registrar el primer elemento ahora.'
                : 'No se encontraron registros de reactivos o insumos en la base de datos.'
            }
            accion={
              puedeGestionar && (
                <Boton onClick={() => navigate('/inventario/nuevo')}>Registrar Primer Elemento</Boton>
              )
            }
          />
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
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
                {itemsFiltrados.map((item) => (
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
                      <EstadoStock item={item} />
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-mono">{item.fechaVencimiento || '—'}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {itemDetalle && <DetalleItem item={itemDetalle} alCerrar={() => setItemDetalle(null)} />}
    </PlantillaPrincipal>
  )
}
