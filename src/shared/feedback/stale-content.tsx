/**
 * Estompage des listes qui rechargent (ADR-F20.4) : « les listes ne clignotent
 * jamais ». Pendant un rechargement, les données précédentes **restent
 * affichées**, légèrement estompées, au lieu de disparaître derrière un
 * squelette. Ce composant pose l'**effet visuel** ; le câblage réel viendra avec
 * TanStack Query (`placeholderData`/`keepPreviousData`) et les vraies listes.
 *
 * Aucune classe directionnelle physique (RTL-safe).
 */

import * as React from 'react'
import { cn } from '@/shared/lib/cn'

interface StaleContentProps extends React.ComponentProps<'div'> {
  /** `true` pendant un rechargement : le contenu s'estompe sans sauter. */
  stale?: boolean
}

function StaleContent({
  stale = false,
  className,
  children,
  ...props
}: StaleContentProps) {
  return (
    <div
      data-slot="stale-content"
      aria-busy={stale || undefined}
      className={cn(
        'transition-opacity duration-200',
        stale && 'pointer-events-none opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { StaleContent }
