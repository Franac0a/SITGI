import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, Bell, CheckCircle2, LogOut, Menu } from 'lucide-react'
import { useAvisos } from '@/contexto/useAvisos'
import { useSesion } from '@/contexto/useSesion'
import { Boton } from '@/componentes/ui/Boton'
import { marcarTodasLeidas, obtenerNotificaciones } from '@/servicios/notificaciones'
import type { Notificacion } from '@/tipos'

const ICONO_ALERTA = (
  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
    <AlertTriangle className="w-3.5 h-3.5" />
  </div>
)

const ICONO_EXITO = (
  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
    <CheckCircle2 className="w-3.5 h-3.5" />
  </div>
)

export function BarraSuperior({ alTocarMenu }: { alTocarMenu: () => void }) {
  const { usuario, salir } = useSesion()
  const { avisos, sinLeer, marcarAvisosLeidos } = useAvisos()
  const navigate = useNavigate()

  const [panelAbierto, setPanelAbierto] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // La campana muestra dos cosas: las notificaciones del backend (stock bajo)
  // y los avisos guardados en este navegador.
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])

  useEffect(() => {
    obtenerNotificaciones()
      .then(setNotificaciones)
      .catch(() => {})
  }, [])

  // Cierra el panel de notificaciones al hacer clic afuera.
  useEffect(() => {
    function alHacerClic(evento: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(evento.target as Node)) {
        setPanelAbierto(false)
      }
    }
    document.addEventListener('mousedown', alHacerClic)
    return () => document.removeEventListener('mousedown', alHacerClic)
  }, [])

  function marcarTodoLeido() {
    marcarAvisosLeidos()
    marcarTodasLeidas().catch(() => {})
    setNotificaciones(notificaciones.map((n) => ({ ...n, leida: true })))
  }

  function cerrarSesion() {
    salir()
    navigate('/login')
  }

  const totalSinLeer = sinLeer + notificaciones.filter((n) => !n.leida).length
  const inicial = usuario?.nombre?.charAt(0).toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-18 w-full border-b border-gray-200 bg-white px-4 sm:px-6 flex items-center justify-between shrink-0 transition-all">
      <div className="flex items-center gap-3">
        <Boton
          type="button"
          variante="fantasma"
          tamano="icono"
          onClick={alTocarMenu}
          className="text-gray-700 hover:text-cit-petroleo hover:bg-gray-100"
          aria-label="Alternar menú de navegación"
        >
          <Menu className="h-5 w-5" />
        </Boton>

        <Link to="/dashboard" className="flex items-center gap-2 shrink-0 hover:opacity-90 transition-opacity">
          <img
            src="/logo2.png"
            alt="Centro de Investigación y Transferencia - CIT Formosa"
            className="h-10 sm:h-11 md:h-12 w-auto max-w-[200px] sm:max-w-[280px] md:max-w-[320px] object-contain select-none"
          />
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative" ref={panelRef}>
          <Boton
            type="button"
            variante="fantasma"
            tamano="icono"
            onClick={() => setPanelAbierto(!panelAbierto)}
            className={`relative ${
              panelAbierto ? 'bg-cit-petroleo/10 text-cit-petroleo' : 'text-gray-700 hover:text-cit-petroleo hover:bg-gray-100'
            }`}
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            {totalSinLeer > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cit-petroleo text-[10px] font-bold text-white shadow-xs">
                {totalSinLeer}
              </span>
            )}
          </Boton>

          {panelAbierto && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-gray-200 shadow-xl z-50 overflow-hidden font-sans">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-gray-900">Notificaciones</span>
                  {totalSinLeer > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cit-petroleo text-white">
                      {totalSinLeer}
                    </span>
                  )}
                </div>

                {totalSinLeer > 0 && (
                  <button
                    type="button"
                    onClick={marcarTodoLeido}
                    className="text-[11px] font-semibold text-cit-petroleo hover:underline"
                  >
                    Marcar leídas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notificaciones.length === 0 && avisos.length === 0 && (
                  <div className="p-6 text-center text-xs text-gray-500">No hay notificaciones para mostrar</div>
                )}

                {notificaciones.map((notificacion) => (
                  <div
                    key={notificacion.id}
                    className={`p-3.5 hover:bg-gray-50 transition-colors flex gap-3 ${
                      !notificacion.leida ? 'bg-cit-petroleo/5' : ''
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">{ICONO_ALERTA}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{notificacion.titulo}</p>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{notificacion.mensaje}</p>
                    </div>
                  </div>
                ))}

                {avisos.map((aviso) => (
                  <div
                    key={aviso.id}
                    className={`p-3.5 hover:bg-gray-50 transition-colors flex gap-3 ${!aviso.leido ? 'bg-cit-petroleo/5' : ''}`}
                  >
                    <div className="shrink-0 mt-0.5">{aviso.tipo === 'alerta' ? ICONO_ALERTA : ICONO_EXITO}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-900 truncate">{aviso.titulo}</p>
                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{aviso.hora}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{aviso.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-gray-50 border-t border-gray-200 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setPanelAbierto(false)
                    navigate('/reportes')
                  }}
                  className="text-xs font-bold text-cit-petroleo hover:underline transition-colors"
                >
                  Ver todas las alertas
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200" aria-hidden="true" />

        {/* Nombre, rol e inicial: llevan a "Mi cuenta" para ver los datos y cambiar la contraseña */}
        <Link
          to="/mi-cuenta"
          title="Mi cuenta"
          className="flex items-center gap-3 sm:gap-4 rounded-lg hover:opacity-80 transition-opacity"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-gray-900 leading-tight truncate max-w-44">
              {usuario?.nombre || 'Usuario'}
            </p>
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-cit-petroleo/10 text-cit-petroleo border border-cit-petroleo/20 mt-0.5 uppercase tracking-tight">
              {usuario?.rol || 'Personal Científico'}
            </span>
          </div>

          <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-cit-petroleo/20">
            <span className="flex h-full w-full items-center justify-center rounded-full bg-cit-petroleo text-white font-bold text-xs select-none">
              {inicial}
            </span>
          </span>
        </Link>

        <Boton
          type="button"
          variante="fantasma"
          tamano="icono"
          onClick={cerrarSesion}
          className="p-2 text-gray-500 hover:text-cit-petroleo hover:bg-gray-100 transition-colors"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
        </Boton>
      </div>
    </header>
  )
}
