/**
 * SÉLECTEUR — prélevé de `vendor-metronic/full/src/components/ui/select.tsx`.
 *
 * ── ÉCARTS ASSUMÉS ─────────────────────────────────────────────────────────────
 *
 *  1. `indicatorPosition` passe de `'left' | 'right'` à **`'start' | 'end'`**.
 *     Le template nommait la prop en physique alors qu'il émettait déjà des classes
 *     logiques (`start-2` / `end-2`) : en arabe, demander `'left'` plaçait la coche
 *     à DROITE. L'API mentait sur ce qu'elle faisait. Ce n'est pas un renommage
 *     cosmétique — c'est la seule façon d'écrire du code appelant qui reste vrai
 *     dans les deux sens de lecture.
 *
 *  2. Hauteurs du déclencheur indexées sur `--ui-row` (le template fige
 *     h-7 / h-8.5 / h-10) : sinon le sélecteur ne suivrait pas la densité alors que
 *     le champ de saisie et le bouton la suivent — trois contrôles côte à côte de
 *     hauteurs différentes.
 *
 *  3. Anneau de focus unique, désactivé neutre, ombres retirées, invalide sur les
 *     jetons de danger. Comme partout ailleurs (voir button.tsx et input.tsx).
 *
 *  4. Le chevron du déclencheur se retourne en RTL (`rtl:rotate-180` n'a pas lieu
 *     d'être sur un chevron VERTICAL — il reste tel quel ; ce sont les chevrons de
 *     défilement qui pointent haut/bas, eux non plus ne s'inversent pas). Rien à
 *     corriger ici, noté pour qu'on ne le recherche pas deux fois.
 */
import * as React from 'react'
import { isValidElement, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Select as SelectPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/cn'

/** Position de la coche : côté LECTURE, pas côté écran. */
type IndicatorSide = 'start' | 'end'

const SelectContext = React.createContext<{
  indicatorPosition: IndicatorSide
  indicatorVisibility: boolean
  indicator: ReactNode
}>({ indicatorPosition: 'start', indicator: null, indicatorVisibility: true })

const Select = ({
  indicatorPosition = 'start',
  indicatorVisibility = true,
  indicator,
  ...props
}: {
  indicatorPosition?: IndicatorSide
  indicatorVisibility?: boolean
  indicator?: ReactNode
} & React.ComponentProps<typeof SelectPrimitive.Root>) => (
  <SelectContext.Provider
    value={{ indicatorPosition, indicatorVisibility, indicator }}
  >
    <SelectPrimitive.Root {...props} />
  </SelectContext.Provider>
)

function SelectGroup(
  props: React.ComponentProps<typeof SelectPrimitive.Group>
) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue(
  props: React.ComponentProps<typeof SelectPrimitive.Value>
) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

const selectTriggerVariants = cva(
  `bg-background border-border-strong text-ink flex w-full items-center justify-between border outline-none
   transition-[color,border-color,box-shadow] duration-[120ms] ease-out
   data-placeholder:text-ink-muted
   hover:border-border-stronger
   focus-visible:border-fill-primary focus-visible:outline-hidden focus-visible:[box-shadow:var(--focus-ring)]
   disabled:border-border-disabled disabled:bg-fill-disabled disabled:text-ink-disabled disabled:cursor-not-allowed
   aria-invalid:border-fill-danger aria-invalid:focus-visible:[box-shadow:var(--focus-ring-danger)]
   [[data-invalid=true]_&]:border-fill-danger
   [&>span]:line-clamp-1`,
  {
    variants: {
      size: {
        sm: 'h-(--ui-row-sm) gap-1 rounded-md px-2.5 text-xs',
        md: 'text-2sm h-(--ui-row) gap-1 rounded-md px-3',
        lg: 'h-(--ui-row-lg) gap-1.5 rounded-md px-4 text-sm',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

export interface SelectTriggerProps
  extends
    React.ComponentProps<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {}

function SelectTrigger({
  className,
  children,
  size,
  ...props
}: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(selectTriggerVariants({ size }), className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="text-ink-muted -me-0.5 size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        'text-ink-muted flex cursor-default items-center justify-center py-1',
        className
      )}
      {...props}
    >
      <ChevronUp className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        'text-ink-muted flex cursor-default items-center justify-center py-1',
        className
      )}
      {...props}
    >
      <ChevronDown className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          'border-border bg-popover text-ink data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 shadow-shade relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border shadow-md',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1.5 data-[side=left]:-translate-x-1.5 data-[side=right]:translate-x-1.5 data-[side=top]:-translate-y-1.5',
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1.5',
            position === 'popper' &&
              'h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        'text-ink-muted py-1.5 ps-8 pe-2 text-xs font-medium',
        className
      )}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  const { indicatorPosition, indicatorVisibility, indicator } =
    React.useContext(SelectContext)

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'text-ink text-2sm hover:bg-accent focus:bg-accent data-disabled:text-ink-disabled relative flex w-full cursor-default items-center rounded-sm py-1.5 outline-hidden select-none data-disabled:pointer-events-none',
        indicatorPosition === 'start' ? 'ps-8 pe-2' : 'ps-2 pe-8',
        className
      )}
      {...props}
    >
      {indicatorVisibility &&
        (indicator && isValidElement(indicator) ? (
          indicator
        ) : (
          <span
            className={cn(
              'absolute flex size-3.5 items-center justify-center',
              indicatorPosition === 'start' ? 'start-2' : 'end-2'
            )}
          >
            <SelectPrimitive.ItemIndicator>
              <Check className="text-fill-primary size-4" />
            </SelectPrimitive.ItemIndicator>
          </span>
        ))}
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectIndicator({
  children,
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ItemIndicator>) {
  const { indicatorPosition } = React.useContext(SelectContext)

  return (
    <span
      data-slot="select-indicator"
      className={cn(
        'absolute top-1/2 flex -translate-y-1/2 items-center justify-center',
        indicatorPosition === 'start' ? 'start-2' : 'end-2',
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemIndicator>{children}</SelectPrimitive.ItemIndicator>
    </span>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('bg-border -mx-1.5 my-1.5 h-px', className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectIndicator,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  selectTriggerVariants,
}
