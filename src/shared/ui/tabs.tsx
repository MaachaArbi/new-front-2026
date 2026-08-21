/**
 * ONGLETS — prélevés de `vendor-metronic/full/src/components/ui/tabs.tsx`.
 *
 * Trois variantes, et la troisième est celle qui compte ici :
 *   · `default` — pilules dans un rail gris ;
 *   · `button`  — pilules sans rail ;
 *   · `line`    — soulignés, posés sur un filet qui court d'un bout à l'autre.
 *
 * C'est `line` que la fiche Tiers utilise : la décision d'Arbi du 07/08 veut
 * **une seule ligne horizontale** sous les onglets ET sous le titre des détails,
 * comme une bordure de tableau. Des pilules casseraient ce filet.
 *
 * ── ÉCARTS ASSUMÉS ─────────────────────────────────────────────────────────────
 *
 *  1. Anneau de focus unique du système, sans `ring-offset` — comme partout.
 *  2. `disabled:opacity-50` devient la couleur de texte désactivée : un onglet
 *     délavé se lit comme un rendu inachevé, un onglet gris comme indisponible.
 *  3. Ombre retirée sur l'onglet actif de la variante `default` : décision prise
 *     avec le bouton, les ombres restent à ce qui FLOTTE.
 */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/cn'

const tabsListVariants = cva('flex shrink-0 items-center', {
  variants: {
    variant: {
      default: 'bg-accent p-1',
      button: '',
      line: 'border-border border-b',
    },
    shape: { default: '', pill: '' },
    size: { lg: 'gap-2.5', md: 'gap-2', sm: 'gap-1.5', xs: 'gap-1' },
  },
  compoundVariants: [
    { variant: 'default', size: 'lg', className: 'gap-2.5 p-1.5' },
    { variant: 'default', size: 'md', className: 'gap-2 p-1' },
    { variant: 'default', size: 'sm', className: 'gap-1.5 p-1' },
    { variant: 'default', size: 'xs', className: 'gap-1 p-1' },

    {
      variant: 'default',
      shape: 'default',
      size: 'lg',
      className: 'rounded-lg',
    },
    {
      variant: 'default',
      shape: 'default',
      size: 'md',
      className: 'rounded-lg',
    },
    {
      variant: 'default',
      shape: 'default',
      size: 'sm',
      className: 'rounded-md',
    },
    {
      variant: 'default',
      shape: 'default',
      size: 'xs',
      className: 'rounded-md',
    },

    { variant: 'line', size: 'lg', className: 'gap-9' },
    { variant: 'line', size: 'md', className: 'gap-8' },
    { variant: 'line', size: 'sm', className: 'gap-4' },
    { variant: 'line', size: 'xs', className: 'gap-4' },

    {
      variant: 'default',
      shape: 'pill',
      className: 'rounded-full [&_[role=tab]]:rounded-full',
    },
    {
      variant: 'button',
      shape: 'pill',
      className: 'rounded-full [&_[role=tab]]:rounded-full',
    },
  ],
  defaultVariants: { variant: 'default', size: 'md' },
})

const tabsTriggerVariants = cva(
  `[&_svg]:text-ink-muted [&:hover_svg]:text-primary [&[data-state=active]_svg]:text-primary
   inline-flex shrink-0 cursor-pointer items-center justify-center font-medium whitespace-nowrap
   transition-colors outline-hidden
   focus-visible:[box-shadow:var(--focus-ring)]
   disabled:pointer-events-none disabled:text-ink-disabled
   data-disabled:pointer-events-none data-disabled:text-ink-disabled
   [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        default:
          'text-ink-muted hover:text-ink data-[state=active]:bg-background data-[state=active]:text-ink',
        button:
          'text-ink-secondary hover:text-ink data-[state=active]:bg-accent data-[state=active]:text-ink rounded-lg',
        line: 'text-ink-muted hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent',
      },
      size: {
        lg: 'gap-2.5 text-sm [&_svg]:size-5',
        md: 'text-2sm gap-2 [&_svg]:size-4',
        sm: 'gap-1.5 text-xs [&_svg]:size-3.5',
        xs: 'gap-1 text-xs [&_svg]:size-3.5',
      },
    },
    compoundVariants: [
      { variant: 'default', size: 'lg', className: 'rounded-md px-4 py-2.5' },
      { variant: 'default', size: 'md', className: 'rounded-md px-3 py-1.5' },
      { variant: 'default', size: 'sm', className: 'rounded-sm px-2.5 py-1.5' },
      { variant: 'default', size: 'xs', className: 'rounded-sm px-2 py-1' },

      { variant: 'button', size: 'lg', className: 'rounded-lg px-4 py-3' },
      { variant: 'button', size: 'md', className: 'rounded-lg px-3 py-2.5' },
      { variant: 'button', size: 'sm', className: 'rounded-md px-2.5 py-2' },
      { variant: 'button', size: 'xs', className: 'rounded-md px-2 py-1.5' },

      { variant: 'line', size: 'lg', className: 'py-3' },
      { variant: 'line', size: 'md', className: 'py-2.5' },
      { variant: 'line', size: 'sm', className: 'py-2' },
      { variant: 'line', size: 'xs', className: 'py-1.5' },
    ],
    defaultVariants: { variant: 'default', size: 'md' },
  }
)

const tabsContentVariants = cva(
  'mt-2.5 outline-hidden focus-visible:[box-shadow:var(--focus-ring)]',
  {
    variants: { variant: { default: '' } },
    defaultVariants: { variant: 'default' },
  }
)

type TabsContextType = {
  variant?: 'default' | 'button' | 'line'
  size?: 'lg' | 'md' | 'sm' | 'xs'
}

const TabsContext = React.createContext<TabsContextType>({
  variant: 'default',
  size: 'md',
})

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root data-slot="tabs" className={className} {...props} />
  )
}

function TabsList({
  className,
  variant = 'default',
  shape = 'default',
  size = 'md',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsContext.Provider
      value={{ variant: variant ?? 'default', size: size ?? 'md' }}
    >
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(tabsListVariants({ variant, shape, size }), className)}
        {...props}
      />
    </TabsContext.Provider>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { variant, size } = React.useContext(TabsContext)

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant, size }), className)}
      {...props}
    />
  )
}

function TabsContent({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content> &
  VariantProps<typeof tabsContentVariants>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(tabsContentVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
