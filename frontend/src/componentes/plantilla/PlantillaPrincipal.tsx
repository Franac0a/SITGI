import { useState, type ReactNode } from 'react'
import { BarraSuperior } from './BarraSuperior'
import { MenuLateral } from './MenuLateral'

// Estructura común de las páginas internas: menú lateral, barra superior y contenido.
export function PlantillaPrincipal({ children }: { children: ReactNode }) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="min-h-screen w-full flex flex-col bg-white text-gray-900 font-sans antialiased">
      <MenuLateral abierto={menuAbierto} alCerrar={() => setMenuAbierto(false)} />

      <BarraSuperior alTocarMenu={() => setMenuAbierto(!menuAbierto)} />

      <main className="flex-1 flex flex-col bg-white p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col">{children}</div>
      </main>
    </div>
  )
}
