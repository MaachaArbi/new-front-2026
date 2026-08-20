/**
 * BARRE DE FILTRES — « modèle A », validé par Arbi le 04/08.
 *
 *   « La barre du haut est la SEULE source de filtrage.
 *     Les en-têtes de colonne ne font que le TRI. »
 *
 * Le motif n'était pas esthétique : l'entonnoir par colonne du legacy
 * (Syncfusion) chargeait toutes les lignes côté client, et c'était **la cause des
 * lenteurs**. Un deuxième point d'entrée pourra être ajouté plus tard — à
 * condition qu'il pointe vers le MÊME état, pas vers un second système.
 *
 * ── ANATOMIE ───────────────────────────────────────────────────────────────────
 *   [ 🔍 recherche ]  [facette] [facette] [facette]        [vues] [export]
 *   ● puces actives                                          tout effacer
 *
 * La deuxième ligne n'apparaît que s'il y a quelque chose à montrer : une barre
 * qui garde une ligne vide en réserve fait sauter le tableau au premier filtre.
 */
import { type ReactNode } from 'react'
import { FacetFilter, type FacetOption } from './facet-filter'
import { FilterChips } from './filter-chips'
import { SearchInput } from './search-input'
import { cn } from '@/shared/lib/cn'

export interface FilterBarFacet {
  key: string
  label: string
  options: readonly FacetOption[]
}

export interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  facets: readonly FilterBarFacet[]
  /** clé de facette → valeurs retenues. */
  selected: Readonly<Record<string, readonly string[]>>
  onFacetChange: (key: string, values: readonly string[]) => void
  onClearAll: () => void
  /** Vues, export… — tout ce qui va à l'opposé de la recherche. */
  trailing?: ReactNode
  className?: string
}

function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  facets,
  selected,
  onFacetChange,
  onClearAll,
  trailing,
  className,
}: FilterBarProps) {
  const withSelection = facets.map((facet) => ({
    ...facet,
    selected: selected[facet.key] ?? [],
  }))

  const removeValue = (key: string, value: string) =>
    onFacetChange(
      key,
      (selected[key] ?? []).filter((item) => item !== value)
    )

  return (
    <div
      data-slot="filter-bar"
      className={cn('flex flex-col gap-2.5', className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
          {withSelection.map((facet) => (
            <FacetFilter
              key={facet.key}
              label={facet.label}
              options={facet.options}
              selected={facet.selected}
              onChange={(values) => onFacetChange(facet.key, values)}
            />
          ))}
        </div>
        {trailing && (
          <div className="flex shrink-0 items-center gap-2">{trailing}</div>
        )}
      </div>

      <FilterChips
        facets={withSelection}
        search={search}
        onRemoveValue={removeValue}
        onClearSearch={() => onSearchChange('')}
        onClearAll={onClearAll}
      />
    </div>
  )
}

export { FilterBar }
