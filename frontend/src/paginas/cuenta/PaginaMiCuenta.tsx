import { useState, type ChangeEvent, type FormEvent } from 'react'
import { PlantillaPrincipal } from '@/componentes/plantilla/PlantillaPrincipal'
import { Boton } from '@/componentes/ui/Boton'
import { CampoTexto } from '@/componentes/ui/CampoTexto'
import { EncabezadoPagina } from '@/componentes/ui/EncabezadoPagina'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { useSesion } from '@/contexto/useSesion'
import { validarCambioPassword, type DatosCambioPassword, type Errores } from '@/paginas/acceso/validaciones'
import { cambiarMiPassword } from '@/servicios/sesion'
import { mensajeDeError } from '@/utilidades/errores'

const FORMULARIO_VACIO: DatosCambioPassword = { actual: '', nueva: '', confirmarNueva: '' }

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-bold text-gray-500 uppercase">{titulo}</dt>
      <dd className="text-sm text-gray-900">{valor}</dd>
    </div>
  )
}

// Datos del usuario logueado y formulario para cambiar su contraseña.
export default function PaginaMiCuenta() {
  const { usuario } = useSesion()

  const [datos, setDatos] = useState(FORMULARIO_VACIO)
  const [errores, setErrores] = useState<Errores>({})
  const [guardando, setGuardando] = useState(false)
  const [errorServidor, setErrorServidor] = useState('')
  const [exito, setExito] = useState('')

  function cambiarCampo(evento: ChangeEvent<HTMLInputElement>) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value })
    setErrores({ ...errores, [evento.target.name]: '' })
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErrorServidor('')
    setExito('')

    const erroresEncontrados = validarCambioPassword(datos)
    setErrores(erroresEncontrados)
    if (Object.keys(erroresEncontrados).length > 0) return

    setGuardando(true)
    try {
      const respuesta = await cambiarMiPassword(datos.actual, datos.nueva)
      setExito(respuesta.mensaje)
      setDatos(FORMULARIO_VACIO)
    } catch (e) {
      setErrorServidor(mensajeDeError(e))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <PlantillaPrincipal>
      <div className="max-w-3xl space-y-6">
        <EncabezadoPagina
          etiqueta="Mi cuenta"
          titulo={usuario?.nombre ?? 'Mi cuenta'}
          descripcion="Tus datos en el sistema y el cambio de contraseña."
        />

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
          <Dato titulo="Correo electrónico" valor={usuario?.email ?? '—'} />
          <Dato titulo="DNI" valor={usuario?.dni ?? '—'} />
          <Dato titulo="Rol" valor={usuario?.rol ?? '—'} />
          <Dato titulo="Estado" valor={usuario?.estado ?? '—'} />
        </dl>

        <form
          onSubmit={enviar}
          noValidate
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5"
        >
          <div>
            <h2 className="text-lg font-bold text-gray-900">Cambiar contraseña</h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Por seguridad, escribí primero la contraseña que usás ahora. La nueva necesita al menos 8 caracteres.
            </p>
          </div>

          {errorServidor && <Mensaje tipo="error" titulo="No se pudo cambiar" texto={errorServidor} />}
          {exito && <Mensaje tipo="exito" texto={exito} />}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <CampoTexto
              name="actual"
              type="password"
              autoComplete="current-password"
              etiqueta="Contraseña actual"
              value={datos.actual}
              onChange={cambiarCampo}
              error={errores.actual}
              disabled={guardando}
            />
            <CampoTexto
              name="nueva"
              type="password"
              autoComplete="new-password"
              etiqueta="Contraseña nueva"
              value={datos.nueva}
              onChange={cambiarCampo}
              error={errores.nueva}
              disabled={guardando}
            />
            <CampoTexto
              name="confirmarNueva"
              type="password"
              autoComplete="new-password"
              etiqueta="Repetir contraseña nueva"
              value={datos.confirmarNueva}
              onChange={cambiarCampo}
              error={errores.confirmarNueva}
              disabled={guardando}
            />
          </div>

          <div className="flex justify-end">
            <Boton type="submit" cargando={guardando}>
              Guardar contraseña
            </Boton>
          </div>
        </form>
      </div>
    </PlantillaPrincipal>
  )
}
