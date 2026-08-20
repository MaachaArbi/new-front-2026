/**
 * BOUTON — anatomie prélevée de `vendor-metronic/full/src/components/ui/button.tsx`,
 * **re-cartographiée sur le système « Bleu de Prusse »** (décision B du 20/08).
 *
 * Ce qui est conservé du template : la structure `cva`, `data-slot`, `asChild`,
 * `ButtonArrow`, le mode icône, et les tailles indexées sur `--ui-row` pour que le
 * réglage de densité agisse sur la HAUTEUR DE LIGNE et pas seulement sur le texte.
 *
 * Ce que la planche remplace, et pourquoi — ce sont des ÉCARTS ASSUMÉS au template,
 * pas des oublis :
 *
 *  1. CINQ variantes au lieu de huit. `mono`, `dashed`, `dim`, `foreground` et
 *     `inverse` disparaissent : aucune n'avait de rôle défini dans un ERP, et une
 *     variante sans rôle finit par être choisie au hasard. `outline` devient
 *     `secondary` (c'est le même bouton : fond neutre, bordure franche), et `link`
 *     passe de « mode » à variante — c'est une intention, pas une mise en forme.
 *
 *  2. Les états ne sont plus des OPACITÉS mais des couleurs. Le template écrit
 *     `hover:bg-primary/90` ; la planche donne un fill de survol et un fill d'appui
 *     (`--blue-800`, `--blue-900`). Une teinte assombrie se lit comme un appui ; la
 *     même teinte à 90 % se lit comme un début de chargement.
 *
 *  3. DÉSACTIVÉ = neutre, jamais la couleur de marque en opacité réduite. Le
 *     template fait `disabled:opacity-60` : un bouton bleu délavé se lit comme
 *     « en cours » ou « cassé ». Un bouton neutre se lit comme « indisponible ».
 *
 *  4. EN COURS : le fond ne change pas. Un bouton qui pâlit au clic donne
 *     l'impression d'avoir sauté ; seul le libellé s'adoucit (0,85).
 *
 *  5. Ni ombre ni anneau composite : un seul `--focus-ring` pour tout le système
 *     (et sa variante danger). Le template posait `shadow-xs` sur cinq variantes —
 *     une ombre sur un bouton plein n'ajoute rien à 34 px de haut.
 *
 * Reste de Metronic, délibérément : les icônes des variantes neutres sont à 60 %
 * d'opacité. À pleine densité d'encre elles concurrencent le libellé.
 */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronDown, LucideIcon } from 'lucide-react'
