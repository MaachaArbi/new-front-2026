import * as React from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * État vide d'une liste — « Aucun document », « Aucun interlocuteur »…
 *
 * Pourquoi un composant : une liste vide est un **moment de vérité** dans un ERP.
 * Écrite à la main dix fois, la phrase se retrouvait tantôt dans la carte, tantôt en
 * dehors, avec des marges différentes. Et surtout : c'est ici qu'on pourra ajouter une
 * ACTION (« Ajouter un document ») le jour où on le décidera — en un seul endroit.
 */
export function EmptyState({
  children,
  action,
  className,
}: {
  children: React.ReactNode
  /** Action facultative — un état vide qui propose la sortie vaut mieux qu'un constat. */
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'text-muted-foreground text-2sm flex items-center justify-between gap-3 px-4 py-3',
        className
      )}
    >
      <span>{children}</span>
      {action}
    </div>
  )
}
