import { type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isDireccion = user?.rol === 'Dirección'

  const navItems = [
    { label: 'Gestión de Usuarios', path: '/admin/usuarios', show: isDireccion },
  ]

  const getRoleBadgeStyle = (rol?: string) => {
    switch (rol) {
      case 'Dirección':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Administración':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Inventario':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              <Link to="/admin/usuarios" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-bordo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-bordo-700 transition-colors">
                  CIT
                </div>
                <div>
                  <div className="font-bold text-gray-900 leading-none flex items-center gap-1.5">
                    SITGI
                    <span className="text-xs px-2 py-0.5 rounded-full bg-bordo-50 text-bordo-700 font-semibold border border-bordo-100">
                      CIT Formosa
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                    Sistema Integral de Gestión de Inventario
                  </p>
                </div>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems
                .filter((item) => item.show)
                .map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-bordo-50 text-bordo-700 font-semibold'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
            </nav>

            {/* User Profile & Actions */}
            <div className="flex items-center gap-3">
              {user && (
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {user.nombre}
                  </p>
                  <span
                    className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded border mt-0.5 ${getRoleBadgeStyle(
                      user.rol,
                    )}`}
                  >
                    {user.rol}
                  </span>
                </div>
              )}

              <div className="w-9 h-9 rounded-full bg-bordo-100 text-bordo-700 font-bold flex items-center justify-center text-sm border border-bordo-200">
                {user?.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar sesión"
                className="ml-1 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        CIT Formosa &bull; Centro de Investigaciones y Transferencia de Formosa &bull; Sistema SITGI
      </footer>
    </div>
  )
}