import { Slot as SlotPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/cn'

const buttonVariants = cva(
  `group inline-flex cursor-pointer items-center justify-center whitespace-nowrap
   has-data-[arrow=true]:justify-between
   border border-transparent font-medium outline-hidden
   transition-[background-color,border-color,box-shadow] duration-[120ms] ease-out
   focus-visible:[box-shadow:var(--focus-ring)]
   disabled:cursor-not-allowed disabled:border-border-disabled disabled:bg-fill-disabled disabled:text-ink-disabled
   aria-disabled:cursor-not-allowed aria-disabled:border-border-disabled aria-disabled:bg-fill-disabled aria-disabled:text-ink-disabled
   data-[loading=true]:pointer-events-none data-[loading=true]:cursor-wait
   [&_[data-slot=button-label]]:transition-opacity
   data-[loading=true]:[&_[data-slot=button-label]]:opacity-85
   [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        primary:
          'bg-fill-primary text-on-primary hover:bg-fill-primary-hover active:bg-fill-primary-active data-[state=open]:bg-fill-primary-hover',
        secondary:
          'border-border-strong bg-fill-secondary text-ink hover:border-border-stronger hover:bg-fill-secondary-hover active:bg-fill-secondary-active data-[state=open]:bg-fill-secondary-hover',
        ghost:
          'text-ink-secondary hover:bg-fill-ghost-hover hover:text-ink active:bg-fill-ghost-active data-[state=open]:bg-fill-ghost-hover data-[state=open]:text-ink',
        destructive:
          'bg-fill-danger text-on-danger hover:bg-fill-danger-hover active:bg-fill-danger-active focus-visible:[box-shadow:var(--focus-ring-danger)] data-[state=open]:bg-fill-danger-hover',
        link: 'bg-transparent text-ink-link hover:underline hover:underline-offset-[3px]',
      },
      size: {
        sm: 'h-(--ui-row-sm) gap-1 rounded-md px-2.5 text-xs [&_svg:not([class*=size-])]:size-3.5',
        md: 'text-2sm h-(--ui-row) gap-1.5 rounded-md px-3.5 [&_svg:not([class*=size-])]:size-4',
        lg: 'h-(--ui-row-lg) gap-1.5 rounded-md px-4 text-sm [&_svg:not([class*=size-])]:size-4',
      },
      /** `icon` rend le bouton CARRÉ : la largeur suit la hauteur de ligne. */
      mode: {
        default: '',
        icon: 'shrink-0 px-0',
      },
      shape: {
        default: '',
        circle: 'rounded-full',
      },
    },
    compoundVariants: [
      // Le lien n'est pas un contrôle : ni hauteur de ligne, ni fond, ni bordure.
      // En compound pour passer APRÈS les tailles dans l'ordre de sortie de cva.
      {
        variant: 'link',
        className:
          'h-auto rounded-none border-transparent px-1 hover:bg-transparent',
      },
      // Désactivé : ghost et lien n'ont pas de fond à neutraliser.
      {
        variant: ['ghost', 'link'],
        className:
          'disabled:border-transparent disabled:bg-transparent aria-disabled:border-transparent aria-disabled:bg-transparent aria-disabled:no-underline',
      },
      // Icônes des variantes neutres — retenu de Metronic (voir l'en-tête).
      {
        variant: ['secondary', 'ghost'],
        className:
          '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60',
      },
      // Bouton carré : la largeur suit la taille.
      { mode: 'icon', size: 'sm', className: 'w-(--ui-row-sm)' },
      { mode: 'icon', size: 'md', className: 'w-(--ui-row)' },
      { mode: 'icon', size: 'lg', className: 'w-(--ui-row-lg)' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      mode: 'default',
      shape: 'default',
    },
  }
)

function Button({
  className,
  selected,
  variant,
  shape,
  mode,
  size,
  loading = false,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Marque l'action en cours : le fond ne bouge pas, le libellé s'adoucit. */
    loading?: boolean
    selected?: boolean
    asChild?: boolean
  }) {
  const Comp = asChild ? SlotPrimitive.Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, shape, mode, className }),
        // `asChild` rend un <a> : `disabled` n'existe pas sur un lien, il faut
        // couper les événements à la main.
        asChild &&
          props.disabled &&
          'bg-fill-disabled text-ink-disabled border-border-disabled pointer-events-none'
      )}
      {...(selected && { 'data-state': 'open' })}
      {...(loading && { 'data-loading': 'true', 'aria-busy': true })}
      {...props}
    />
  )
}

/**
 * Le libellé d'un bouton qui peut passer « en cours ». Facultatif partout
 * ailleurs : c'est le seul élément que l'état de chargement adoucit, le fond
 * devant rester stable.
 */
function ButtonLabel({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="button-label" className={className} {...props} />
}

interface ButtonArrowProps extends React.SVGProps<SVGSVGElement> {
  icon?: LucideIcon
}

function ButtonArrow({
  icon: Icon = ChevronDown,
  className,
  ...props
}: ButtonArrowProps) {
  return (
    <Icon
      data-slot="button-arrow"
      className={cn('ms-auto -me-1', className)}
      {...props}
    />
  )
}

export { Button, ButtonArrow, ButtonLabel, buttonVariants }
