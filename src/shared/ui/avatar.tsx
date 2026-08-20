/**
 * AVATAR — prélevé de `vendor-metronic/full/src/components/ui/avatar.tsx`.
 *
 * ── ÉCART ASSUMÉ ───────────────────────────────────────────────────────────────
 * Les quatre pastilles d'état écrivaient des couleurs LITTÉRALES
 * (`bg-green-600`, `bg-zinc-600 dark:bg-zinc-300`, `bg-yellow-600`,
 * `bg-blue-600`). Notre lint les refuse, et à raison : elles n'auraient suivi
 * aucun changement de palette. Elles passent aux jetons d'état — le vert de
 * « en ligne » est désormais LE vert du système, pas un vert d'à côté.
 *
 * `offline` prend `--border-stronger` : un état neutre ne mérite pas une couleur.
 */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Avatar as AvatarPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/cn'

const avatarStatusVariants = cva(
  'border-background flex size-2 items-center rounded-full border-2',
  {
    variants: {
      variant: {
        online: 'bg-fill-success',
        offline: 'bg-border-stronger',
        busy: 'bg-fill-warning',
        away: 'bg-fill-info',
      },
    },
    defaultVariants: { variant: 'online' },
  }
)

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn('relative flex size-10 shrink-0', className)}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <div className={cn('relative overflow-hidden rounded-full', className)}>
      <AvatarPrimitive.Image
        data-slot="avatar-image"
        className="aspect-square h-full w-full"
        {...props}
      />
    </div>
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'border-border bg-accent text-accent-foreground flex h-full w-full items-center justify-center rounded-full border text-xs',
        className
      )}
      {...props}
    />
  )
}

function AvatarIndicator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="avatar-indicator"
      className={cn(
        'absolute flex size-6 items-center justify-center',
        className
      )}
      {...props}
    />
  )
}

function AvatarStatus({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof avatarStatusVariants>) {
  return (
    <div
      data-slot="avatar-status"
      className={cn(avatarStatusVariants({ variant }), className)}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
  AvatarStatus,
  avatarStatusVariants,
}
