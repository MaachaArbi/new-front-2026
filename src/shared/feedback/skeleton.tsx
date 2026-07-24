/**
 * Squelettes de chargement (ADR-F20.3) : « un squelette, jamais un spinner ».
 * Un squelette montre la **forme** de ce qui arrive ; la mise en page ne saute
 * pas à l'arrivée des données.
 *
 * Placés hors de `src/shared/ui/` (réservé aux composants prélevés ReUI, §6) :
 * ce sont des primitives maison, sans dépendance, en tokens sémantiques.
 * Aucune classe directionnelle physique (RTL-safe).
 */

import * as React from 'react'
import { cn } from '@/shared/lib/cn'

/** Bloc gris animé de base. Toute forme de squelette s'en compose. */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('bg-muted animate-pulse rounded-md', className)}
      {...props}
    />
  )
}

/** Lignes de texte (la dernière plus courte, comme un vrai paragraphe). */
function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-3.5', index === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  )
}

/** Ligne de tableau : plusieurs cellules alignées. */
function SkeletonRow({
  columns = 4,
  className,
}: {
  columns?: number
  className?: string
}) {
  return (
    <div
      className={cn('flex items-center gap-4', className)}
      data-slot="skeleton-row"
    >
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} className="h-4 flex-1" />
      ))}
    </div>
  )
}

/** Carte : titre + lignes de texte, encadrée. */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'border-border flex flex-col gap-4 rounded-xl border p-5',
        className
      )}
      data-slot="skeleton-card"
    >
      <Skeleton className="h-5 w-1/3" />
      <SkeletonText lines={3} />
    </div>
  )
}

/** Champ de formulaire : libellé court + zone de saisie. */
function SkeletonField({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex flex-col gap-1.5', className)}
      data-slot="skeleton-field"
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8.5 w-full" />
    </div>
  )
}

export { Skeleton, SkeletonText, SkeletonRow, SkeletonCard, SkeletonField }
