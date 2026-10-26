import type { ButtonHTMLAttributes } from 'react'
import { unirClases } from '@/utilidades/clases'

const ESTILO_BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cit-turquesa focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none'

const ESTILOS_VARIANTE = {
  primario: 'bg-cit-petroleo text-white hover:bg-cit-azul-fuerte active:bg-cit-azul-oscuro shadow-sm',
  secundario:
    'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 hover:border-cit-petroleo hover:text-cit-petroleo',
  contorno:
    'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-cit-petroleo hover:border-cit-petroleo',
  fantasma: 'bg-transparent text-cit-petroleo hover:bg-cit-petroleo/10',
}

const ESTILOS_TAMANO = {
  normal: 'h-10 px-4 py-2.5',
  icono: 'h-10 w-10',
}

interface PropsBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: keyof typeof ESTILOS_VARIANTE
  tamano?: keyof typeof ESTILOS_TAMANO
  anchoCompleto?: boolean
  cargando?: boolean
}

export function Boton({
  variante = 'primario',
  tamano = 'normal',
  anchoCompleto = false,
  cargando = false,
  disabled,
  className,
  children,
  ...resto
}: PropsBoton) {
  return (
    <button
      className={unirClases(
        ESTILO_BASE,
        ESTILOS_VARIANTE[variante],
        ESTILOS_TAMANO[tamano],
        anchoCompleto && 'w-full',
        className,
      )}
      disabled={disabled || cargando}
      {...resto}
    >
      {cargando && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}
