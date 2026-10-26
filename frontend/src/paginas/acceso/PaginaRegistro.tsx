import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { PlantillaAcceso } from '@/componentes/plantilla/PlantillaAcceso'
import { Boton } from '@/componentes/ui/Boton'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { registrarUsuario } from '@/servicios/sesion'
import { mensajeDeError } from '@/utilidades/errores'
import { CampoAcceso } from './CampoAcceso'
import { validarRegistro, type DatosRegistro, type Errores } from './validaciones'

const FORMULARIO_VACIO: DatosRegistro = {
  dni: '',
  nombre: '',
  email: '',
  password: '',
  confirmarPassword: '',
}

export default function PaginaRegistro() {
  const [datos, setDatos] = useState(FORMULARIO_VACIO)
  const [errores, setErrores] = useState<Errores>({})
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  const [errorServidor, setErrorServidor] = useState('')
  const [exito, setExito] = useState('')
  const [cargando, setCargando] = useState(false)

  function cambiarCampo(evento: ChangeEvent<HTMLInputElement>) {
    const nuevos = { ...datos, [evento.target.name]: evento.target.value }
    setDatos(nuevos)
    if (intentoEnviar) setErrores(validarRegistro(nuevos))
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setIntentoEnviar(true)

    const erroresEncontrados = validarRegistro(datos)
    setErrores(erroresEncontrados)
    if (Object.keys(erroresEncontrados).length > 0) return

    setCargando(true)
    setErrorServidor('')
    setExito('')
    try {
      await registrarUsuario({
        dni: datos.dni.trim(),
        nombre: datos.nombre.trim(),
        email: datos.email.trim(),
        password: datos.password,
      })
      setExito(
        'Su solicitud de registro fue enviada correctamente. Un administrador revisará su cuenta institucional para su posterior habilitación.',
      )
      setDatos(FORMULARIO_VACIO)
      setIntentoEnviar(false)
    } catch (error) {
      setErrorServidor(mensajeDeError(error))
    } finally {
      setCargando(false)
    }
  }

  return (
    <PlantillaAcceso
      ancha
      titulo="Registro de usuario"
      subtitulo="Sistema Integral de Inventario, Stock y Trazabilidad Científica"
      pie={
        <p className="text-gray-600">
          ¿Ya tiene una cuenta?{' '}
          <Link to="/login" className="font-semibold text-cit-petroleo hover:text-cit-azul-fuerte hover:underline">
            Iniciar sesión
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={enviar} noValidate>
        {errorServidor && <Mensaje tipo="error" titulo="No se pudo completar el registro" texto={errorServidor} />}
        {exito && <Mensaje tipo="exito" texto={exito} />}

        <div className="grid gap-5 sm:grid-cols-2">
          <CampoAcceso
            name="dni"
            etiqueta="DNI"
            type="text"
            inputMode="numeric"
            placeholder="12345678"
            autoComplete="off"
            value={datos.dni}
            onChange={cambiarCampo}
            error={errores.dni}
          />
          <CampoAcceso
            name="nombre"
            etiqueta="Nombre completo"
            type="text"
            placeholder="Apellido y nombre"
            autoComplete="name"
            value={datos.nombre}
            onChange={cambiarCampo}
            error={errores.nombre}
          />
        </div>

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

        <div className="grid gap-5 sm:grid-cols-2">
          <CampoAcceso
            name="password"
            etiqueta="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            value={datos.password}
            onChange={cambiarCampo}
            error={errores.password}
          />
          <CampoAcceso
            name="confirmarPassword"
            etiqueta="Confirmar contraseña"
            type="password"
            placeholder="Repita la contraseña"
            autoComplete="new-password"
            value={datos.confirmarPassword}
            onChange={cambiarCampo}
            error={errores.confirmarPassword}
          />
        </div>

        <Boton
          type="submit"
          anchoCompleto
          cargando={cargando}
          className="bg-cit-petroleo hover:bg-cit-azul-fuerte text-white font-semibold shadow-md transition-colors"
        >
          Registrarse
        </Boton>
      </form>
    </PlantillaAcceso>
  )
}
