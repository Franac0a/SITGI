import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: readonly SelectOption[]
  placeholder?: string
  error?: string
}

export function Select({
  label,
  options,
  placeholder = 'Seleccionar',
  error,
  id,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id ?? props.name

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-gray-800">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={[
            'w-full rounded-lg border bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900',
            'transition-all duration-150 appearance-none pr-10',
            'focus:bg-white focus:outline-none focus:ring-2 focus:ring-cit-turquesa focus:border-cit-turquesa',
            error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p id={`${selectId}-error`} className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
