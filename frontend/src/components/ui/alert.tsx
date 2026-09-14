import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4',
  {
    variants: {
      variant: {
        default: 'bg-white text-gray-900 border-gray-200 [&>svg]:text-gray-900',
        destructive:
          'border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600',
        error:
          'border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600',
        success:
          'border-emerald-200 bg-emerald-50 text-emerald-900 [&>svg]:text-emerald-600',
        info:
          'border-sky-200 bg-sky-50 text-sky-900 [&>svg]:text-cit-petroleo',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  message?: string
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', title, message, children, ...props }, ref) => {
    const Icon =
      variant === 'error' || variant === 'destructive'
        ? AlertCircle
        : variant === 'success'
        ? CheckCircle2
        : Info

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <Icon className="h-4 w-4" />
        <div className="flex flex-col gap-1">
          {title && <h5 className="font-semibold leading-none tracking-tight">{title}</h5>}
          {message && <div className="text-sm leading-relaxed">{message}</div>}
          {children}
        </div>
      </div>
    )
  }
)
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
