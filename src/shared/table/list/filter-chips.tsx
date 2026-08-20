/**
 * PUCES DE FILTRE ACTIF.
 *
 * Une facette repliée dans son menu est **invisible**. L'agent voit une liste
 * courte et cherche pourquoi — parfois longtemps. Les puces rendent l'état du
 * filtrage lisible sans ouvrir quoi que ce soit, et chacune se retire d'un clic.
 *
 * C'est la pièce que les listes oublient le plus souvent, et celle qui coûte le
 * plus cher au comptoir : « il n'y a que trois clients à Sfax » alors qu'un
 * filtre « bloqué » était resté actif de la recherche précédente.
 *
 * Les puces NOMMENT la facette : « Rôle : client » et non « client » — sinon deux
 * valeurs homonymes de facettes différentes deviennent indiscernables.
 */
import { useIntl } from 'react-intl'
import { X } from 'lucide-react'
import { Badge, BadgeButton } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import type { FacetOption } from './facet-filter'
import { cn } from '@/shared/lib/cn'

export interface ActiveFacet {
  key: string
  label: string
  options: readonly FacetOption[]
  selected: readonly string[]
}

export interface FilterChipsProps {
  facets: readonly ActiveFacet[]
  search?: string
  onRemoveValue: (key: string, value: string) => void
  onClearSearch?: () => void
  onClearAll: () => void
  className?: string
}

function FilterChips({
  facets,
  search,
  onRemoveValue,
  onClearSearch,
  onClearAll,
  className,
}: FilterChipsProps) {
  const intl = useIntl()
  const active = facets.filter((facet) => facet.selected.length > 0)
  if (active.length === 0 && !search) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {search && (
        <Badge variant="secondary" appearance="light" size="sm">
          {intl.formatMessage({ id: 'ui.list.chipSearch' }, { value: search })}
          {onClearSearch && (
            <BadgeButton onClick={onClearSearch}>
              <X />
            </BadgeButton>
          )}
        </Badge>
      )}

      {active.flatMap((facet) =>
        facet.selected.map((value) => (
          <Badge
            key={`${facet.key}:${value}`}
            variant="primary"
            appearance="light"
            size="sm"
          >
            {facet.label} :{' '}
            {facet.options.find((option) => option.value === value)?.label ??
              value}
            <BadgeButton
              onClick={() => onRemoveValue(facet.key, value)}
              aria-label={intl.formatMessage(
                { id: 'ui.list.removeFilter' },
                { label: facet.label }
              )}
            >
              <X />
            </BadgeButton>
          </Badge>
        ))
      )}

      <Button variant="link" size="sm" onClick={onClearAll}>
        {intl.formatMessage({ id: 'ui.list.clearAll' })}
      </Button>
    </div>
  )
}

export { FilterChips }
