import type { ReactNode } from 'react'

interface PropsPlantillaAcceso {
  titulo: string
  subtitulo: string
  children: ReactNode
  pie: ReactNode
  ancha?: boolean
}

// Tarjeta centrada con el logo que usan el login y el registro.
export function PlantillaAcceso({ titulo, subtitulo, children, pie, ancha = false }: PropsPlantillaAcceso) {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-cit-turquesa via-cit-petroleo to-cit-azul-oscuro flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className={`w-full ${ancha ? 'max-w-xl' : 'max-w-md'}`}>
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 border border-white/20">
          <div className="mx-auto mb-6 sm:mb-8 flex items-center justify-center">
            <img
              src="/logo2.png"
              alt="Centro de Investigación y Transferencia - CIT Formosa"
              className="h-20 sm:h-24 md:h-28 w-auto max-w-[280px] sm:max-w-[340px] object-contain select-none transition-transform duration-200 hover:scale-[1.02]"
            />
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-800">{titulo}</h1>
            <p className="mt-2 text-sm text-gray-600">{subtitulo}</p>
          </div>

          {children}

          <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-600">{pie}</div>
        </div>
      </div>
    </main>
  )
}
