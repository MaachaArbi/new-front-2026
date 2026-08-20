import * as React from 'react'
import { cn } from '@/shared/lib/cn'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot as SlotPrimitive } from 'radix-ui'

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
  dotClassName?: string
  disabled?: boolean
}

export interface BadgeButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeButtonVariants> {
  asChild?: boolean
}

export type BadgeDotProps = React.HTMLAttributes<HTMLSpanElement>

const badgeVariants = cva(
  'inline-flex items-center justify-center border border-transparent font-medium focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 [&_svg]:-ms-px [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-fill-primary text-on-primary',
        secondary: 'bg-secondary text-ink',
        success: 'bg-fill-success text-on-success',
        warning: 'bg-fill-warning text-on-warning',
        info: 'bg-fill-info text-on-info',
        outline: 'border-border bg-transparent border text-ink-secondary',
        destructive: 'bg-fill-danger text-on-danger',
      },
      appearance: {
        default: '',
        light: '',
        outline: '',
        ghost: 'border-transparent bg-transparent',
      },
      disabled: {
        true: 'opacity-50 pointer-events-none',
      },
      size: {
        lg: 'rounded-md px-[0.5rem] h-7 min-w-7 gap-1.5 text-xs [&_svg]:size-3.5',
        md: 'rounded-md px-[0.45rem] h-6 min-w-6 gap-1.5 text-xs [&_svg]:size-3.5 ',
        sm: 'rounded-sm px-[0.325rem] h-5 min-w-5 gap-1 text-[0.6875rem] leading-[0.75rem] [&_svg]:size-3',
        xs: 'rounded-sm px-[0.25rem] h-4 min-w-4 gap-1 text-[0.625rem] leading-[0.5rem] [&_svg]:size-3',
      },
      shape: {
        default: '',
        circle: 'rounded-full',
      },
    },
    compoundVariants: [
      /* Light */
      {
        variant: 'primary',
        appearance: 'light',
        className: 'bg-bg-primary text-ink-link',
      },
      {
        variant: 'secondary',
        appearance: 'light',
        className: 'bg-muted text-ink-secondary',
      },
      {
        variant: 'success',
        appearance: 'light',
        className: 'bg-bg-success text-text-success',
      },
      {
        variant: 'warning',
        appearance: 'light',
        className: 'bg-bg-warning text-text-warning',
      },
      {
        variant: 'info',
        appearance: 'light',
        className: 'bg-bg-info text-text-info',
      },
      {
        variant: 'destructive',
        appearance: 'light',
        className: 'bg-bg-danger text-text-danger',
      },
      /* Outline */
      {
        variant: 'primary',
        appearance: 'outline',
        className: 'border-border-primary bg-bg-primary text-ink-link',
      },
      {
        variant: 'success',
        appearance: 'outline',
        className: 'border-border-success bg-bg-success text-text-success',
      },
      {
        variant: 'warning',
        appearance: 'outline',
        className: 'border-border-warning bg-bg-warning text-text-warning',
      },
      {
        variant: 'info',
        appearance: 'outline',
        className: 'border-border-info bg-bg-info text-text-info',
      },
      {
        variant: 'destructive',
        appearance: 'outline',
        className: 'border-border-danger bg-bg-danger text-text-danger',
      },
      /* Ghost */
      { variant: 'primary', appearance: 'ghost', className: 'text-ink-link' },
      {
        variant: 'secondary',
        appearance: 'ghost',
        className: 'text-ink-secondary',
      },
      {
        variant: 'success',
        appearance: 'ghost',
        className: 'text-text-success',
      },
      {
        variant: 'warning',
        appearance: 'ghost',
        className: 'text-text-warning',
      },
      { variant: 'info', appearance: 'ghost', className: 'text-text-info' },
      {
        variant: 'destructive',
        appearance: 'ghost',
        className: 'text-text-danger',
      },

      { size: 'lg', appearance: 'ghost', className: 'px-0' },
      { size: 'md', appearance: 'ghost', className: 'px-0' },
      { size: 'sm', appearance: 'ghost', className: 'px-0' },
      { size: 'xs', appearance: 'ghost', className: 'px-0' },
    ],
    defaultVariants: {
      variant: 'primary',
      appearance: 'default',
      size: 'md',
    },
  }
)

const badgeButtonVariants = cva(
  'cursor-pointer transition-all inline-flex items-center justify-center leading-none size-3.5 [&>svg]:opacity-100! [&>svg]:size-3.5! p-0 rounded-md -me-0.5 opacity-60 hover:opacity-100',
  {
    variants: {
      variant: {
        default: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant,
  size,
  appearance,
  shape,
  asChild = false,
  disabled,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? SlotPrimitive.Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(
        badgeVariants({ variant, size, appearance, shape, disabled }),
        className
      )}
      {...props}
    />
  )
}

function BadgeButton({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof badgeButtonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? SlotPrimitive.Slot : 'span'
  return (
    <Comp
      data-slot="badge-button"
      className={cn(badgeButtonVariants({ variant, className }))}
      role="button"
      {...props}
    />
  )
}

function BadgeDot({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="badge-dot"
      className={cn(
        'size-1.5 rounded-full bg-[currentColor] opacity-75',
        className
      )}
      {...props}
    />
  )
}

export { Badge, BadgeButton, BadgeDot, badgeVariants }
