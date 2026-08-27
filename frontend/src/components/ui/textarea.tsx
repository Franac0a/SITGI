import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id ?? props.name
    const textareaElement = (
      <textarea
        id={textareaId}
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 shadow-xs transition-colors placeholder:text-gray-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cit-turquesa focus-visible:border-cit-turquesa disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500',
          className
        )}
        ref={ref}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...props}
      />
    )

    if (label || error) {
      return (
        <div className="flex flex-col gap-1.5 w-full">
          {label && (
            <label
              htmlFor={textareaId}
              className="text-sm font-medium text-gray-800"
            >
              {label}
            </label>
          )}
          {textareaElement}
          {error && (
            <p
              id={`${textareaId}-error`}
              className="text-xs font-medium text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
      )
    }

    return textareaElement
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
