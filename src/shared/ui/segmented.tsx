'use client'

import * as React from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * SEGMENTÉ — un choix exclusif présenté comme un interrupteur à plusieurs positions.
 *
 * ─── Quel contrôle pour un choix exclusif ? ───────────────────────────────────────
 * Trois façons de poser la même question cohabitaient dans un seul panneau de saisie.
 * La règle, désormais :
 *
 *  · `Segmented`  — 2 ou 3 options TRÈS courtes, sans explication, qu'on change
 *                   souvent (Personne / Organisation, un filtre de vue). Compact,
 *                   tout est visible, un seul clic.
 *  · `RadioField` — 2 à 5 options qui méritent un mot d'explication, ou dont les
 *                   libellés sont longs. Prend de la hauteur, se lit posément.
 *  · `SelectField` — au-delà de 5 options, ou quand la liste vient du référentiel
 *                   et peut grandir. La liste se replie, l'écran reste calme.
 *
 * Le fond glissant est un simple bloc positionné : pas d'animation d'entrée, seulement
 * la transition d'une position à l'autre — c'est le geste de l'utilisateur qu'on
 * accompagne, pas l'apparition du composant.
 */

export type SegmentedOption = {
  code: string
  label: string
  icon?: React.ReactNode
}

export function Segmented({
  label,
  value,
  onChange,
  options,
  size = 'md',
  className,
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  options: readonly SegmentedOption[]
  size?: 'sm' | 'md'
  className?: string
}) {
  const control = (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'bg-muted inline-flex w-fit items-center gap-0.5 rounded-lg p-0.5',
        className
      )}
    >
      {options.map((option) => {
        const active = option.code === value
        return (
          <button
            key={option.code}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.code)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md font-medium transition-colors',
              size === 'sm' ? 'h-6 px-2 text-xs' : 'text-2sm h-7 px-3',
              active
                ? 'bg-background text-foreground shadow-xs shadow-black/5'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )

  if (label === undefined) return control
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-muted-foreground text-sm">{label}</span>
      {control}
    </div>
  )
}
