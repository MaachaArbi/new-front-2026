import * as React from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * Pastille d'état — « Sans justificatif », « Expire bientôt », « N'est plus habilité »…
 *
 * Pourquoi un composant et pas un `Badge` : ces pastilles portent une **sémantique
 * d'alerte** (ce qui va / ce qui cloche), pas une catégorie. Elles doivent donc changer
 * TOUTES ensemble le jour où on ajuste le langage d'alerte du produit — c'est exactement
 * ce qu'on ne pouvait pas faire quand la même recette était recopiée à six endroits.
 *
 * Les couleurs passent par les tokens d'état (`--color-*-accent` / `-foreground`), donc
 * elles suivent le thème clair/sombre sans code supplémentaire.
 */
const TONES = {
  neutral: 'bg-muted text-muted-foreground',
  success:
    'bg-[var(--color-success-accent,var(--color-green-100))] text-[var(--color-success-foreground,var(--color-green-800))]',
  warning:
    'bg-[var(--color-warning-accent,var(--color-yellow-100))] text-[var(--color-warning-foreground,var(--color-yellow-800))]',
  danger: 'bg-destructive/10 text-destructive',
  info: 'bg-[var(--color-info-accent,var(--color-blue-100))] text-[var(--color-info-foreground,var(--color-blue-800))]',
} as const

export type StatusTone = keyof typeof TONES

export function StatusChip({
  tone = 'neutral',
  icon,
  children,
  className,
}: {
  tone?: StatusTone
  /** Icône facultative — à réserver aux tons qui alertent (warning / danger). */
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'text-2xs inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-medium',
        TONES[tone],
        className
      )}
    >
      {icon ? <span className="[&_svg]:size-3.5">{icon}</span> : null}
      {children}
    </span>
  )
}
