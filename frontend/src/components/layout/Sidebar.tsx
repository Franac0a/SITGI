import { type FC } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  id: string
  label: string
  path: string
  roles?: string[]
  icon: FC<{ className?: string }>
}

interface NavGroup {
  title: string
  items: NavItem[]
}

function FlaskIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
      />
    </svg>
  )
}

function ArrowPathRoundedSquareIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
      />
    </svg>
  )
}

function FolderGitIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  )
}

function CalendarDaysIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}

function DocumentCheckIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )
}

function ChartBarSquareIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  )
}

function ShieldCheckIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  )
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Módulos Científicos',
    items: [
      {
        id: 'inventario',
        label: 'Inventario científico',
        path: '/inventario',
        icon: FlaskIcon,
      },
      {
        id: 'movimientos',
        label: 'Stock y movimientos',
        path: '/movimientos',
        icon: ArrowPathRoundedSquareIcon,
      },
      {
        id: 'proyectos',
        label: 'Proyectos de investigación',
        path: '/proyectos',
        icon: FolderGitIcon,
      },
      {
        id: 'reservas',
        label: 'Reservas y solicitudes',
        path: '/reservas',
        icon: CalendarDaysIcon,
      },
    ],
  },
  {
    title: 'Gestión & Documentación',
    items: [
      {
        id: 'documentos',
        label: 'Documentos asociados',
        path: '/documentos',
        icon: DocumentCheckIcon,
      },
      {
        id: 'reportes',
        label: 'Alertas y reportes',
        path: '/reportes',
        icon: ChartBarSquareIcon,
      },
    ],
  },
  {
    title: 'Administración LIMS',
    items: [
      {
        id: 'usuarios',
        label: 'Usuarios y roles',
        path: '/admin/usuarios',
        icon: ShieldCheckIcon,
        roles: ['Dirección', 'Administración'],
      },
    ],
  },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-50 border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <Link
            to="/dashboard"
            onClick={onClose}
            className="flex items-center hover:opacity-90 transition-opacity"
          >
            <img
              src="/logo2.png"
              alt="CIT Formosa"
              className="h-8 w-auto max-w-44 object-contain"
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-600 hover:text-cit-petroleo hover:bg-gray-200 transition-colors focus:outline-none"
            aria-label="Cerrar menú"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter((item) => {
              if (!item.roles) return true
              return user && item.roles.includes(user.rol)
            })

            if (visibleItems.length === 0) return null

            return (
              <div key={group.title} className="space-y-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-cit-petroleo">
                  {group.title}
                </p>

                <div className="mt-1 space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive =
                      location.pathname === item.path ||
                      (item.path !== '/dashboard' &&
                        location.pathname.startsWith(item.path))
                    const Icon = item.icon

                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={onClose}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                          isActive
                            ? 'bg-cit-petroleo/10 text-cit-petroleo font-semibold border-l-4 border-cit-petroleo'
                            : 'text-gray-800 hover:bg-gray-200/60 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={`w-5 h-5 shrink-0 transition-colors ${
                              isActive
                                ? 'text-cit-petroleo'
                                : 'text-cit-azul-fuerte/70 group-hover:text-cit-petroleo'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
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
      </aside>
    </>
  )
}
