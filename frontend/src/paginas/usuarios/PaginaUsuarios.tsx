import { useEffect, useState } from 'react'
import { PlantillaPrincipal } from '@/componentes/plantilla/PlantillaPrincipal'
import { Boton } from '@/componentes/ui/Boton'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { useSesion } from '@/contexto/useSesion'
import { actualizarUsuario, obtenerUsuarios, restablecerPassword } from '@/servicios/usuarios'
import type { EstadoUsuario, Rol, Usuario } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'
import { FilaUsuario } from './FilaUsuario'

interface PropsPestana {
  texto: string
  cantidad: number
  activa: boolean
  // Color del número cuando la pestaña no está seleccionada.
  colorCantidad: string
  ocultarSiEsCero?: boolean
  alTocar: () => void
}

function Pestana({ texto, cantidad, activa, colorCantidad, ocultarSiEsCero = false, alTocar }: PropsPestana) {
  return (
    <button
      onClick={alTocar}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
        activa ? 'bg-cit-petroleo text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <span>{texto}</span>
      {!(ocultarSiEsCero && cantidad === 0) && (
        <span
          className={`px-2 py-0.5 text-xs font-bold rounded-full ${activa ? 'bg-white text-cit-petroleo' : colorCantidad}`}
        >
          {cantidad}
        </span>
      )}
    </button>
  )
}

const TEXTO_SIN_USUARIOS: Record<EstadoUsuario, string> = {
  pendiente: 'No hay solicitudes de registro pendientes de aprobación en este momento.',
  activo: 'No hay usuarios activos registrados en el sistema.',
  rechazado: 'No hay usuarios rechazados o inactivos.',
}

