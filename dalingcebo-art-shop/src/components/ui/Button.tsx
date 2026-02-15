import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'

const buttonVariants = cva(
  // Base styles - consistent with existing btn-yeezy styles
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium uppercase tracking-[0.1em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-black text-white border border-black hover:bg-gray-800 focus-visible:ring-black',
        secondary: 'bg-white text-black border border-gray-300 hover:bg-gray-50 focus-visible:ring-black',
        ghost: 'border-transparent hover:bg-gray-100 focus-visible:ring-black',
        destructive: 'text-red-600 hover:text-red-800 border-transparent hover:bg-red-50 focus-visible:ring-red-600',
        link: 'text-gray-600 hover:text-black border-transparent underline-offset-4 hover:underline focus-visible:ring-black',
        icon: 'border-transparent hover:bg-gray-100 focus-visible:ring-black',
      },
      size: {
        // default: 48px desktop / 44px mobile
        default: 'h-11 md:h-12 px-6 text-[11px]',
        // sm: 36px
        sm: 'h-9 px-4 text-[10px]',
        // icon: 44px square on mobile, 40px on desktop for better click targets
        icon: 'h-11 w-11 md:h-10 md:w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={clsx(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
