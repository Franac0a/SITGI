import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Boton } from '@/componentes/ui/Boton'
import { CampoTexto } from '@/componentes/ui/CampoTexto'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { Selector } from '@/componentes/ui/Selector'
import { registrarMovimiento } from '@/servicios/movimientos'
import type { Item, Sector, TipoMovimiento } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'
import { AYUDA_TIPO, NOMBRE_TIPO } from './tiposMovimiento'

interface PropsFormularioMovimiento {
  items: Item[]
  sectores: Sector[]
  // Tipos que puede registrar el rol del usuario.
  tiposPermitidos: TipoMovimiento[]
  responsable: string
  // Valores con los que arranca el formulario (vienen de la URL, por ejemplo desde "Retiro").
  itemInicial: string
  tipoInicial: TipoMovimiento
  alGuardar: () => void
}

export function FormularioMovimiento({
  items,
  sectores,
  tiposPermitidos,
  responsable,
  itemInicial,
  tipoInicial,
  alGuardar,
}: PropsFormularioMovimiento) {
  const [valores, setValores] = useState({
    itemId: itemInicial,
    tipo: tipoInicial,
    cantidad: '',
    sector: '',
    nuevaUbicacion: '',
    origenDestino: '',
    costoUnitario: '',
    observaciones: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  const esAjuste = valores.tipo === 'Ajuste'
  const esCambioUbicacion = valores.tipo === 'Cambio de ubicación'

  function cambiarCampo(evento: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setValores({ ...valores, [evento.target.name]: evento.target.value })
  }

  // Devuelve el mensaje de error, o un texto vacío si está todo bien.
  function validar(): string {
    if (!valores.itemId) return 'Debe seleccionar el ítem afectado.'

    if (esCambioUbicacion) {
      if (!valores.nuevaUbicacion.trim()) return 'Indique la nueva ubicación del elemento.'
      return ''
    }

    // El ajuste acepta 0 (se contó y no queda nada); el resto necesita más de 0.
    const cantidad = Number(valores.cantidad)
    if (valores.cantidad === '' || isNaN(cantidad) || cantidad < 0 || (!esAjuste && cantidad === 0)) {
      return esAjuste ? 'Ingrese el stock real contado (0 o más).' : 'Ingrese una cantidad válida mayor a 0.'
    }
    return ''
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setExito('')

    const mensajeError = validar()
    setError(mensajeError)
    if (mensajeError) return

    setGuardando(true)
    try {
      const respuesta = await registrarMovimiento({
        itemId: valores.itemId,
        tipo_movimiento: valores.tipo,
        cantidad: esCambioUbicacion ? undefined : Number(valores.cantidad),
        nueva_ubicacion: esCambioUbicacion ? valores.nuevaUbicacion.trim() : undefined,
        sector: valores.sector.trim() || undefined,
        origen_destino: valores.origenDestino.trim() || undefined,
        costo_unitario: valores.costoUnitario !== '' ? Number(valores.costoUnitario) : undefined,
        observaciones: valores.observaciones.trim() || undefined,
      })
      setExito(respuesta.mensaje)
      // Se limpian los datos del movimiento pero se mantienen el ítem, el tipo y el sector.
      setValores({ ...valores, cantidad: '', nuevaUbicacion: '', origenDestino: '', costoUnitario: '', observaciones: '' })
      alGuardar()
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setGuardando(false)
    }
  }

  const opcionesSector = sectores.map((s) => ({ valor: s.nombre, texto: s.nombre }))

  return (
    <form onSubmit={enviar} className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5">
      {error && <Mensaje tipo="error" titulo="No se pudo registrar" texto={error} />}
      {exito && <Mensaje tipo="exito" texto={exito} />}

      <p className="text-xs text-gray-600 bg-cit-petroleo/5 border border-cit-petroleo/10 rounded-lg px-3 py-2">
        <span className="font-bold">{valores.tipo}:</span> {AYUDA_TIPO[valores.tipo]}
        {tiposPermitidos.length === 1 && (
          <span className="block mt-0.5 text-gray-500">Tu rol puede registrar solo consumos (egresos).</span>
        )}
      </p>

      {/* Sugerencias para el campo "Nueva ubicación" */}
      <datalist id="ubicaciones-sugeridas">
        {sectores.map((s) => (
          <option key={s.id} value={s.nombre} />
        ))}
      </datalist>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Selector
          name="itemId"
          etiqueta="Ítem / Reactivo *"
          textoVacio="Seleccionar ítem"
          opciones={items.map((item) => ({
            valor: String(item.id),
            texto: item.codigo_identificacion ? `${item.nombre} (${item.codigo_identificacion})` : item.nombre,
          }))}
          value={valores.itemId}
          onChange={cambiarCampo}
          disabled={guardando}
        />

        <Selector
          name="tipo"
          etiqueta="Tipo de movimiento *"
          opciones={tiposPermitidos.map((tipo) => ({ valor: tipo, texto: NOMBRE_TIPO[tipo] }))}
          value={valores.tipo}
          onChange={cambiarCampo}
          disabled={guardando}
        />

        {esCambioUbicacion ? (
          <CampoTexto
            name="nuevaUbicacion"
            etiqueta="Nueva ubicación *"
            placeholder="Ej. Heladera 2, Estante B"
            list="ubicaciones-sugeridas"
            value={valores.nuevaUbicacion}
            onChange={cambiarCampo}
            disabled={guardando}
          />
        ) : (
          <CampoTexto
            name="cantidad"
            type="number"
            min={esAjuste ? '0' : '0.01'}
            step="any"
            etiqueta={esAjuste ? 'Stock real contado *' : 'Cantidad *'}
            placeholder="0.00"
            value={valores.cantidad}
            onChange={cambiarCampo}
            disabled={guardando}
          />
        )}

        <Selector
          name="sector"
          etiqueta="Sector (opcional)"
          textoVacio="Sin sector"
          opciones={opcionesSector}
          value={valores.sector}
          onChange={cambiarCampo}
          disabled={guardando}
        />

        {/* El responsable lo pone el backend con el usuario logueado: acá solo se muestra. */}
        <CampoTexto name="responsable" etiqueta="Responsable (usuario actual)" value={responsable} readOnly disabled />

        <CampoTexto
          name="origenDestino"
          etiqueta="Origen / Destino (opcional)"
          placeholder="Ej. INTA Mercedes, proveedor"
          value={valores.origenDestino}
          onChange={cambiarCampo}
          disabled={guardando}
        />

        <CampoTexto
          name="costoUnitario"
          type="number"
          min="0"
          step="any"
          etiqueta="Costo unitario (opcional)"
          placeholder="0.00"
          value={valores.costoUnitario}
          onChange={cambiarCampo}
          disabled={guardando}
        />
      </div>

      <div>
        <label htmlFor="observaciones" className="block text-sm font-medium text-gray-800 mb-1.5">
          Observaciones (opcional)
        </label>
        <textarea
          id="observaciones"
          name="observaciones"
          rows={2}
          value={valores.observaciones}
          onChange={cambiarCampo}
          placeholder="Motivo del movimiento, paciente, tratamiento, etc."
          disabled={guardando}
          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cit-turquesa focus:border-cit-turquesa transition-all duration-150"
        />
      </div>

      <div className="flex justify-end">
        <Boton type="submit" cargando={guardando}>
          Guardar Movimiento
        </Boton>
      </div>
    </form>
  )
}
