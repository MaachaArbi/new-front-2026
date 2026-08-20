/**
 * SQUELETTE — prélevé de `vendor-metronic/full/src/components/ui/skeleton.tsx`.
 * Seul le chemin d'import change. `bg-accent` est déjà un jeton.
 */
import * as React from 'react'
import { cn } from '@/shared/lib/cn'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  )
}

export { Skeleton }
