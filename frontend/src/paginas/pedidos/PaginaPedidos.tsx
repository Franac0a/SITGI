import { useEffect, useState, type FormEvent } from 'react'
import { PlantillaPrincipal } from '@/componentes/plantilla/PlantillaPrincipal'
import { Boton } from '@/componentes/ui/Boton'
import { CampoTexto } from '@/componentes/ui/CampoTexto'
import { EncabezadoPagina } from '@/componentes/ui/EncabezadoPagina'
import { CargandoTabla } from '@/componentes/ui/Esqueleto'
import { EstadoVacio } from '@/componentes/ui/EstadoVacio'
import { Insignia, type Color } from '@/componentes/ui/Insignia'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { Selector } from '@/componentes/ui/Selector'
import { useSesion } from '@/contexto/useSesion'
import { obtenerItems } from '@/servicios/items'
import { cambiarEstadoPedido, crearPedido, obtenerPedidos } from '@/servicios/pedidos'
import { obtenerSectores } from '@/servicios/sectores'
import type { EstadoPedido, Item, Pedido, Sector } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'
import { puedeGestionarInventario } from '@/utilidades/permisos'

const COLOR_ESTADO: Record<EstadoPedido, Color> = {
  Pendiente: 'ambar',
  Aprobado: 'celeste',
  Ingresado: 'verde',
}

function textoDelItem(item: Item): string {
  return item.codigo_identificacion ? `${item.nombre} (${item.codigo_identificacion})` : item.nombre
}

