import type { InputHTMLAttributes } from 'react'
import { unirClases } from '@/utilidades/clases'

interface PropsCampoTexto extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta?: string
  error?: string
}

// Un <input> con su etiqueta arriba y el mensaje de error abajo (si hay).
export function CampoTexto({ etiqueta, error, id, className, ...resto }: PropsCampoTexto) {
  const idCampo = id ?? resto.name

  const campo = (
    <input
      id={idCampo}
      className={unirClases(
        'flex h-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2 text-sm text-gray-900 shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cit-turquesa focus-visible:border-cit-turquesa disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500',
        className,
      )}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${idCampo}-error` : undefined}
      {...resto}
    />
  )

  // Sin etiqueta ni error se devuelve solo el input.
  if (!etiqueta && !error) return campo

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {etiqueta && (
        <label htmlFor={idCampo} className="text-sm font-medium text-gray-800">
          {etiqueta}
        </label>
      )}
      {campo}
      {error && (
        <p id={`${idCampo}-error`} className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
