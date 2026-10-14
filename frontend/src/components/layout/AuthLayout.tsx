import type { ReactNode } from 'react'

export interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
  variant?: 'default' | 'glass'
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  wide = false,
  variant = 'default',
}: AuthLayoutProps) {
  if (variant === 'glass') {
    return (
      <main className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 py-8 sm:py-12 overflow-x-hidden">
        {/* Background image & dark petrol overlay */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div
            className="absolute -inset-4 bg-cover bg-center filter blur-[4px] scale-105"
            style={{ backgroundImage: "url('/laboratorio.jpeg')" }}
          />
          <div
            className="absolute inset-0 bg-[#002d41]/75 backdrop-blur-[1px]"
            style={{
              background:
                'linear-gradient(135deg, rgba(0, 45, 65, 0.85) 0%, rgba(1, 40, 60, 0.78) 50%, rgba(1, 75, 95, 0.8) 100%)',
            }}
          />
        </div>

        {/* Tarjeta central Glassmorphism */}
        <div className={`relative z-10 w-full my-auto ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
          <div
            className="w-full rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 backdrop-blur-xl border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
            style={{ backgroundColor: 'rgba(5, 40, 58, 0.85)' }}
          >
            {/* Logo CIT Formosa en PNG transparente con glow sutil */}
            <div
              id="logo-auth-placeholder"
              className="mx-auto mb-6 flex items-center justify-center"
            >
              <img
                src="/logo2.png"
                alt="Centro de Investigación y Transferencia - CIT Formosa"
                className="w-auto h-auto max-w-full object-contain select-none transition-transform duration-200 hover:scale-[1.02]"
                style={{
                  width: 'clamp(200px, 24vw, 300px)',
                  height: 'auto',
                  filter:
                    'drop-shadow(0 0 1.5px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 8px rgba(79, 195, 199, 0.45)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))',
                }}
              />
            </div>

            {/* Título y subtítulo */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                {title}
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-white/75 max-w-sm mx-auto leading-relaxed">
                {subtitle}
              </p>
            </div>

            {children}

            {footer && (
              <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs sm:text-sm text-white/75">
                {footer}
              </div>
            )}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-cit-turquesa via-cit-petroleo to-cit-azul-oscuro flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className={`w-full ${wide ? 'max-w-xl' : 'max-w-md'}`}>
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 border border-white/20">
          <div
            id="logo-auth-placeholder"
            className="mx-auto mb-6 sm:mb-8 flex items-center justify-center"
          >
            <img
              src="/logo2.png"
              alt="Centro de Investigación y Transferencia - CIT Formosa"
              className="h-20 sm:h-24 md:h-28 w-auto max-w-[280px] sm:max-w-[340px] object-contain select-none transition-transform duration-200 hover:scale-[1.02]"
            />
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-800">
              {title}
            </h1>

            <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
          </div>

          {children}

          {footer && (
            <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-600">
              {footer}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

