import * as React from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { CountryFlag } from '@/shared/ui/flag'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import type { ReferentialItem } from '@/shared/referentials'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

interface BaseProps {
  /** Liste des pays (référentiel `countries`) — libellés déjà traduits. */
  countries: readonly ReferentialItem[]
  placeholder?: string
  disabled?: boolean
  id?: string
  /** Hauteur du déclencheur — `md` (formulaire, défaut) ou `sm` (barre de filtres). */
  size?: 'sm' | 'md'
  /** Bouton d'effacement quand une valeur est posée (défaut : oui). */
  clearable?: boolean
  className?: string
  t: Translate
}

/**
 * Un seul composant, deux modes selon `multiple` (décidé à l'init) — pas deux
 * composants à maintenir. `onChange`/`value` sont typés en conséquence.
 */
type SingleProps = BaseProps & {
  multiple?: false
  value: string | null
  onChange: (value: string | null) => void
}
type MultiProps = BaseProps & {
  multiple: true
  value: readonly string[]
  onChange: (value: string[]) => void
}
export type CountrySelectProps = SingleProps | MultiProps

/**
 * Sélecteur de pays **partagé** : autocomplete (recherche), **drapeaux**, mode **single
 * ou multi** au choix (`multiple`). Bâti sur les briques maison (Popover + Command/cmdk +
 * `CountryFlag`) — pas de réécriture. Comme tous les composites, une modif ici se propage
 * partout ; ce qui est propre à l'écran (valeur, placeholder, quoi faire au changement)
 * reste en props.
 */
export function CountrySelect(props: CountrySelectProps) {
  const {
    countries,
    placeholder,
    disabled,
    id,
    size = 'md',
    clearable = true,
    className,
    t,
  } = props
  const multiple = props.multiple === true
  const [open, setOpen] = React.useState(false)

  const labelOf = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const country of countries) map.set(country.code, country.label)
    return (code: string) => map.get(code) ?? code
  }, [countries])

  const selected: string[] = multiple
    ? [...props.value]
    : props.value
      ? [props.value]
      : []
  const isSelected = (code: string) => selected.includes(code)

  const toggle = (code: string) => {
    if (props.multiple) {
      props.onChange(
        isSelected(code)
          ? selected.filter((c) => c !== code)
          : [...selected, code]
      )
    } else {
      props.onChange(isSelected(code) ? null : code)
      setOpen(false)
    }
  }

  const clear = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (props.multiple) props.onChange([])
    else props.onChange(null)
  }

  const hasValue = selected.length > 0
  const first = selected[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={size}
          role="combobox"
          id={id}
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between font-normal', className)}
        >
          <span className="flex min-w-0 items-center gap-2">
            {first === undefined ? (
              <span className="text-muted-foreground">
                {placeholder ?? t('countrySelect.placeholder')}
              </span>
            ) : multiple && selected.length > 1 ? (
              <span className="truncate">
                {t('countrySelect.count', { count: selected.length })}
              </span>
            ) : (
              <>
                <CountryFlag alpha2={first} />
                <span className="truncate">{labelOf(first)}</span>
              </>
            )}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {clearable && hasValue ? (
              <span
                role="button"
                tabIndex={-1}
                aria-label={t('countrySelect.clear')}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={clear}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </span>
            ) : null}
            <ChevronDown className="size-3.5 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) min-w-52 p-0"
      >
        <Command
          filter={(itemValue, search) =>
            itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder={t('countrySelect.search')} />
          <CommandList>
            <CommandEmpty>{t('countrySelect.empty')}</CommandEmpty>
            {countries.map((country) => {
              const active = isSelected(country.code)
              return (
                <CommandItem
                  key={country.code}
                  value={`${country.label} ${country.code}`}
                  onSelect={() => toggle(country.code)}
                >
                  {multiple ? (
                    <span
                      className={cn(
                        'flex size-4 items-center justify-center rounded border',
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input'
                      )}
                    >
                      {active ? <Check className="size-3" /> : null}
                    </span>
                  ) : null}
                  <CountryFlag alpha2={country.code} />
                  <span className="flex-1 truncate">{country.label}</span>
                  {!multiple && active ? (
                    <Check className="text-primary size-4" />
                  ) : null}
                </CommandItem>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
