import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context'

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

export function Header({ onToggleSidebar, notifications: initialNotifications = [] }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
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

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-18 w-full border-b border-gray-200 bg-white px-4 sm:px-6 flex items-center justify-between shrink-0 transition-all">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-gray-700 hover:text-cit-petroleo hover:bg-gray-100 focus:outline-none transition-colors"
          aria-label="Alternar menú de navegación"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <Link to="/dashboard" className="flex items-center gap-2 shrink-0 hover:opacity-90 transition-opacity">
          <img
            src="/logo2.png"
            alt="Centro de Investigación y Transferencia - CIT Formosa"
            className="h-10 sm:h-11 md:h-12 w-auto max-w-[200px] sm:max-w-[280px] md:max-w-[320px] object-contain select-none"
          />
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className={`relative p-2 rounded-lg transition-colors focus:outline-none ${
              isNotifOpen
                ? 'bg-cit-petroleo/10 text-cit-petroleo'
                : 'text-gray-700 hover:text-cit-petroleo hover:bg-gray-100'
            }`}
            aria-label="Notificaciones"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cit-petroleo text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

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
                            !
                          </div>
                        ) : n.type === 'warning' ? (
                          <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                            *
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-cit-petroleo/10 text-cit-petroleo flex items-center justify-center font-bold text-xs">
                            i
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

        <div
          className="w-8 h-8 rounded-full bg-cit-petroleo text-white font-bold flex items-center justify-center text-xs shrink-0"
          title={user?.nombre || 'Usuario'}
        >
          {user?.nombre?.charAt(0).toUpperCase() || 'U'}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-lg text-gray-500 hover:text-cit-petroleo hover:bg-gray-100 transition-colors focus:outline-none"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </header>
  )
}
