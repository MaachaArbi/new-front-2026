/**
 * LA PAGE-LISTE — tout ce qui entoure le tableau.
 *
 * Le tableau affiche des lignes ; ces pièces-ci décident LESQUELLES. Elles
 * portent les décisions d'Arbi du 04/08 : recherche unique sur les clés,
 * filtrage « modèle A », vues dans l'URL, export serveur.
 *
 * Rien ici n'appelle une API. `useListUrlState` tient l'état, la page décide de
 * la source — règle du 20/08 : on dessine la forme, on ne rebranche pas le back.
 */
export { useListUrlState } from './use-list-url-state'
export type {
  ListUrlParams,
  FacetState,
  UseListUrlStateOptions,
  UseListUrlStateResult,
} from './use-list-url-state'
export { SearchInput, type SearchInputProps } from './search-input'
export {
  FacetFilter,
  type FacetOption,
  type FacetFilterProps,
} from './facet-filter'
export {
  FilterChips,
  type ActiveFacet,
  type FilterChipsProps,
} from './filter-chips'
export {
  FilterBar,
  type FilterBarFacet,
  type FilterBarProps,
} from './filter-bar'
export { SavedViews, type SavedView, type SavedViewsProps } from './saved-views'
export { ExportButton, type ExportButtonProps } from './export-button'
