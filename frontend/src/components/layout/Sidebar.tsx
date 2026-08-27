import { type FC } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FlaskConical,
  ArrowLeftRight,
  FolderGit2,
  CalendarDays,
  FileCheck2,
  BarChart3,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useAuth } from '@/context'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

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

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Módulos Científicos',
    items: [
      {
        id: 'inventario',
        label: 'Inventario científico',
        path: '/inventario',
        icon: FlaskConical,
      },
      {
        id: 'movimientos',
        label: 'Stock y movimientos',
        path: '/movimientos',
        icon: ArrowLeftRight,
      },
      {
        id: 'proyectos',
        label: 'Proyectos de investigación',
        path: '/proyectos',
        icon: FolderGit2,
      },
      {
        id: 'reservas',
        label: 'Reservas y solicitudes',
        path: '/reservas',
        icon: CalendarDays,
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
        icon: FileCheck2,
      },
      {
        id: 'reportes',
        label: 'Alertas y reportes',
        path: '/reportes',
        icon: BarChart3,
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
        icon: ShieldCheck,
        roles: ['Dirección', 'Administración'],
      },
    ],
  },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const { user } = useAuth()

  const sidebarNavContent = (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="h-16 px-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
        <Link
          to="/dashboard"
          onClick={onClose}
          className="flex items-center hover:opacity-90 transition-opacity"
        >
          <img
            src="/logo2.png"
            alt="CIT Formosa"
            className="h-9 sm:h-10 w-auto max-w-[190px] object-contain select-none"
          />
        </Link>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-gray-600 hover:text-cit-petroleo hover:bg-gray-200"
          aria-label="Cerrar menú"
        >
          <X className="h-4 w-4" />
        </Button>
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
    </div>
  )

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        hideCloseButton
        className="w-72 sm:w-80 p-0 border-r border-gray-200"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menú de navegación</SheetTitle>
        </SheetHeader>
        {sidebarNavContent}
      </SheetContent>
    </Sheet>
  )
}
