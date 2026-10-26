import type { InputHTMLAttributes } from 'react'
import { CampoTexto } from '@/componentes/ui/CampoTexto'

interface PropsCampoAcceso extends InputHTMLAttributes<HTMLInputElement> {
  name: string
  etiqueta: string
  error?: string
}

// Campo de los formularios de login y registro: si hay un error,
// la etiqueta se pone roja y el mensaje aparece debajo.
export function CampoAcceso({ name, etiqueta, error, ...resto }: PropsCampoAcceso) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className={`text-sm font-medium leading-none select-none ${error ? 'text-red-600' : 'text-gray-800'}`}
      >
        {etiqueta}
      </label>
      <CampoTexto id={name} name={name} aria-invalid={Boolean(error)} {...resto} />
      {error && (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
