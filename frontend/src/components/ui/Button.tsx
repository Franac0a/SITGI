import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  isLoading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-cit-petroleo text-white hover:bg-cit-azul-fuerte active:bg-cit-azul-oscuro focus-visible:ring-cit-turquesa disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
  secondary:
    'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 hover:border-cit-petroleo hover:text-cit-petroleo focus-visible:ring-cit-turquesa disabled:text-gray-400',
  ghost:
    'bg-transparent text-cit-petroleo hover:bg-cit-petroleo/10 focus-visible:ring-cit-turquesa disabled:text-gray-400',
  outline:
    'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-cit-petroleo hover:border-cit-petroleo focus-visible:ring-cit-turquesa disabled:text-gray-400',
}

export function Button({
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer',
        'disabled:cursor-not-allowed',
        fullWidth ? 'w-full' : '',
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {isLoading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}
