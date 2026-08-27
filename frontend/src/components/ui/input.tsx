import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    const inputId = id ?? props.name
    const inputElement = (
      <input
        type={type}
        id={inputId}
        className={cn(
          'flex h-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2 text-sm text-gray-900 shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cit-turquesa focus-visible:border-cit-turquesa disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500',
          className
        )}
        ref={ref}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
    )

    if (label || error) {
      return (
        <div className="flex flex-col gap-1.5 w-full">
          {label && (
            <label htmlFor={inputId} className="text-sm font-medium text-gray-800">
              {label}
            </label>
          )}
          {inputElement}
          {error && (
            <p id={`${inputId}-error`} className="text-xs font-medium text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      )
    }

    return inputElement
  }
)
Input.displayName = 'Input'

export { Input }
