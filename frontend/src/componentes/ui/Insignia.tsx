import type { ReactNode } from 'react'

const COLORES = {
  verde: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rojo: 'bg-red-100 text-red-700 border-red-200',
  ambar: 'bg-amber-100 text-amber-800 border-amber-200',
  celeste: 'bg-sky-100 text-sky-800 border-sky-200',
  turquesa: 'bg-teal-100 text-teal-800 border-teal-200',
  rosa: 'bg-rose-100 text-rose-800 border-rose-200',
  violeta: 'bg-violet-100 text-violet-800 border-violet-200',
  gris: 'bg-gray-100 text-gray-800 border-gray-200',
}

export type Color = keyof typeof COLORES

interface PropsInsignia {
  color: Color
  children: ReactNode
  className?: string
}

// Pastilla de color para mostrar un estado o un tipo (por ejemplo "Pendiente" o "Egreso").
export function Insignia({ color, children, className = '' }: PropsInsignia) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase ${COLORES[color]} ${className}`}
    >
      {children}
    </span>
  )
}

// Recuadro celeste para la categoría o el tipo de un registro.
export function EtiquetaCategoria({ children }: { children: ReactNode }) {
  return (
    <span className="px-2 py-0.5 rounded bg-cit-petroleo/10 border border-cit-petroleo/20 text-cit-petroleo text-[11px] font-semibold capitalize">
      {children}
    </span>
  )
}
