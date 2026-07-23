'use client'

import * as React from 'react'
import { cn } from '@/shared/lib/cn'
import { cva, VariantProps } from 'class-variance-authority'
import { Avatar as AvatarPrimitive } from 'radix-ui'

const avatarStatusVariants = cva(
  'flex items-center rounded-full size-2 border-2 border-background',
  {
    variants: {
      // Pas de palette de statut dans nos tokens (ADR-F03 renvoie les couleurs
      // au catalogue de thèmes fermé, non encore défini). On mappe donc sur les
      // tokens sémantiques existants plutôt que d'introduire des couleurs brutes
      // (ADR-F04/§9). Les vraies teintes de statut viendront avec le catalogue.
      variant: {
        online: 'bg-primary',
        offline: 'bg-muted-foreground',
        busy: 'bg-destructive',
        away: 'bg-secondary-foreground',
      },
    },
    defaultVariants: {
      variant: 'online',
    },
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
        className={cn('aspect-square h-full w-full')}
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
