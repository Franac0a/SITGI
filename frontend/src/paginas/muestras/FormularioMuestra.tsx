import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Boton } from '@/componentes/ui/Boton'
import { CampoTexto } from '@/componentes/ui/CampoTexto'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { Selector } from '@/componentes/ui/Selector'
import { registrarMuestra } from '@/servicios/muestras'
import { mensajeDeError } from '@/utilidades/errores'
import { fechaDeHoy } from '@/utilidades/fechas'
import { TIPOS_MUESTRA } from './tiposMuestra'

// Las especies que aparecen en el Excel de diagnóstico, como sugerencias.
const ESPECIES = ['Bovina', 'Bubalinos', 'Caprinos', 'Ovino', 'Equina']

function valoresIniciales(tipo: string) {
  return {
    tipo: tipo || 'Brucelosis',
    fecha_ingreso: fechaDeHoy(),
    numero_ingreso: '',
    numero_protocolo: '',
    propietario: '',
    renspa: '',
    veterinario: '',
    establecimiento: '',
    ubicacion: '',
    departamento: '',
    especie: '',
    cantidad_muestras: '',
  }
}

interface PropsFormularioMuestra {
  // Tipo elegido en las pestañas: el formulario arranca con ese.
  tipoInicial: string
  alGuardar: () => void
}

// Registro del ingreso de una muestra. El resultado se carga después, desde la tabla.
export function FormularioMuestra({ tipoInicial, alGuardar }: PropsFormularioMuestra) {
  const [valores, setValores] = useState(() => valoresIniciales(tipoInicial))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  function cambiarCampo(evento: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setValores({ ...valores, [evento.target.name]: evento.target.value })
    setError('')
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setError('')
    setExito('')

    const cantidad = Number(valores.cantidad_muestras)
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      setError('La cantidad de muestras tiene que ser un número entero mayor a 0.')
      return
    }

    setGuardando(true)
    try {
      // La cantidad se manda como número; el resto de los campos, tal cual.
      const respuesta = await registrarMuestra({ ...valores, cantidad_muestras: cantidad })
      setExito(respuesta.mensaje)
      // Se mantienen el tipo y la fecha, que suelen repetirse en la siguiente carga.
      setValores({ ...valoresIniciales(valores.tipo), fecha_ingreso: valores.fecha_ingreso })
      alGuardar()
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form
      onSubmit={enviar}
      noValidate
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5"
    >
      {error && <Mensaje tipo="error" titulo="No se pudo registrar" texto={error} />}
      {exito && <Mensaje tipo="exito" texto={exito} />}

      <datalist id="especies-sugeridas">
        {ESPECIES.map((especie) => (
          <option key={especie} value={especie} />
        ))}
      </datalist>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Selector
          name="tipo"
          etiqueta="Diagnóstico *"
          opciones={TIPOS_MUESTRA}
          value={valores.tipo}
          onChange={cambiarCampo}
          disabled={guardando}
        />
        <CampoTexto
          name="fecha_ingreso"
          type="date"
          etiqueta="Fecha de ingreso *"
          value={valores.fecha_ingreso}
          onChange={cambiarCampo}
          disabled={guardando}
        />
        <CampoTexto
          name="cantidad_muestras"
          type="number"
          min="1"
          step="1"
          etiqueta="Cantidad de muestras *"
          placeholder="Ej. 20"
          value={valores.cantidad_muestras}
          onChange={cambiarCampo}
          disabled={guardando}
        />
        <CampoTexto
          name="especie"
          etiqueta="Especie"
          placeholder="Ej. Bovina"
          list="especies-sugeridas"
          value={valores.especie}
          onChange={cambiarCampo}
          disabled={guardando}
        />
        <CampoTexto
          name="numero_ingreso"
          etiqueta="N° de ingreso"
          placeholder="Ej. 012/2026"
          value={valores.numero_ingreso}
          onChange={cambiarCampo}
          disabled={guardando}
        />
        <CampoTexto
          name="numero_protocolo"
          etiqueta="N° de protocolo"
          placeholder="Ej. 2099/2026"
          value={valores.numero_protocolo}
          onChange={cambiarCampo}
          disabled={guardando}
        />
        <CampoTexto
          name="propietario"
          etiqueta="Propietario"
          value={valores.propietario}
          onChange={cambiarCampo}
          disabled={guardando}
        />
        <CampoTexto
          name="renspa"
          etiqueta="RENSPA"
          placeholder="Ej. 08.002.1.00233/00"
          value={valores.renspa}
          onChange={cambiarCampo}
          disabled={guardando}
        />
        <CampoTexto
          name="veterinario"
          etiqueta="Veterinario"
          value={valores.veterinario}
          onChange={cambiarCampo}
          disabled={guardando}
        />
        <CampoTexto
          name="establecimiento"
          etiqueta="Establecimiento"
          value={valores.establecimiento}
          onChange={cambiarCampo}
          disabled={guardando}
        />
        <CampoTexto
          name="ubicacion"
          etiqueta="Localidad"
          value={valores.ubicacion}
          onChange={cambiarCampo}
          disabled={guardando}
        />
        <CampoTexto
          name="departamento"
          etiqueta="Departamento"
          value={valores.departamento}
          onChange={cambiarCampo}
          disabled={guardando}
        />
      </div>

      <div className="flex justify-end">
        <Boton type="submit" cargando={guardando}>
          Registrar Muestra
        </Boton>
      </div>
    </form>
  )
}
