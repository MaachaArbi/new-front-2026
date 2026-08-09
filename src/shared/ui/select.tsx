'use client'

import * as React from 'react'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Select as SelectPrimitive } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/cn'

/**
 * SELECT — la liste déroulante de l'application.
 *
 * Pourquoi remplacer le `<select>` natif : son menu est dessiné par le SYSTÈME, pas par
 * nous. Conséquences concrètes : il ignore le thème sombre sur Windows et Linux, il ne
 * peut porter ni drapeau ni pastille de couleur, sa hauteur ne suit pas nos jetons, et
 * son rendu diffère d'un poste à l'autre — l'application paraît « pas finie » sans
 * qu'on sache dire pourquoi. Radix le redessine en HTML tout en gardant le clavier,
 * la recherche à la frappe et les rôles ARIA du natif.
 *
 * Le composant est en deux couches :
 *  - les primitives (`Select`, `SelectTrigger`, `SelectItem`…) quand un choix demande un
 *    contenu riche — un drapeau, une couleur, deux lignes ;
 *  - `SelectField` juste en dessous, pour le cas courant « libellé + liste d'options »,
 *    qui couvre la quasi-totalité des formulaires.
 */

const selectTriggerVariants = cva(
  'border-input bg-background text-foreground data-placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 flex w-full items-center justify-between gap-1 border shadow-xs shadow-black/5 transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
  {
    variants: {
      size: {
        sm: 'h-7 rounded-md px-2.5 text-xs',
        md: 'h-9 rounded-md px-3 text-2sm',
        lg: 'h-10 rounded-md px-4 text-sm',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

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

function SelectTrigger({
  className,
  children,
  size,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> &
  VariantProps<typeof selectTriggerVariants>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(selectTriggerVariants({ size }), className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="-me-0.5 size-4 opacity-60" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
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
          'border-border bg-popover text-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md shadow-black/5',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1.5 data-[side=top]:-translate-y-1.5',
          className
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex items-center justify-center py-1">
          <ChevronUp className="size-4" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport
          className={cn(
            'p-1.5',
            position === 'popper' &&
              'w-full min-w-[var(--radix-select-trigger-width)]'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex items-center justify-center py-1">
          <ChevronDown className="size-4" />
        </SelectPrimitive.ScrollDownButton>
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
        'text-muted-foreground py-1.5 ps-8 pe-2 text-xs font-medium',
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
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'text-foreground hover:bg-accent focus:bg-accent text-2sm relative flex w-full cursor-default items-center rounded-sm py-1.5 ps-8 pe-2 outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50',
        className
      )}
      {...props}
    >
      <span className="absolute start-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="text-primary size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
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

/** Une option de `SelectField` — même forme que nos référentiels (`code` / `label`). */
export type SelectOption = { code: string; label: string; disabled?: boolean }

/**
 * Le cas courant : un libellé au-dessus, une liste d'options en dessous.
 *
 * `value` vide signifie « rien de choisi » — Radix interdit la valeur `''` sur un item,
 * on la traduit donc en sentinelle interne. `emptyLabel` fournit l'option « — » quand
 * le champ est facultatif ; sans elle, aucun choix vide n'est proposé.
 */
export function SelectField({
  label,
  ariaLabel,
  value,
  onChange,
  options,
  emptyLabel,
  placeholder,
  size,
  disabled,
  required,
  className,
  triggerClassName,
}: {
  /** Absent = pas de libellé visible (filtre de barre d'outils, ou libellé déjà porté
   *  par un `LabeledField` parent) ; `ariaLabel` prend alors le relais. */
  label?: string
  ariaLabel?: string
  value: string
  onChange: (value: string) => void
  options: readonly SelectOption[]
  emptyLabel?: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  required?: boolean
  className?: string
  triggerClassName?: string
}) {
  const control = (
    <Select
      value={value === '' ? EMPTY : value}
      onValueChange={(next) => onChange(next === EMPTY ? '' : next)}
      disabled={disabled}
      required={required}
    >
      <SelectTrigger
        size={size}
        className={triggerClassName}
        aria-label={ariaLabel ?? label}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {emptyLabel !== undefined ? (
          <SelectItem value={EMPTY}>{emptyLabel}</SelectItem>
        ) : null}
        {options.map((option) => (
          <SelectItem
            key={option.code}
            value={option.code}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  if (label === undefined) return control
  return (
    <label className={cn('flex flex-col gap-1', className)}>
      <span className="text-muted-foreground text-sm">{label}</span>
      {control}
    </label>
  )
}

/** Radix refuse `value=""` sur un item ; on encode le « rien choisi » à part. */
const EMPTY = '__empty__'

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
