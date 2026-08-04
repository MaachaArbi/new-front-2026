import type { ReactNode } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import type { ReferentialItem } from '@/shared/referentials'
import type { PartyNature, PartyState } from './api'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

interface Option {
  value: string
  label: string
}

/**
 * Sélecteur de filtre (modèle A : tous les filtres vivent dans la barre du haut,
 * les en-têtes ne filtrent pas). Valeur vide = « Tous ». La valeur courante
 * s'affiche dans le déclencheur → elle sert d'indicateur de filtre actif.
 */
function FilterSelect({
  label,
  value,
  options,
  allLabel,
  onChange,
}: {
  label: string
  value: string | undefined
  options: readonly Option[]
  allLabel: string
  onChange: (value: string | undefined) => void
}) {
  const current = options.find((option) => option.value === value)
  const active = value != null && value !== ''

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={active ? 'border-primary/50' : undefined}
        >
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{current?.label ?? allLabel}</span>
          <ChevronDown className="opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]">
        <DropdownMenuRadioGroup
          value={value ?? ''}
          onValueChange={(next) => onChange(next === '' ? undefined : next)}
        >
          <DropdownMenuRadioItem value="">{allLabel}</DropdownMenuRadioItem>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export interface PartyFilterValues {
  nature?: PartyNature
  role?: string
  state?: PartyState
  country?: string
  officeAccountId?: number
}

export interface OfficeOption {
  value: number
  label: string
}

const STATES: readonly PartyState[] = [
  'active',
  'disabled',
  'prospect',
  'disputed',
]

export function PartyFilterBar({
  t,
  searchInput,
  onSearchInput,
  values,
  onChange,
  roleOptions,
  countryOptions,
  officeOptions,
  hasActive,
  onReset,
  actions,
}: {
  t: Translate
  searchInput: string
  onSearchInput: (value: string) => void
  values: PartyFilterValues
  onChange: (patch: Partial<PartyFilterValues>) => void
  roleOptions: readonly ReferentialItem[]
  countryOptions: readonly ReferentialItem[]
  officeOptions: readonly OfficeOption[]
  hasActive: boolean
  onReset: () => void
  actions?: ReactNode
}) {
  const allLabel = t('party.filter.all')

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        className="h-8 w-full max-w-xs sm:w-64"
        placeholder={t('party.search')}
        value={searchInput}
        onChange={(event) => onSearchInput(event.target.value)}
        aria-label={t('party.search')}
      />

      <FilterSelect
        label={t('party.column.nature')}
        value={values.nature}
        allLabel={t('party.nature.all')}
        onChange={(value) =>
          onChange({ nature: value as PartyNature | undefined })
        }
        options={[
          { value: 'person', label: t('party.nature.person') },
          { value: 'organization', label: t('party.nature.organization') },
        ]}
      />

      <FilterSelect
        label={t('party.filter.role')}
        value={values.role}
        allLabel={allLabel}
        onChange={(value) => onChange({ role: value })}
        options={roleOptions.map((item) => ({
          value: item.code,
          label: item.label,
        }))}
      />

      <FilterSelect
        label={t('party.filter.state')}
        value={values.state}
        allLabel={allLabel}
        onChange={(value) =>
          onChange({ state: value as PartyState | undefined })
        }
        options={STATES.map((state) => ({
          value: state,
          label: t(`party.state.${state}`),
        }))}
      />

      <FilterSelect
        label={t('party.filter.country')}
        value={values.country}
        allLabel={allLabel}
        onChange={(value) => onChange({ country: value })}
        options={countryOptions.map((item) => ({
          value: item.code,
          label: item.label,
        }))}
      />

      {officeOptions.length > 0 ? (
        <FilterSelect
          label={t('party.filter.office')}
          value={
            values.officeAccountId != null
              ? String(values.officeAccountId)
              : undefined
          }
          allLabel={allLabel}
          onChange={(value) =>
            onChange({
              officeAccountId: value != null ? Number(value) : undefined,
            })
          }
          options={officeOptions.map((office) => ({
            value: String(office.value),
            label: office.label,
          }))}
        />
      ) : null}

      {hasActive ? (
        <Button variant="ghost" size="sm" onClick={onReset}>
          {t('party.reset')}
        </Button>
      ) : null}

      {actions ? (
        <div className="ms-auto flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

export interface ActiveFilterChip {
  key: string
  label: string
  onRemove: () => void
}

/**
 * Puces des filtres actifs (modèle A) : chaque filtre appliqué s'affiche avec une
 * croix pour le retirer individuellement. Rendu nul si aucun filtre.
 */
export function ActiveFilterChips({
  chips,
  removeLabel,
}: {
  chips: readonly ActiveFilterChip[]
  removeLabel: string
}) {
  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-md py-0.5 ps-2 pe-1 text-xs"
        >
          <span className="max-w-64 truncate">{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={removeLabel}
            className="text-muted-foreground hover:text-foreground rounded-sm"
          >
            <X className="size-3.5" />
          </button>
        </span>
      ))}
    </div>
  )
}
