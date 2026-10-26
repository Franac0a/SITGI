import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlantillaAcceso } from '@/componentes/plantilla/PlantillaAcceso'
import { Boton } from '@/componentes/ui/Boton'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { useSesion } from '@/contexto/useSesion'
import { mensajeDeError } from '@/utilidades/errores'
import { rutaInicial } from '@/utilidades/permisos'
import { CampoAcceso } from './CampoAcceso'
import { validarLogin, type Errores } from './validaciones'

export default function PaginaLogin() {
  const navigate = useNavigate()
  const { ingresar } = useSesion()

  const [datos, setDatos] = useState({ email: '', password: '' })
  const [errores, setErrores] = useState<Errores>({})
  // Después del primer intento, los errores se actualizan mientras se escribe.
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  const [errorServidor, setErrorServidor] = useState('')
  const [cargando, setCargando] = useState(false)

  function cambiarCampo(evento: ChangeEvent<HTMLInputElement>) {
    const nuevos = { ...datos, [evento.target.name]: evento.target.value }
    setDatos(nuevos)
    if (intentoEnviar) setErrores(validarLogin(nuevos))
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setIntentoEnviar(true)

    const erroresEncontrados = validarLogin(datos)
    setErrores(erroresEncontrados)
    if (Object.keys(erroresEncontrados).length > 0) return

    setCargando(true)
    setErrorServidor('')
    try {
      const usuario = await ingresar(datos.email.trim(), datos.password)
      navigate(rutaInicial(usuario.rol))
    } catch (error) {
      setErrorServidor(mensajeDeError(error))
    } finally {
      setCargando(false)
    }
  }

  return (
    <PlantillaAcceso
      titulo="Iniciar sesión"
      subtitulo="Sistema Integral de Inventario, Stock y Trazabilidad Científica"
      pie={
        <p className="text-gray-600">
          ¿No tiene una cuenta?{' '}
          <Link to="/registro" className="font-semibold text-cit-petroleo hover:text-cit-azul-fuerte hover:underline">
            Registrarse
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={enviar} noValidate>
        {errorServidor && <Mensaje tipo="error" titulo="No se pudo iniciar sesión" texto={errorServidor} />}

        <CampoAcceso
          name="email"
          etiqueta="Correo electrónico institucional"
          type="email"
          placeholder="usuario@citformosa.gob.ar"
          autoComplete="email"
          value={datos.email}
          onChange={cambiarCampo}
          error={errores.email}
        />

        <CampoAcceso
          name="password"
          etiqueta="Contraseña"
          type="password"
          placeholder="Ingrese su contraseña"
          autoComplete="current-password"
          value={datos.password}
          onChange={cambiarCampo}
          error={errores.password}
        />

        <Boton
          type="submit"
          anchoCompleto
          cargando={cargando}
          className="bg-cit-petroleo hover:bg-cit-azul-fuerte text-white font-semibold shadow-md transition-colors"
        >
          Ingresar
        </Boton>
      </form>
    </PlantillaAcceso>
  )
}
