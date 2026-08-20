/**
 * INFOBULLE — prélevée de `vendor-metronic/full/src/components/ui/tooltip.tsx`.
 *
 * ── ÉCARTS ASSUMÉS ─────────────────────────────────────────────────────────────
 *
 *  1. La variante `dark` écrivait deux couleurs LITTÉRALES de la palette
 *     Tailwind (une très sombre, son inverse clair en thème sombre), hors système. Remplacées par `bg-ink text-ink-inverse` : les deux
 *     jetons s'inversent déjà avec le thème, donc l'infobulle reste sombre sur
 *     clair et claire sur sombre, exactement comme le template, mais sans une seule
 *     couleur en dur. C'est le test de la couche de raccordement.
 *
 *  2. Anneau de focus : aucun ici, l'infobulle n'est pas focalisable — c'est son
 *     DÉCLENCHEUR qui l'est. Noté pour qu'on ne le cherche pas.
 *
 * ── CONSERVÉ, et c'est délibéré ────────────────────────────────────────────────
 * `Tooltip` embarque son propre `TooltipProvider`. Radix recommande un fournisseur
 * unique à la racine ; le template le pose sur chaque infobulle. On garde le choix
 * du template : une infobulle marche alors partout sans câblage préalable, et le
 * coût est nul. Le `delayDuration` global reste réglable en enveloppant soi-même.
 */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/cn'

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger(
  props: React.ComponentProps<typeof TooltipPrimitive.Trigger>
) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

const tooltipVariants = cva(
  'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs shadow-md shadow-shade',
  {
    variants: {
      variant: {
        light: 'border-border bg-background text-ink border',
        dark: 'bg-ink text-ink-inverse',
      },
    },
    defaultVariants: { variant: 'dark' },
  }
)

function TooltipContent({
  className,
  sideOffset = 4,
  variant,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> &
  VariantProps<typeof tooltipVariants>) {
  return (
    <TooltipPrimitive.Content
      data-slot="tooltip-content"
      sideOffset={sideOffset}
      className={cn(tooltipVariants({ variant }), className)}
      {...props}
    />
  )
}

export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  tooltipVariants,
}
