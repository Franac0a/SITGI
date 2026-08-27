import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cit-turquesa focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-cit-petroleo text-white hover:bg-cit-azul-fuerte',
        secondary:
          'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
        destructive:
          'border-transparent bg-red-600 text-white hover:bg-red-700',
        outline: 'text-gray-900 border-gray-300',
        cit: 'border-cit-petroleo/20 bg-cit-petroleo/10 text-cit-petroleo',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        warning: 'border-amber-200 bg-amber-50 text-amber-700',
        info: 'border-sky-200 bg-sky-50 text-sky-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
