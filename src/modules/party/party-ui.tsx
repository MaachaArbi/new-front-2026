import * as React from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * Vocabulaire visuel du module Tiers — les briques reprises du socle Metronic.
 *
 * ⚠️ Volontairement LOCAL au module : elles n'ont qu'un consommateur aujourd'hui.
 * Elles monteront dans `shared/` à la passe composants, quand la 2ᵉ utilisation sera
 * certaine — figer une API partagée trop tôt coûte plus cher que la déplacer plus tard.
 */

/** Carte : conteneur blanc à filet. Pas d'ombre — elle est réservée à ce qui flotte
 *  vraiment (modales). Stratégie de séparation retenue : le filet + l'espace. */
export function Card({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-border bg-card overflow-hidden rounded-lg border',
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Bande de titre de carte — le motif signature de Metronic : un bandeau légèrement
 * teinté (`--strip`) séparé du contenu par un filet. C'est la SEULE façon d'introduire
 * du gris à l'intérieur d'une page (l'intérieur est blanc) : bandes de titre et
 * en-têtes de tableau.
 */
export function CardHead({
  icon,
  title,
  count,
  action,
  tone = 'default',
}: {
  icon?: React.ReactNode
  title: string
  /** Compteur discret accolé au titre (« Interlocuteurs · 4 »). */
  count?: number
  action?: React.ReactNode
  /** `urgent` = bandeau ambré : la carte demande une action. */
  tone?: 'default' | 'urgent'
}) {
  return (
    <div
      className={cn(
        'border-border flex items-center justify-between gap-3 border-b px-4 py-2.5',
        tone === 'urgent'
          ? 'bg-[var(--color-warning-accent,var(--color-yellow-100))]'
          : 'bg-strip'
      )}
    >
      <span className="text-foreground flex min-w-0 items-center gap-2 text-base leading-none font-semibold tracking-tight">
        {icon ? (
          <span
            className={cn(
              '[&_svg]:size-4',
              tone === 'urgent'
                ? 'text-[var(--color-warning-foreground,var(--color-yellow-800))]'
                : 'text-muted-foreground'
            )}
          >
            {icon}
          </span>
        ) : null}
        <span className="truncate">{title}</span>
        {count != null ? (
          <span className="text-muted-foreground text-2sm font-normal">
            · {count}
          </span>
        ) : null}
      </span>
      {action}
    </div>
  )
}

/**
 * Jauge d'utilisation (encours / plafond). La couleur suit le taux : sous 60 % vert,
 * jusqu'à 85 % ambre, au-delà rouge — un plafond presque consommé doit se voir.
 * `pending` : la donnée n'existe pas encore (module Factures) → piste grise, jamais
 * un faux pourcentage.
 */
export function Gauge({
  used,
  total,
  label,
  pending,
  pendingLabel,
}: {
  used?: number
  total?: number
  label: string
  pending?: boolean
  pendingLabel?: string
}) {
  const pct =
    !pending && used != null && total ? Math.min(100, (used / total) * 100) : 0
  const tone = pct > 85 ? 'bg-destructive' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-2sm">
        <span className="text-muted-foreground">{label}</span>
        {pending ? (
          <span className="text-muted-foreground text-2xs tracking-wide uppercase">
            {pendingLabel}
          </span>
        ) : (
          <span className="font-semibold tabular-nums">{Math.round(pct)} %</span>
        )}
      </div>
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        {pending ? null : (
          <div
            className={cn('h-full rounded-full transition-all', tone)}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  )
}

/** Valeur mise en avant : grand chiffre + unité discrète. */
export function StatValue({
  value,
  unit,
  muted,
}: {
  value: string
  unit?: string
  muted?: boolean
}) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span
        className={cn(
          'text-2xl leading-8 font-bold tracking-tight tabular-nums',
          muted ? 'text-muted-foreground' : 'text-foreground'
        )}
      >
        {value}
      </span>
      {unit ? (
        <span className="text-muted-foreground text-2sm font-medium">{unit}</span>
      ) : null}
    </span>
  )
}
