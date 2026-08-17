type AlertVariant = 'error' | 'success' | 'info'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  message: string
}

const variantStyles: Record<AlertVariant, string> = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-green-200 bg-green-50 text-green-800',
  info: 'border-gray-200 bg-gray-50 text-gray-800',
}

export function Alert({ variant = 'error', title, message }: AlertProps) {
  return (
    <div
      className={[
        'rounded-md border px-4 py-3 text-sm',
        variantStyles[variant],
      ].join(' ')}
      role="alert"
    >
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <p>{message}</p>
    </div>
  )
}
