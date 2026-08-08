import * as React from 'react'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { countries as COUNTRY_DATA } from 'countries-list'
import { Button } from '@/shared/ui/button'
import { CountryFlag } from '@/shared/ui/flag'
import { Input } from '@/shared/ui/input'
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

interface CountryOption {
  /** alpha2 en MAJUSCULES (clé `countries-list`). */
  readonly code: string
  readonly label: string
  /** Indicatif sans le `+` (ex. `216`). */
  readonly dial: string
}

/** Indicatif international d'un pays (alpha2) — `216` pour la Tunisie, sinon `null`. */
function dialCodeOf(alpha2: string): string | null {
  const entry = (
    COUNTRY_DATA as Record<string, { phone?: number[] } | undefined>
  )[alpha2.toUpperCase()]
  const code = entry?.phone?.[0]
  return code == null ? null : String(code)
}

/**
 * Sépare une chaîne libre en `{ code pays, partie nationale }`. Best-effort pour
 * l'AFFICHAGE : si la valeur commence par `+`, on retient le pays dont l'indicatif
 * est le **plus long préfixe** ; sinon on retombe sur `defaultCountry`. La donnée
 * stockée reste une **chaîne unique** (le champ back est un texte de 50 car.).
 */
function splitPhone(
  raw: string,
  options: readonly CountryOption[],
  defaultCountry?: string
): { code: string | undefined; national: string } {
  const value = raw.trim()
  if (value.startsWith('+')) {
    const digits = value.slice(1)
    let best: CountryOption | undefined
    for (const option of options) {
      if (
        digits.startsWith(option.dial) &&
        (!best || option.dial.length > best.dial.length)
      ) {
        best = option
      }
    }
    if (best) {
      const national = value.slice(1 + best.dial.length).replace(/^[\s-]+/, '')
      return { code: best.code, national }
    }
    return { code: undefined, national: value }
  }
  return { code: defaultCountry?.toUpperCase(), national: value }
}

/** Recompose la chaîne stockée. Partie nationale vide → chaîne vide (jamais un `+216` orphelin). */
function compose(
  code: string | undefined,
  national: string,
  options: readonly CountryOption[]
): string {
  const trimmed = national.trim()
  if (trimmed === '') return ''
  const dial = code
    ? options.find((option) => option.code === code)?.dial
    : undefined
  return dial ? `+${dial} ${trimmed}` : trimmed
}

/**
 * Saisie de téléphone **partagée** : sélecteur de pays (drapeau + indicatif,
 * cherchable) accolé au numéro. La valeur exposée est **une seule chaîne** — le
 * composant compose `+216 …` et sait la **relire** (round-trip). Sans pays choisi,
 * on stocke le numéro tel quel (saisie libre, aucun format imposé, comme le back).
 *
 * `defaultCountry` (alpha2) présélectionne un pays ; aujourd'hui non fourni (le pays
 * du bureau n'est pas encore dans `/me`) → l'utilisateur part « sans indicatif ».
 */
export function PhoneInput({
  value,
  onChange,
  countries,
  defaultCountry,
  disabled,
  placeholder,
  id,
  t,
}: {
  value: string
  onChange: (value: string) => void
  countries: readonly ReferentialItem[]
  defaultCountry?: string
  disabled?: boolean
  placeholder?: string
  id?: string
  t: Translate
}) {
  const options = React.useMemo<CountryOption[]>(() => {
    const list: CountryOption[] = []
    for (const country of countries) {
      const dial = dialCodeOf(country.code)
      if (dial) {
        list.push({
          code: country.code.toUpperCase(),
          label: country.label,
          dial,
        })
      }
    }
    return list
  }, [countries])

  const [open, setOpen] = React.useState(false)
  const [code, setCode] = React.useState<string | undefined>(undefined)
  const [national, setNational] = React.useState('')

  // La valeur du parent est la source de vérité : on se resynchronise quand elle
  // change de l'extérieur (ouverture d'un panneau, réinitialisation) et diffère de
  // ce qu'on afficherait. Pas de resync si l'écart vient de notre propre frappe.
  React.useEffect(() => {
    if (value !== compose(code, national, options)) {
      const parsed = splitPhone(value, options, defaultCountry)
      setCode(parsed.code)
      setNational(parsed.national)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options])

  const emit = (nextCode: string | undefined, nextNational: string) => {
    setCode(nextCode)
    setNational(nextNational)
    onChange(compose(nextCode, nextNational, options))
  }

  const selectedDial = code
    ? options.find((option) => option.code === code)?.dial
    : undefined

  return (
    <div className="flex items-stretch gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="md"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="shrink-0 gap-1.5 px-2.5 font-normal"
          >
            {code ? (
              <span className="text-base leading-none">
                <CountryFlag alpha2={code} />
              </span>
            ) : (
              <Globe className="size-4 opacity-60" />
            )}
            {selectedDial ? (
              <span className="text-sm tabular-nums">+{selectedDial}</span>
            ) : null}
            <ChevronDown className="size-3.5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-0">
          <Command
            filter={(itemValue, search) =>
              itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
            }
          >
            <CommandInput placeholder={t('phone.searchCountry')} />
            <CommandList>
              <CommandEmpty>{t('phone.noCountry')}</CommandEmpty>
              <CommandItem
                value="__none__ international"
                onSelect={() => {
                  emit(undefined, national)
                  setOpen(false)
                }}
              >
                <Globe className="size-4 opacity-60" />
                <span className="flex-1">{t('phone.none')}</span>
                {!code ? <Check className="text-primary size-4" /> : null}
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.code}
                  value={`${option.label} ${option.code} +${option.dial}`}
                  onSelect={() => {
                    emit(option.code, national)
                    setOpen(false)
                  }}
                >
                  <span className="text-base leading-none">
                    <CountryFlag alpha2={option.code} />
                  </span>
                  <span className="flex-1 truncate">{option.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    +{option.dial}
                  </span>
                  {code === option.code ? (
                    <Check className="text-primary size-4" />
                  ) : null}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        id={id}
        value={national}
        onChange={(event) => emit(code, event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        inputMode="tel"
        autoComplete="tel-national"
        className="flex-1"
      />
    </div>
  )
}