export default function PaginaUsuarios() {
  const sesion = useSesion()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [pestana, setPestana] = useState<EstadoUsuario>('pendiente')
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  // Id del usuario que se está guardando, para mostrar "Procesando..." en su fila.
  const [procesandoId, setProcesandoId] = useState<number | null>(null)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null)
  // Rol elegido en el selector de cada usuario: { idUsuario: rol }
  const [rolesElegidos, setRolesElegidos] = useState<Record<number, Rol>>({})

  async function cargarUsuarios() {
    setCargando(true)
    try {
      const lista = await obtenerUsuarios()
      setUsuarios(lista)
      const roles: Record<number, Rol> = {}
      for (const usuario of lista) roles[usuario.id] = usuario.rol
      setRolesElegidos(roles)
    } catch (e) {
      setMensaje({ tipo: 'error', texto: mensajeDeError(e) })
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  // Aprobar, rechazar, suspender o reactivar. También guarda el rol elegido.
  async function cambiarEstado(usuario: Usuario, estado: EstadoUsuario) {
    const rol = rolesElegidos[usuario.id] ?? usuario.rol
    setProcesandoId(usuario.id)
    setMensaje(null)
    try {
      const respuesta = await actualizarUsuario(usuario.id, { estado, rol })
      setMensaje({ tipo: 'exito', texto: respuesta.mensaje })
      setUsuarios(usuarios.map((u) => (u.id === usuario.id ? { ...u, estado, rol } : u)))
    } catch (e) {
      setMensaje({ tipo: 'error', texto: mensajeDeError(e) })
    } finally {
      setProcesandoId(null)
    }
  }

  // Si falla, el error lo muestra el campo de la fila (por eso se deja pasar).
  async function cambiarPassword(usuario: Usuario, nueva: string) {
    const respuesta = await restablecerPassword(usuario.id, nueva)
    setMensaje({ tipo: 'exito', texto: `${respuesta.mensaje} Pasale la contraseña nueva al usuario.` })
  }

  async function guardarRol(usuario: Usuario) {
    const rol = rolesElegidos[usuario.id]
    setProcesandoId(usuario.id)
    setMensaje(null)
    try {
      const respuesta = await actualizarUsuario(usuario.id, { rol })
      setMensaje({ tipo: 'exito', texto: respuesta.mensaje })
      setUsuarios(usuarios.map((u) => (u.id === usuario.id ? { ...u, rol } : u)))
    } catch (e) {
      setMensaje({ tipo: 'error', texto: mensajeDeError(e) })
    } finally {
      setProcesandoId(null)
    }
  }

  function contar(estado: EstadoUsuario) {
    return usuarios.filter((u) => u.estado === estado).length
  }

  const texto = busqueda.trim().toLowerCase()
  const usuariosVisibles = usuarios.filter((u) => {
    if (u.estado !== pestana) return false
    if (!texto) return true
    return [u.nombre, u.email, u.dni, u.rol].some((campo) => campo.toLowerCase().includes(texto))
  })

  return (
    <PlantillaPrincipal>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestión de Usuarios y Aprobaciones</h1>
            <p className="text-sm text-gray-600 mt-1">
              Revise las solicitudes pendientes de acceso, apruebe cuentas institucionales y gestione roles del CIT.
            </p>
          </div>

          <Boton variante="contorno" onClick={cargarUsuarios} disabled={cargando} className="self-start md:self-auto">
            <svg
              className={`w-4 h-4 mr-2 ${cargando ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Actualizar lista
          </Boton>
        </div>

        {mensaje && <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} />}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex space-x-2 border-b border-gray-200 pb-1 sm:pb-0 sm:border-0">
            <Pestana
              texto="Pendientes de Aprobación"
              cantidad={contar('pendiente')}
              activa={pestana === 'pendiente'}
              colorCantidad="bg-amber-100 text-amber-800"
              ocultarSiEsCero
              alTocar={() => setPestana('pendiente')}
            />
            <Pestana
              texto="Usuarios Activos"
              cantidad={contar('activo')}
              activa={pestana === 'activo'}
              colorCantidad="bg-emerald-100 text-emerald-800"
              alTocar={() => setPestana('activo')}
            />
            <Pestana
              texto="Rechazados / Inactivos"
              cantidad={contar('rechazado')}
              activa={pestana === 'rechazado'}
              colorCantidad="bg-gray-200 text-gray-700"
              alTocar={() => setPestana('rechazado')}
            />
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cit-turquesa focus:border-cit-turquesa bg-gray-50 focus:bg-white transition-all duration-150"
            />
          </div>
        </div>

        {cargando ? (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-2xs">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cit-petroleo border-t-transparent"></div>
            <p className="text-sm text-gray-500 mt-3 font-medium">Cargando usuarios del sistema...</p>
          </div>
        ) : usuariosVisibles.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
              {/* Ícono de grupo de personas */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-900">No hay usuarios en esta sección</h3>
            <p className="text-sm text-gray-500 mt-1">
              {busqueda
                ? 'No se encontraron resultados con los términos de búsqueda ingresados.'
                : TEXTO_SIN_USUARIOS[pestana]}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Usuario / DNI</th>
                    <th scope="col" className="px-6 py-3.5">Correo Institucional</th>
                    <th scope="col" className="px-6 py-3.5">Rol Asignado</th>
                    <th scope="col" className="px-6 py-3.5 text-center">Estado</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {usuariosVisibles.map((usuario) => (
                    <FilaUsuario
                      key={usuario.id}
                      usuario={usuario}
                      rolElegido={rolesElegidos[usuario.id] ?? usuario.rol}
                      procesando={procesandoId === usuario.id}
                      alElegirRol={(rol) => setRolesElegidos({ ...rolesElegidos, [usuario.id]: rol })}
                      alCambiarEstado={(estado) => cambiarEstado(usuario, estado)}
                      alGuardarRol={() => guardarRol(usuario)}
                      esUnoMismo={usuario.id === sesion.usuario?.id}
                      alRestablecerPassword={(nueva) => cambiarPassword(usuario, nueva)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PlantillaPrincipal>
  )
}
