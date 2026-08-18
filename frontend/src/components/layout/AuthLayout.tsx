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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex max-w-xs items-center justify-center">
            <img
              src="/logo.png"
              alt="Centro de Investigación y Transferencia - CIT Formosa"
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bordo-600">
            CIT Formosa
          </p>
          <h1 className="mt-2 text-2xl font-bold text-black">{title}</h1>
          <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
        </div>

        <div
          className={[
            'mx-auto w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8',
            wide ? 'max-w-xl' : 'max-w-md',
          ].join(' ')}
        >
          {children}
        </div>

        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
      </div>
    </div>
  )
}
