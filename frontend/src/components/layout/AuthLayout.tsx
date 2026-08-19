import type { ReactNode } from 'react'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: AuthLayoutProps) {
  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex max-w-xs items-center justify-center">
            <img
              src="/logo2.png"
              alt="Centro de Investigación y Transferencia - CIT Formosa"
              className="h-14 sm:h-16 w-auto object-contain"
            />
=======
    <main className="min-h-screen w-full bg-gradient-to-br from-cit-turquesa via-cit-petroleo to-cit-azul-oscuro flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className={`w-full ${wide ? 'max-w-xl' : 'max-w-md'}`}>
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 border border-white/20">
          <div
            id="logo-auth-placeholder"
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gray-50 border border-gray-200"
          >
            <span className="text-xl font-bold tracking-wider text-cit-petroleo">
              CIT
            </span>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-800">
              {title}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {subtitle}
            </p>
>>>>>>> develop
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
