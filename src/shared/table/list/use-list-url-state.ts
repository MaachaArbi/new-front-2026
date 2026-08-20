/**
 * L'ÉTAT D'UNE LISTE, DANS L'URL.
 *
 * ── POURQUOI L'URL ─────────────────────────────────────────────────────────────
 * Décision d'Arbi du 04/08 : une vue **ad hoc** vit dans l'URL, une vue **nommée**
 * vit en base. Et explicitement : **pas le `localStorage` comme source de
 * vérité** — il ne suit pas l'agent d'un poste à l'autre.
 *
 * Ce que l'URL achète, concrètement : un agent qui a filtré « clients bloqués de
 * Sfax » envoie **le lien** à son responsable, qui voit exactement le même écran.
 * Sans ça, il envoie une capture d'écran et décrit ses filtres au téléphone.
 * Le retour arrière du navigateur fonctionne aussi, gratuitement.
 *
 * ── FORME DE L'URL ─────────────────────────────────────────────────────────────
 *   ?q=sahara&nature=org&role=client,fournisseur&page=2&size=25&sort=name:desc
 *
 * Les facettes sont **multivaluées**, séparées par des virgules : c'est lisible à
 * l'œil dans la barre d'adresse, ce qui compte quand on débogue un filtre.
 *
 * ── DEUX PIÈGES ÉVITÉS ─────────────────────────────────────────────────────────
 *  1. **`replace` et non `push`.** Sans ça, taper « sahara » laisse six entrées
 *     dans l'historique et le bouton « retour » remonte lettre par lettre.
 *  2. **Tout changement de filtre revient à la PAGE 1.** Rester en page 7 d'un
 *     filtre qui vient de changer montre des lignes sans rapport — ou une page
 *     vide alors qu'il y a des résultats.
 *
 * ── CE QUE ÇA NE FAIT PAS ──────────────────────────────────────────────────────
 * Aucun appel réseau. Le hook tient un état et le publie ; l'appelant décide quoi
 * en faire. Même contrat que `useDataGridParams`, dont c'est la version adossée à
 * l'URL : les deux rendent la même forme, on choisit selon l'écran.
 */
import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'

/** Une facette : une clé, plusieurs valeurs retenues. */
export type FacetState = Readonly<Record<string, readonly string[]>>

export interface ListUrlParams {
  search: string
  facets: FacetState
  pageIndex: number
  pageSize: number
  sorting: SortingState
}

export interface UseListUrlStateOptions {
  /** Les clés de facette reconnues. Tout autre paramètre d'URL est ignoré. */
  facetKeys: readonly string[]
  defaultPageSize?: number
}

export interface UseListUrlStateResult {
  params: ListUrlParams
  /** Nombre de facettes actives — sert à afficher une pastille sur « Filtres ». */
  activeCount: number
  setSearch: (value: string) => void
  setFacet: (key: string, values: readonly string[]) => void
  clearFacet: (key: string) => void
  clearAll: () => void
  setPageIndex: (index: number) => void
  tableOptions: {
    manualPagination: true
    manualSorting: true
    manualFiltering: true
    state: {
      pagination: PaginationState
      sorting: SortingState
      columnFilters: ColumnFiltersState
    }
    onPaginationChange: OnChangeFn<PaginationState>
    onSortingChange: OnChangeFn<SortingState>
    onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  }
}

/** « name:desc » ↔ [{ id: 'name', desc: true }] */
function parseSort(raw: string | null): SortingState {
  if (!raw) return []
  const [id, direction] = raw.split(':')
  if (!id) return []
  return [{ id, desc: direction === 'desc' }]
}

function serializeSort(sorting: SortingState): string | null {
  const first = sorting[0]
  return first ? `${first.id}:${first.desc ? 'desc' : 'asc'}` : null
}

function useListUrlState({
  facetKeys,
  defaultPageSize = 25,
}: UseListUrlStateOptions): UseListUrlStateResult {
  const [searchParams, setSearchParams] = useSearchParams()

  const keys = React.useMemo(() => [...facetKeys], [facetKeys.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  const params = React.useMemo<ListUrlParams>(() => {
    const facets: Record<string, readonly string[]> = {}
    for (const key of keys) {
      const raw = searchParams.get(key)
      if (raw) facets[key] = raw.split(',').filter(Boolean)
    }
    const page = Number(searchParams.get('page') ?? '1')
    const size = Number(searchParams.get('size') ?? String(defaultPageSize))
    return {
      search: searchParams.get('q') ?? '',
      facets,
      // L'URL est écrite pour un HUMAIN : elle compte à partir de 1.
      pageIndex: Number.isFinite(page) && page > 0 ? page - 1 : 0,
      pageSize: Number.isFinite(size) && size > 0 ? size : defaultPageSize,
      sorting: parseSort(searchParams.get('sort')),
    }
  }, [searchParams, keys, defaultPageSize])

  /**
   * Toute écriture passe par ici. `resetPage` est vrai par défaut : changer un
   * filtre sans revenir en page 1 est le défaut le plus courant des listes.
   */
  const write = React.useCallback(
    (mutate: (next: URLSearchParams) => void, resetPage = true) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          mutate(next)
          if (resetPage) next.delete('page')
          return next
        },
        // `replace` : sinon chaque frappe laisse une entrée d'historique.
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const setSearch = React.useCallback(
    (value: string) =>
      write((next) => (value ? next.set('q', value) : next.delete('q'))),
    [write]
  )

  const setFacet = React.useCallback(
    (key: string, values: readonly string[]) =>
      write((next) =>
        values.length > 0 ? next.set(key, values.join(',')) : next.delete(key)
      ),
    [write]
  )

  const clearFacet = React.useCallback(
    (key: string) => write((next) => next.delete(key)),
    [write]
  )

  const clearAll = React.useCallback(
    () =>
      write((next) => {
        next.delete('q')
        next.delete('sort')
        for (const key of keys) next.delete(key)
      }),
    [write, keys]
  )

  const setPageIndex = React.useCallback(
    (index: number) =>
      write(
        (next) =>
          index === 0
            ? next.delete('page')
            : next.set('page', String(index + 1)),
        false
      ),
    [write]
  )

  const activeCount =
    Object.values(params.facets).filter((values) => values.length > 0).length +
    (params.search ? 1 : 0)

  const pagination: PaginationState = {
    pageIndex: params.pageIndex,
    pageSize: params.pageSize,
  }

  return {
    params,
    activeCount,
    setSearch,
    setFacet,
    clearFacet,
    clearAll,
    setPageIndex,
    tableOptions: {
      manualPagination: true,
      manualSorting: true,
      manualFiltering: true,
      state: { pagination, sorting: params.sorting, columnFilters: [] },
      onPaginationChange: (updater) => {
        const next =
          typeof updater === 'function' ? updater(pagination) : updater
        write((search) => {
          if (next.pageIndex === 0) search.delete('page')
          else search.set('page', String(next.pageIndex + 1))
          if (next.pageSize === defaultPageSize) search.delete('size')
          else search.set('size', String(next.pageSize))
        }, false)
      },
      onSortingChange: (updater) => {
        const next =
          typeof updater === 'function' ? updater(params.sorting) : updater
        const serialized = serializeSort(next)
        write((search) =>
          serialized ? search.set('sort', serialized) : search.delete('sort')
        )
      },
      // Les facettes vivent dans l'URL, pas dans l'état de colonne de TanStack :
      // elles ne correspondent pas une-à-une aux colonnes affichées.
      onColumnFiltersChange: () => undefined,
    },
  }
}

export { useListUrlState }