export default function PaginaPedidos() {
  const { usuario } = useSesion()
  // Cualquier usuario puede pedir; aprobar e ingresar al stock es solo para gestión.
  const puedeGestionar = puedeGestionarInventario(usuario?.rol)

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [sectores, setSectores] = useState<Sector[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  // Formulario de nuevo pedido
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState('')
  const [exitoFormulario, setExitoFormulario] = useState('')
  const [itemId, setItemId] = useState('')
  const [nombreInsumo, setNombreInsumo] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [sector, setSector] = useState('')
  const [observaciones, setObservaciones] = useState('')

  // Para los pedidos aprobados sin ítem: qué ítem eligió el usuario en cada fila.
  const [itemParaIngreso, setItemParaIngreso] = useState<Record<number, string>>({})

  async function cargarPedidos() {
    setCargando(true)
    setError('')
    try {
      setPedidos(await obtenerPedidos())
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarPedidos()
    obtenerSectores()
      .then(setSectores)
      .catch(() => setSectores([]))
  }, [])

  // La lista de ítems solo hace falta para quien gestiona los pedidos.
  useEffect(() => {
    if (!puedeGestionar) return
    obtenerItems()
      .then(setItems)
      .catch(() => setItems([]))
  }, [puedeGestionar])

  // Al elegir un ítem del inventario se completa el nombre del insumo.
  function elegirItem(valor: string) {
    setItemId(valor)
    const item = items.find((i) => String(i.id) === valor)
    if (item) setNombreInsumo(item.nombre)
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErrorFormulario('')
    setExitoFormulario('')

    if (!nombreInsumo.trim()) {
      setErrorFormulario('El nombre del insumo es obligatorio.')
      return
    }
    if (cantidad === '' || isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
      setErrorFormulario('Ingrese una cantidad válida mayor a 0.')
      return
    }

    setGuardando(true)
    try {
      await crearPedido({
        item_nombre: nombreInsumo.trim(),
        itemId: itemId ? Number(itemId) : undefined,
        cantidad: Number(cantidad),
        sector: sector || undefined,
        observaciones: observaciones.trim() || undefined,
      })
      setExitoFormulario('Pedido registrado con éxito.')
      setItemId('')
      setNombreInsumo('')
      setCantidad('')
      setSector('')
      setObservaciones('')
      await cargarPedidos()
    } catch (e) {
      setErrorFormulario(mensajeDeError(e))
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarEstado(pedido: Pedido, estado: EstadoPedido) {
    setError('')
    setAviso('')
    const itemElegido = itemParaIngreso[pedido.id]
    try {
      const respuesta = await cambiarEstadoPedido(pedido.id, estado, itemElegido ? Number(itemElegido) : undefined)
      if (estado === 'Ingresado') {
        setAviso(`${respuesta.mensaje} Stock actual: ${respuesta.nuevo_stock}.`)
      }
      await cargarPedidos()
    } catch (e) {
      setError(mensajeDeError(e))
    }
  }

  return (
    <PlantillaPrincipal>
      <div className="space-y-6">
        <EncabezadoPagina
          etiqueta="Reposición"
          titulo="Pedidos y Reposición"
          descripcion="Circuito de solicitud de insumos desde el sector hacia administración e inventario."
        >
          <Boton onClick={() => setMostrarFormulario(!mostrarFormulario)}>
            {mostrarFormulario ? 'Cerrar formulario' : 'Nuevo Pedido'}
          </Boton>
        </EncabezadoPagina>

        {mostrarFormulario && (
          <form onSubmit={enviar} className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5">
            {errorFormulario && <Mensaje tipo="error" titulo="No se pudo registrar" texto={errorFormulario} />}
            {exitoFormulario && <Mensaje tipo="exito" texto={exitoFormulario} />}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.length > 0 && (
                <div className="lg:col-span-3">
                  <label htmlFor="itemId" className="block text-sm font-medium text-gray-700 mb-1">
                    Ítem del inventario (opcional)
                  </label>
                  <select
                    id="itemId"
                    value={itemId}
                    onChange={(e) => elegirItem(e.target.value)}
                    disabled={guardando}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Insumo nuevo, todavía no está en el inventario</option>
                    {items.map((item) => (
                      <option key={item.id} value={String(item.id)}>
                        {textoDelItem(item)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="lg:col-span-2">
                <CampoTexto
                  name="nombreInsumo"
                  etiqueta="Insumo solicitado *"
                  placeholder="Ej. Puntas de micropipeta 200 µL"
                  value={nombreInsumo}
                  onChange={(e) => setNombreInsumo(e.target.value)}
                  disabled={guardando}
                />
              </div>
              <CampoTexto
                name="cantidad"
                type="number"
                min="0.01"
                step="any"
                etiqueta="Cantidad *"
                placeholder="0.00"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                disabled={guardando}
              />
              <Selector
                name="sector"
                etiqueta="Sector (opcional)"
                textoVacio="Sin sector"
                opciones={sectores.map((s) => ({ valor: s.nombre, texto: s.nombre }))}
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                disabled={guardando}
              />
              <CampoTexto
                name="responsable"
                etiqueta="Responsable (usuario actual)"
                value={usuario?.nombre ?? ''}
                readOnly
                disabled
              />
              <CampoTexto
                name="observaciones"
                etiqueta="Observaciones (opcional)"
                placeholder="Urgencia, proveedor sugerido, etc."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                disabled={guardando}
              />
            </div>

            <div className="flex justify-end">
              <Boton type="submit" cargando={guardando}>
                Enviar Pedido
              </Boton>
            </div>
          </form>
        )}

        {aviso && <Mensaje tipo="exito" texto={aviso} />}

        {error && <Mensaje tipo="error" titulo="Error al cargar pedidos" texto={error} />}

        {cargando ? (
          <CargandoTabla />
        ) : pedidos.length === 0 ? (
          <EstadoVacio titulo="No hay pedidos registrados" descripcion="Aún no se han solicitado insumos ni reposiciones." />
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-5 py-3.5">Insumo</th>
                  <th className="px-5 py-3.5 text-center">Cantidad</th>
                  <th className="px-5 py-3.5">Sector</th>
                  <th className="px-5 py-3.5">Responsable</th>
                  <th className="px-5 py-3.5 text-center">Estado</th>
                  {puedeGestionar && <th className="px-5 py-3.5 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {pedidos.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold">
                      {pedido.item_nombre}
                      {pedido.item && (
                        <span className="block text-[11px] text-gray-500 font-normal">
                          Inventario: {pedido.item.codigo_identificacion ?? pedido.item.nombre} · stock{' '}
                          {pedido.item.stock_actual}
                        </span>
                      )}
                      {pedido.observaciones && (
                        <span className="block text-[11px] text-gray-500 font-normal">{pedido.observaciones}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center font-mono">{pedido.cantidad}</td>
                    <td className="px-5 py-4 text-gray-700">{pedido.sector || '—'}</td>
                    <td className="px-5 py-4">{pedido.responsable}</td>
                    <td className="px-5 py-4 text-center">
                      <Insignia color={COLOR_ESTADO[pedido.estado]}>{pedido.estado}</Insignia>
                    </td>
                    {puedeGestionar && (
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {pedido.estado === 'Pendiente' && (
                          <button
                            type="button"
                            onClick={() => cambiarEstado(pedido, 'Aprobado')}
                            className="text-cit-petroleo font-bold hover:text-cit-azul-fuerte hover:underline"
                          >
                            Aprobar
                          </button>
                        )}
                        {pedido.estado === 'Aprobado' && (
                          <span className="inline-flex items-center gap-2">
                            {/* Si el pedido no está vinculado a un ítem, hay que elegir a cuál suma el stock */}
                            {!pedido.itemId && (
                              <select
                                aria-label="Ítem al que ingresa el pedido"
                                value={itemParaIngreso[pedido.id] ?? ''}
                                onChange={(e) => setItemParaIngreso({ ...itemParaIngreso, [pedido.id]: e.target.value })}
                                className="max-w-48 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs"
                              >
                                <option value="">Elegir ítem...</option>
                                {items.map((item) => (
                                  <option key={item.id} value={String(item.id)}>
                                    {textoDelItem(item)}
                                  </option>
                                ))}
                              </select>
                            )}
                            <button
                              type="button"
                              disabled={!pedido.itemId && !itemParaIngreso[pedido.id]}
                              onClick={() => cambiarEstado(pedido, 'Ingresado')}
                              className="text-emerald-700 font-bold hover:text-emerald-900 hover:underline disabled:opacity-40 disabled:no-underline"
                            >
                              Ingresar al stock
                            </button>
                          </span>
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
    </PlantillaPrincipal>
  )
}
