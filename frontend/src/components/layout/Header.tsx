import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Bell, LogOut, Menu, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  type: 'critical' | 'warning' | 'info'
  read: boolean
}

interface HeaderProps {
  onToggleSidebar: () => void
  notifications?: NotificationItem[]
}

export function Header({
  onToggleSidebar,
  notifications: initialNotifications = [],
}: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState<NotificationItem[]>(
    initialNotifications
  )
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userInitial = user?.nombre?.charAt(0).toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-18 w-full border-b border-gray-200 bg-white px-4 sm:px-6 flex items-center justify-between shrink-0 transition-all">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="text-gray-700 hover:text-cit-petroleo hover:bg-gray-100"
          aria-label="Alternar menú de navegación"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link
          to="/dashboard"
          id="logo-header-placeholder"
          className="flex items-center gap-2 shrink-0 hover:opacity-90 transition-opacity"
        >
          <img
            src="/logo2.png"
            alt="Centro de Investigación y Transferencia - CIT Formosa"
            className="h-10 sm:h-11 md:h-12 w-auto max-w-[200px] sm:max-w-[280px] md:max-w-[320px] object-contain select-none"
          />
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative" ref={notifRef}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className={`relative ${
              isNotifOpen
                ? 'bg-cit-petroleo/10 text-cit-petroleo'
                : 'text-gray-700 hover:text-cit-petroleo hover:bg-gray-100'
            }`}
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cit-petroleo text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </Button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-gray-200 shadow-xl z-50 overflow-hidden font-sans">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-gray-900">
                    Notificaciones
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cit-petroleo text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-semibold text-cit-petroleo hover:underline"
                  >
                    Marcar leídas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500">
                    No hay notificaciones para mostrar
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-gray-50 transition-colors flex gap-3 ${
                        !n.read ? 'bg-cit-petroleo/5' : ''
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {n.type === 'critical' ? (
                          <div className="w-5 h-5 rounded-full bg-cit-azul-fuerte/15 text-cit-azul-fuerte flex items-center justify-center font-bold text-xs">
                            <AlertCircle className="w-3.5 h-3.5" />
                          </div>
                        ) : n.type === 'warning' ? (
                          <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-cit-petroleo/10 text-cit-petroleo flex items-center justify-center font-bold text-xs">
                            <Info className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                          {n.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-gray-50 border-t border-gray-200 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifOpen(false)
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

        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-gray-900 leading-tight truncate max-w-44">
            {user?.nombre || 'Usuario'}
          </p>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-cit-petroleo/10 text-cit-petroleo border border-cit-petroleo/20 mt-0.5 uppercase tracking-tight">
            {user?.rol || 'Personal Científico'}
          </span>
        </div>

        <Avatar className="h-8 w-8 ring-2 ring-cit-petroleo/20">
          <AvatarFallback className="bg-cit-petroleo text-white font-bold text-xs">
            {userInitial}
          </AvatarFallback>
        </Avatar>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="p-2 text-gray-500 hover:text-cit-petroleo hover:bg-gray-100 transition-colors"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
