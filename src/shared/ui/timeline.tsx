import * as React from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * FIL D'ÉVÉNEMENTS — le vocabulaire d'un historique.
 *
 * Toutes les entités de l'ERP auront le leur : un tiers, une réservation, une facture,
 * un règlement. La forme est la même à chaque fois — un intertitre de jour, un trait
 * vertical, un nœud par événement — et c'est exactement ce qu'on ne veut pas réécrire
 * à chaque module.
 *
 * Ce qui n'est PAS ici : la ligne elle-même. L'aperçu d'une fiche montre un résumé
 * compact à puce, l'onglet Historique une entrée dépliable avec avatar : deux objets
 * différents. Les forcer dans un composant unique demanderait une dizaine d'options et
 * rendrait les deux illisibles. Seule la PHRASE, identique au mot près, est mutualisée.
 */

/** Intertitre de journée — « 9 AOÛT 2026 ». */
export function TimelineDay({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="text-muted-foreground text-2xs mt-2 mb-1 font-semibold tracking-wider uppercase">
        {label}
      </div>
      <TimelineRail>{children}</TimelineRail>
    </div>
  )
}

/**
 * Le trait vertical. Il s'arrête avant le premier et après le dernier nœud (`top-3
 * bottom-3`) : un trait qui dépasse donne l'impression d'une liste tronquée.
 */
export function TimelineRail({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <span
        aria-hidden
        className="bg-border absolute start-3 top-3 bottom-3 w-px"
      />
      {children}
    </div>
  )
}

/**
 * Le nœud posé SUR le trait — un halo de la couleur du fond découpe le trait derrière
 * l'avatar, ce qui donne la perle sur un fil plutôt qu'un avatar barré d'une ligne.
 */
export function TimelineNode({ children }: { children: React.ReactNode }) {
  return (
    <span className="ring-background relative z-10 inline-flex rounded-full ring-4">
      {children}
    </span>
  )
}

/**
 * « **Karim Belhadj** · Document · modifié » — la phrase d'un événement.
 *
 * L'acteur en gras, le reste en gris : l'œil balaie la colonne des noms sans lire les
 * compléments. Le séparateur « · » est ici et nulle part ailleurs, pour qu'un jour où
 * l'on passe à une virgule ou à un tiret, la phrase change partout d'un coup.
 */
export function EventPhrase({
  actor,
  parts,
  className,
}: {
  actor: string
  /** Compléments dans l'ordre de lecture — sujet, puis action. */
  parts: readonly string[]
  className?: string
}) {
  return (
    <span className={cn('min-w-0', className)}>
      <span className="text-foreground font-medium">{actor}</span>
      <span className="text-muted-foreground">
        {parts.map((part) => ` · ${part}`).join('')}
      </span>
    </span>
  )
}
