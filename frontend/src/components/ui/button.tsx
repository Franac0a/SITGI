import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cit-turquesa focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-cit-petroleo text-white hover:bg-cit-azul-fuerte active:bg-cit-azul-oscuro shadow-sm',
        primary:
          'bg-cit-petroleo text-white hover:bg-cit-azul-fuerte active:bg-cit-azul-oscuro shadow-sm',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        outline:
          'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-cit-petroleo hover:border-cit-petroleo',
        secondary:
          'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 hover:border-cit-petroleo hover:text-cit-petroleo',
        ghost:
          'bg-transparent text-cit-petroleo hover:bg-cit-petroleo/10',
        link:
          'text-cit-petroleo underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2.5',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-8 text-base',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
