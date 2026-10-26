import type { ReactNode } from 'react'

// Texto chico en mayúsculas que va arriba de los títulos.
export function EtiquetaSeccion({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-wider text-cit-petroleo bg-cit-petroleo/10 px-2.5 py-0.5 rounded-full border border-cit-petroleo/20">
      {children}
    </span>
  )
}

interface PropsEncabezado {
  etiqueta: string
  titulo: string
  descripcion: ReactNode
  // Botones que van a la derecha del título.
  children?: ReactNode
}

// Parte de arriba de cada página: etiqueta, título y descripción.
export function EncabezadoPagina({ etiqueta, titulo, descripcion, children }: PropsEncabezado) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <EtiquetaSeccion>{etiqueta}</EtiquetaSeccion>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{titulo}</h1>
        <p className="text-sm text-gray-600 mt-1">{descripcion}</p>
      </div>
      {children}
    </div>
  )
}
