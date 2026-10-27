import { Selector } from '@/componentes/ui/Selector'
import type { EstadoUsuario, Rol, Usuario } from '@/tipos'
import { ROLES } from '@/utilidades/permisos'
import { RestablecerPassword } from './RestablecerPassword'

// Pastilla de color con el estado de la cuenta.
function PastillaEstado({ estado }: { estado: EstadoUsuario }) {
  if (estado === 'pendiente') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
        Pendiente
      </span>
    )
  }
  if (estado === 'activo') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
        Activo
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-800 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
      Rechazado
    </span>
  )
}

interface PropsFilaUsuario {
  usuario: Usuario
  // Rol elegido en el selector (puede no estar guardado todavía).
  rolElegido: Rol
  procesando: boolean
  alElegirRol: (rol: Rol) => void
  alCambiarEstado: (estado: EstadoUsuario) => void
  alGuardarRol: () => void
  // La Dirección no restablece su propia contraseña desde acá: la cambia en "Mi cuenta".
  esUnoMismo: boolean
  alRestablecerPassword: (nueva: string) => Promise<void>
}

export function FilaUsuario({
  usuario,
  rolElegido,
  procesando,
  alElegirRol,
  alCambiarEstado,
  alGuardarRol,
  esUnoMismo,
  alRestablecerPassword,
}: PropsFilaUsuario) {
  const rolCambiado = rolElegido !== usuario.rol
  // A los rechazados no se les cambia el rol: se muestra como texto.
  const puedeElegirRol = usuario.estado !== 'rechazado'

  return (
    <tr className="hover:bg-gray-50/80 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cit-petroleo/10 text-cit-petroleo font-bold flex items-center justify-center text-xs">
            {usuario.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{usuario.nombre}</div>
            <div className="text-xs text-gray-500">
              DNI: <span className="font-mono">{usuario.dni}</span>
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-gray-600 font-mono text-xs">{usuario.email}</td>

      <td className="px-6 py-4">
        {puedeElegirRol ? (
          <div className="flex items-center gap-2 max-w-xs">
            <Selector
              name={`rol-${usuario.id}`}
              opciones={ROLES}
              value={rolElegido}
              onChange={(e) => alElegirRol(e.target.value as Rol)}
              disabled={procesando}
            />
            {usuario.estado === 'activo' && rolCambiado && (
              <button
                type="button"
                onClick={alGuardarRol}
                disabled={procesando}
                className="px-2.5 py-2 text-xs font-semibold text-cit-petroleo bg-cit-petroleo/10 border border-cit-petroleo/20 rounded-lg hover:bg-cit-petroleo/20 transition-colors shrink-0"
                title="Guardar nuevo rol"
              >
                Guardar
              </button>
            )}
          </div>
        ) : (
          <span className="font-medium text-gray-700">{usuario.rol}</span>
        )}
      </td>

      <td className="px-6 py-4 text-center">
        <PastillaEstado estado={usuario.estado} />
      </td>

      <td className="px-6 py-4 text-right whitespace-nowrap">
        {procesando && (
          <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-cit-petroleo border-t-transparent"></span>
            Procesando...
          </div>
        )}

        {!procesando && usuario.estado === 'pendiente' && (
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => alCambiarEstado('activo')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-cit-turquesa hover:bg-cit-turquesa/90 rounded-lg shadow-2xs transition-colors"
            >
              Aprobar Acceso
            </button>
            <button
              type="button"
              onClick={() => alCambiarEstado('rechazado')}
              className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              Rechazar
            </button>
          </div>
        )}

        {!procesando && usuario.estado === 'activo' && (
          <button
            type="button"
            onClick={() => alCambiarEstado('rechazado')}
            className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
          >
            Suspender Cuenta
          </button>
        )}

        {!procesando && usuario.estado === 'rechazado' && (
          <button
            type="button"
            onClick={() => alCambiarEstado('activo')}
            className="px-3 py-1.5 text-xs font-semibold text-cit-turquesa bg-cit-turquesa/10 border border-cit-turquesa/20 rounded-lg hover:bg-cit-turquesa/20 transition-colors"
          >
            Reactivar Cuenta
          </button>
        )}

        {!procesando && !esUnoMismo && (
          <RestablecerPassword nombre={usuario.nombre} alGuardar={alRestablecerPassword} />
        )}
      </td>
    </tr>
  )
}
