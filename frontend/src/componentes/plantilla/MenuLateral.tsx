import { Link, useLocation } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import {
  ArrowLeftRight,
  BarChart3,
  ClipboardList,
  FileCheck2,
  FlaskConical,
  FolderGit2,
  MapPin,
  Microscope,
  Recycle,
  ShieldCheck,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useSesion } from '@/contexto/useSesion'
import { Boton } from '@/componentes/ui/Boton'

interface Enlace {
  texto: string
  ruta: string
  icono: LucideIcon
  // Si está, solo lo ven estos roles.
  roles?: string[]
}

const SECCIONES: { titulo: string; enlaces: Enlace[] }[] = [
  {
    titulo: 'Módulos Científicos',
    enlaces: [
      { texto: 'Inventario científico', ruta: '/inventario', icono: FlaskConical },
      { texto: 'Stock y movimientos', ruta: '/movimientos', icono: ArrowLeftRight },
      { texto: 'Pedidos y reposición', ruta: '/pedidos', icono: ClipboardList },
      { texto: 'Ubicación y sectores', ruta: '/sectores', icono: MapPin },
      { texto: 'Residuos especiales', ruta: '/residuos', icono: Recycle },
      { texto: 'Muestras y diagnóstico', ruta: '/muestras', icono: Microscope },
      { texto: 'Proyectos de investigación', ruta: '/proyectos', icono: FolderGit2 },
    ],
  },
  {
    titulo: 'Gestión & Documentación',
    enlaces: [
      { texto: 'Documentos asociados', ruta: '/documentos', icono: FileCheck2 },
      { texto: 'Alertas y reportes', ruta: '/reportes', icono: BarChart3 },
    ],
  },
  {
    titulo: 'Administración LIMS',
    enlaces: [{ texto: 'Usuarios y roles', ruta: '/admin/usuarios', icono: ShieldCheck, roles: ['Dirección'] }],
  },
]

interface PropsMenuLateral {
  abierto: boolean
  alCerrar: () => void
}

// Menú que se desliza desde la izquierda. Dialog (de Radix) se encarga de
// cerrarlo con Esc o tocando afuera y de mantener el foco del teclado adentro.
export function MenuLateral({ abierto, alCerrar }: PropsMenuLateral) {
  const { pathname } = useLocation()
  const { usuario } = useSesion()

  function puedeVer(enlace: Enlace) {
    return !enlace.roles || (usuario !== null && enlace.roles.includes(usuario.rol))
  }

  return (
    <Dialog.Root open={abierto} onOpenChange={(abrir) => !abrir && alCerrar()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 h-full w-72 sm:w-80 gap-4 bg-white p-0 shadow-lg border-r border-gray-200">
          <Dialog.Title className="sr-only">Menú de navegación</Dialog.Title>

          <div className="flex h-full flex-col bg-gray-50">
            <div className="h-16 px-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
              <Link to="/dashboard" onClick={alCerrar} className="flex items-center hover:opacity-90 transition-opacity">
                <img
                  src="/logo2.png"
                  alt="CIT Formosa"
                  className="h-9 sm:h-10 w-auto max-w-[190px] object-contain select-none"
                />
              </Link>

              <Boton
                type="button"
                variante="fantasma"
                tamano="icono"
                onClick={alCerrar}
                className="h-8 w-8 text-gray-600 hover:text-cit-petroleo hover:bg-gray-200"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </Boton>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
              {SECCIONES.map((seccion) => {
                const enlaces = seccion.enlaces.filter(puedeVer)
                if (enlaces.length === 0) return null

                return (
                  <div key={seccion.titulo} className="space-y-1">
                    <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-cit-petroleo">
                      {seccion.titulo}
                    </p>

                    <div className="mt-1 space-y-0.5">
                      {enlaces.map((enlace) => {
                        const activo = pathname.startsWith(enlace.ruta)
                        const Icono = enlace.icono

                        return (
                          <Link
                            key={enlace.ruta}
                            to={enlace.ruta}
                            onClick={alCerrar}
                            className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                              activo
                                ? 'bg-cit-petroleo/10 text-cit-petroleo font-semibold border-l-4 border-cit-petroleo'
                                : 'text-gray-800 hover:bg-gray-200/60 font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Icono
                                className={`w-5 h-5 shrink-0 transition-colors ${
                                  activo ? 'text-cit-petroleo' : 'text-cit-azul-fuerte/70 group-hover:text-cit-petroleo'
                                }`}
                              />
                              <span className="truncate">{enlace.texto}</span>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-4" />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
