/**
 * ÉTAT SERVEUR D'UN TABLEAU — la forme, dessinée, non branchée.
 *
 * ── LE PROBLÈME ────────────────────────────────────────────────────────────────
 * Aujourd'hui le tableau reçoit TOUTES les lignes et trie, filtre et pagine en
 * mémoire. À douze tiers c'est parfait ; à dix mille, on ne peut pas les envoyer.
 *
 * Basculer côté serveur ne change pas l'INTÉRIEUR du composant : ça change son
 * CONTRAT. Il ne reçoit plus des données, il reçoit une page de données et
 * annonce ce qu'il voudrait voir ensuite. C'est donc un changement d'API — celui
 * qu'il faut faire pendant qu'aucun écran ne l'utilise, comme `side` et
 * `indicatorPosition`.
 *
 * ── CE QUE CE FICHIER FAIT, ET NE FAIT PAS ─────────────────────────────────────
 * Il tient l'état (page, taille, tri, filtres) et le publie. Il **n'appelle
 * aucune API** et n'en connaît aucune : l'appelant décide quoi faire de
 * `params` — requête réseau, filtrage local, jeu d'essai. La règle du 20/08 est
 * respectée : on dessine la forme, on ne rebranche pas le back.
 *
 * ── USAGE ──────────────────────────────────────────────────────────────────────
 *   const { params, tableOptions } = useDataGridParams({ pageSize: 25 })
 *   const { rows, total, isLoading } = maSource(params)   // à l'appelant
 *   const table = useReactTable({ data: rows, columns, ...tableOptions })
 *   <DataGrid table={table} recordCount={total} isLoading={isLoading}>
 *
 * `tableOptions` porte les trois `manual*` de TanStack : sans eux, le tableau
 * re-trierait et re-paginerait la page reçue — c'est-à-dire trierait 25 lignes
 * en croyant en trier dix mille. Le symptôme est un tri qui « marche » mais qui
 * est faux, et c'est l'erreur la plus fréquente de cette bascule.
 */
import * as React from 'react'
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'

/** Ce que le tableau DEMANDE. Rien de plus : pas d'URL, pas de verbe. */
export interface DataGridParams {
  pageIndex: number
  pageSize: number
  sorting: SortingState
  columnFilters: ColumnFiltersState
  /** Recherche libre — portée par la page-liste, pas par une colonne. */
  search: string
}

export interface UseDataGridParamsOptions {
  pageSize?: number
  initialSorting?: SortingState
  /** Appelé à chaque changement. C'est ICI que l'appelant branchera sa source. */
  onChange?: (params: DataGridParams) => void
}

export interface UseDataGridParamsResult {
  params: DataGridParams
  setSearch: (value: string) => void
  setPageIndex: (index: number) => void
  reset: () => void
  /** À étaler dans `useReactTable`. */
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

function useDataGridParams({
  pageSize = 25,
  initialSorting = [],
  onChange,
}: UseDataGridParamsOptions = {}): UseDataGridParamsResult {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [search, setSearchValue] = React.useState('')

  const params = React.useMemo<DataGridParams>(
    () => ({ ...pagination, sorting, columnFilters, search }),
    [pagination, sorting, columnFilters, search]
  )

  const onChangeRef = React.useRef(onChange)
  onChangeRef.current = onChange
  React.useEffect(() => {
    onChangeRef.current?.(params)
  }, [params])

  /** Trier ou filtrer REMET à la première page : rester en page 7 d'un tri qui
      vient de changer montre des lignes qui n'ont plus de rapport. */
  const backToFirstPage = () =>
    setPagination((current) => ({ ...current, pageIndex: 0 }))

  const setSearch = (value: string) => {
    setSearchValue(value)
    backToFirstPage()
  }

  return {
    params,
    setSearch,
    setPageIndex: (index) =>
      setPagination((current) => ({ ...current, pageIndex: index })),
    reset: () => {
      setPagination({ pageIndex: 0, pageSize })
      setSorting(initialSorting)
      setColumnFilters([])
      setSearchValue('')
    },
    tableOptions: {
      manualPagination: true,
      manualSorting: true,
      manualFiltering: true,
      state: { pagination, sorting, columnFilters },
      onPaginationChange: setPagination,
      onSortingChange: (updater) => {
        setSorting(updater)
        backToFirstPage()
      },
      onColumnFiltersChange: (updater) => {
        setColumnFilters(updater)
        backToFirstPage()
      },
    },
  }
}

export { useDataGridParams }
