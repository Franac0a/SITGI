import type { SelectHTMLAttributes } from 'react'
import type { Opcion } from '@/tipos'
import { unirClases } from '@/utilidades/clases'

interface PropsSelector extends SelectHTMLAttributes<HTMLSelectElement> {
  opciones: Opcion[]
  etiqueta?: string
  // Texto de la primera opción, la que queda vacía.
  textoVacio?: string
  error?: string
}

export function Selector({
  opciones,
  etiqueta,
  textoVacio = 'Seleccionar',
  error,
  id,
  className,
  ...resto
}: PropsSelector) {
  const idCampo = id ?? resto.name

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {etiqueta && (
        <label htmlFor={idCampo} className="text-sm font-medium text-gray-800">
          {etiqueta}
        </label>
      )}
      <div className="relative">
        <select
          id={idCampo}
          className={unirClases(
            'w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 shadow-xs transition-all duration-150 appearance-none pr-10 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cit-turquesa focus:border-cit-turquesa disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 ring-1 ring-red-500 focus:ring-red-500',
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${idCampo}-error` : undefined}
          {...resto}
        >
          <option value="">{textoVacio}</option>
          {opciones.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.texto}
            </option>
          ))}
        </select>
        {/* Flechita del costado derecho */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p id={`${idCampo}-error`} className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
