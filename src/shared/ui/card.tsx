/**
 * CARTE — prélevée de `vendor-metronic/full/src/components/ui/card.tsx`.
 *
 * Deux variantes, et la seconde mérite une explication parce qu'elle n'est pas
 * évidente à la lecture :
 *   · `default` — une carte encadrée classique : fond `--card`, filet, rayon ;
 *   · `accent`  — l'inverse : le CADRE est gris et c'est le CONTENU qui est blanc,
 *     posé dessus avec 1 px de retrait. Ça donne l'en-tête « affleurant » qu'on
 *     voit sur les tableaux du template, sans dessiner de bordure.
 * La variante se transmet par contexte : on l'écrit sur `Card`, pas sur chaque
 * sous-partie.
 *
 * ── ÉCARTS ASSUMÉS ─────────────────────────────────────────────────────────────
 *
 *  1. `shadow-xs black/5` retiré. `black/5` n'est pas une classe — c'était une
 *     coquille du template, l'ombre n'avait donc pas de couleur. Et une carte
 *     encadrée n'a pas besoin des deux : le filet suffit à la détacher du fond.
 *     Les ombres restent sur ce qui FLOTTE (dialogue, feuille, infobulle).
 *
 *  2. `useCardContext` lançait une erreur si le contexte manquait — impossible,
 *     `createContext` porte une valeur par défaut. Code mort dont le message
 *     mentait sur ce qui pouvait arriver ; retiré.
 *
 *  3. Les hauteurs `min-h-14` de l'en-tête et du pied ne suivent PAS `--ui-row` :
 *     ce sont des bandes de mise en page, pas des contrôles de ligne.
 */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/cn'

type CardVariant = 'default' | 'accent'

const CardContext = React.createContext<{ variant: CardVariant }>({
  variant: 'default',
})

const cardVariants = cva(
  'text-card-foreground flex flex-col items-stretch rounded-xl',
  {
    variants: {
      variant: {
        default: 'bg-card border-border border',
        accent: 'bg-muted p-1',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

const cardHeaderVariants = cva(
  'flex min-h-14 flex-wrap items-center justify-between gap-2.5 px-5',
  {
    variants: {
      variant: { default: 'border-border border-b', accent: '' },
    },
    defaultVariants: { variant: 'default' },
  }
)

const cardContentVariants = cva('grow p-5', {
  variants: {
    variant: {
      default: '',
      accent: 'bg-card rounded-t-xl [&:last-child]:rounded-b-xl',
    },
  },
  defaultVariants: { variant: 'default' },
})

const cardTableVariants = cva('grid grow', {
  variants: {
    variant: { default: '', accent: 'bg-card rounded-xl' },
  },
  defaultVariants: { variant: 'default' },
})

const cardFooterVariants = cva('flex min-h-14 items-center px-5', {
  variants: {
    variant: {
      default: 'border-border border-t',
      accent: 'bg-card mt-px rounded-b-xl',
    },
  },
  defaultVariants: { variant: 'default' },
})

function Card({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>) {
  return (
    <CardContext.Provider value={{ variant: variant ?? 'default' }}>
      <div
        data-slot="card"
        className={cn(cardVariants({ variant }), className)}
        {...props}
      />
    </CardContext.Provider>
  )
}

function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { variant } = React.useContext(CardContext)
  return (
    <div
      data-slot="card-header"
      className={cn(cardHeaderVariants({ variant }), className)}
      {...props}
    />
  )
}

function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { variant } = React.useContext(CardContext)
  return (
    <div
      data-slot="card-content"
      className={cn(cardContentVariants({ variant }), className)}
      {...props}
    />
  )
}

/** Pour un tableau posé dans une carte : pas de retrait, la grille prend tout. */
function CardTable({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { variant } = React.useContext(CardContext)
  return (
    <div
      data-slot="card-table"
      className={cn(cardTableVariants({ variant }), className)}
      {...props}
    />
  )
}

function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { variant } = React.useContext(CardContext)
  return (
    <div
      data-slot="card-footer"
      className={cn(cardFooterVariants({ variant }), className)}
      {...props}
    />
  )
}

/** Titre + description groupés, pour que la barre d'outils reste alignée. */
function CardHeading({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-heading"
      className={cn('space-y-1', className)}
      {...props}
    />
  )
}

/** Le coin d'actions de l'en-tête. */
function CardToolbar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-toolbar"
      className={cn('flex items-center gap-2.5', className)}
      {...props}
    />
  )
}

function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        'text-ink text-base leading-none font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  )
}

function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-ink-muted text-2sm', className)}
      {...props}
    />
  )
}

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
  CardTitle,
  CardToolbar,
  cardVariants,
}
