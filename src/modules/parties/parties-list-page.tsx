import * as React from 'react'
import { useIntl } from 'react-intl'
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Eye, Pencil, Plus, Ban, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { DataGrid, DataGridContainer } from '@/shared/ui/data-grid'
import { DataGridBulkActions } from '@/shared/ui/data-grid-bulk-actions'
import { DataGridColumnHeader } from '@/shared/ui/data-grid-column-header'
import { DataGridColumnVisibility } from '@/shared/ui/data-grid-column-visibility'
import { DataGridDensity } from '@/shared/ui/data-grid-density'
import { DataGridPagination } from '@/shared/ui/data-grid-pagination'
import { DataGridRowActions } from '@/shared/ui/data-grid-row-actions'
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/shared/ui/data-grid-table'
import { Skeleton } from '@/shared/ui/skeleton'
import { PartyCell } from '@/shared/table/cells'
import {
  ExportButton,
  FilterBar,
  SavedViews,
  useListUrlState,
} from '@/shared/table/list'
import { Columns3 } from 'lucide-react'
import {
  NatureCell,
  OfficesCell,
  PlainCell,
  RolesCell,
  StateCell,
} from './party-cells'
import { COUNTRIES, OFFICES, PARTIES, type PartyRow } from './fixtures'

/**
 * LISTE TIERS — premier écran réel du produit.
 *
 * ⚠️ STATIQUE. Les lignes sont des fixtures et la « source » est en mémoire.
 * Aucune API n'est appelée (règle du 20/08). Ce qui manque est inscrit au
 * registre `docs/backlog/en-attente-donnees.md`.
 *
 * ── CE QUE L'ÉCRAN RESPECTE, ET D'OÙ ÇA VIENT ──────────────────────────────────
 *
 *  · **Contrat de liste figé le 04/08** — les colonnes ne montrent QUE des champs
 *    du contrat : `displayName`, `email`, `nature`, `roles[]`, `offices[]`,
 *    `phonePrimary`, `country`, et les trois drapeaux d'état.
 *
 *  · **Pas de colonne solde.** Décision du 04/08 : le solde existe par
 *    (tiers × rôle × bureau × devise), jamais comme un chiffre unique. En mettre
 *    un dans la liste serait faux, pas approximatif.
 *
 *  · **Filtres V1** — recherche (une boîte → quatre champs), nature, rôle, état,
 *    bureau, pays. Rien d'autre : forme juridique et « créé entre » sont phase 2.
 *
 *  · **Le compteur dit « que vous pouvez voir ».** Le cloisonnement RLS est par
 *    bureau : la liste n'est JAMAIS complète, et un compteur qui annoncerait
 *    « 106 000 tiers » mentirait à l'agent qui n'en voit que six cents.
 *
 *  · **Pleine largeur.** Le tableau touche les bords ; titre, filtres et
 *    pagination portent leur retrait (décision du 04/08).
 *
 * ── ÉCART SIGNALÉ ──────────────────────────────────────────────────────────────
 * Les en-têtes sont TRIABLES. Le contrat du 04/08 fige `display_name ASC` sans
 * `sort=` (choix de performance). C'est cohérent avec la règle du 19/08 —
 * concevoir l'UI indépendamment des API — mais ça mordra au branchement.
 * Inscrit au registre.
 */
const FACET_KEYS = ['nature', 'role', 'state', 'office', 'country'] as const

/** Source d'essai : filtre, trie et pagine en mémoire, avec un délai. */
function useStaticSource(params: ReturnType<typeof useListUrlState>['params']) {
  const [state, setState] = React.useState({
    rows: [] as PartyRow[],
    total: 0,
    isLoading: true,
  })
  const key = JSON.stringify(params)

  React.useEffect(() => {
    setState((current) => ({ ...current, isLoading: true }))
    const timer = setTimeout(() => {
      const needle = params.search.trim().toLowerCase()
      const wanted = (facet: string) => params.facets[facet] ?? []

      let rows = PARTIES.filter((party) => {
        // La recherche porte sur les QUATRE champs du contrat.
        if (
          needle &&
          ![party.displayName, party.email, party.phonePrimary]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(needle))
        )
          return false
        if (wanted('nature').length && !wanted('nature').includes(party.nature))
          return false
        if (
          wanted('role').length &&
          !party.roles.some((role) => wanted('role').includes(role))
        )
          return false
        if (
          wanted('country').length &&
          !wanted('country').includes(party.country ?? '')
        )
          return false
        if (
          wanted('office').length &&
          !party.offices.some((office) =>
            wanted('office').includes(office.displayName)
          )
        )
          return false
        if (wanted('state').length) {
          const states = [
            party.isDisabled ? 'disabled' : null,
            party.isProspect ? 'prospect' : null,
            party.isDisputed ? 'disputed' : null,
          ].filter(Boolean) as string[]
          if (states.length === 0) states.push('active')
          if (!states.some((state) => wanted('state').includes(state)))
            return false
        }
        return true
      })

      const first = params.sorting[0]
      // Défaut du contrat : display_name ASC.
      rows = [...rows].sort((a, b) => {
        const field = (first?.id ?? 'displayName') as keyof PartyRow
        const av = String(a[field] ?? '')
        const bv = String(b[field] ?? '')
        return (first?.desc ? -1 : 1) * av.localeCompare(bv, 'fr')
      })

      const start = params.pageIndex * params.pageSize
      setState({
        rows: rows.slice(start, start + params.pageSize),
        total: rows.length,
        isLoading: false,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return state
}

export function PartiesListPage() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })
  const list = useListUrlState({ facetKeys: FACET_KEYS, defaultPageSize: 10 })
  const source = useStaticSource(list.params)

  const facets = React.useMemo(
    () => [
      {
        key: 'nature',
        label: t('parties.filter.nature'),
        options: (['organization', 'person'] as const).map((value) => ({
          value,
          label: t(`parties.nature.${value}`),
        })),
      },
      {
        key: 'role',
        label: t('parties.filter.role'),
        options: (['customer', 'supplier'] as const).map((value) => ({
          value,
          label: t(`parties.role.${value}`),
        })),
      },
      {
        key: 'state',
        label: t('parties.filter.state'),
        options: (['active', 'disabled', 'prospect', 'disputed'] as const).map(
          (value) => ({ value, label: t(`parties.state.${value}`) })
        ),
      },
      { key: 'office', label: t('parties.filter.office'), options: OFFICES },
      {
        key: 'country',
        label: t('parties.filter.country'),
        options: COUNTRIES,
      },
    ],
    [intl.locale] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const columns = React.useMemo<ColumnDef<PartyRow>[]>(
    () => [
      {
        id: 'select',
        header: () => <DataGridTableRowSelectAll size="sm" />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} size="sm" />,
        size: 44,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: 'nature',
        accessorKey: 'nature',
        header: () => (
          <span className="sr-only">{t('parties.filter.nature')}</span>
        ),
        cell: ({ row }) => <NatureCell nature={row.original.nature} />,
        size: 44,
        enableSorting: false,
        meta: {
          headerTitle: t('parties.filter.nature'),
          skeleton: <Skeleton className="size-4 rounded-full" />,
        },
      },
      {
        id: 'displayName',
        accessorKey: 'displayName',
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            title={t('parties.col.name')}
            visibility
          />
        ),
        cell: ({ row }) => (
          <PartyCell
            name={row.original.displayName}
            secondary={row.original.email}
            href={`/parties/${row.original.publicId}`}
          />
        ),
        size: 300,
        meta: {
          headerTitle: t('parties.col.name'),
          skeleton: <Skeleton className="h-8 w-52" />,
        },
      },
      {
        id: 'roles',
        header: () => (
          <span className="text-ink-secondary text-2sm font-normal">
            {t('parties.col.roles')}
          </span>
        ),
        cell: ({ row }) => <RolesCell roles={row.original.roles} />,
        size: 170,
        enableSorting: false,
        meta: {
          headerTitle: t('parties.col.roles'),
          skeleton: <Skeleton className="h-5 w-20 rounded-full" />,
        },
      },
      {
        id: 'offices',
        header: () => (
          <span className="text-ink-secondary text-2sm font-normal">
            {t('parties.col.offices')}
          </span>
        ),
        cell: ({ row }) => <OfficesCell offices={row.original.offices} />,
        size: 170,
        enableSorting: false,
        meta: {
          headerTitle: t('parties.col.offices'),
          skeleton: <Skeleton className="h-4 w-24" />,
        },
      },
      {
        id: 'phonePrimary',
        accessorKey: 'phonePrimary',
        header: () => (
          <span className="text-ink-secondary text-2sm font-normal">
            {t('parties.col.phone')}
          </span>
        ),
        cell: ({ row }) => (
          <span dir="ltr" className="[unicode-bidi:isolate]">
            <PlainCell value={row.original.phonePrimary} />
          </span>
        ),
        size: 160,
        enableSorting: false,
        meta: {
          headerTitle: t('parties.col.phone'),
          skeleton: <Skeleton className="h-4 w-28" />,
        },
      },
      {
        id: 'country',
        accessorKey: 'country',
        header: () => (
          <span className="text-ink-secondary text-2sm font-normal">
            {t('parties.col.country')}
          </span>
        ),
        cell: ({ row }) => (
          <PlainCell
            value={
              COUNTRIES.find((c) => c.value === row.original.country)?.label
            }
          />
        ),
        size: 110,
        enableSorting: false,
        meta: {
          headerTitle: t('parties.col.country'),
          skeleton: <Skeleton className="h-4 w-16" />,
        },
      },
      {
        id: 'state',
        header: () => (
          <span className="text-ink-secondary text-2sm font-normal">
            {t('parties.col.state')}
          </span>
        ),
        cell: ({ row }) => <StateCell party={row.original} />,
        size: 150,
        enableSorting: false,
        meta: {
          headerTitle: t('parties.col.state'),
          skeleton: <Skeleton className="h-5 w-16 rounded-full" />,
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <DataGridRowActions
            rowLabel={row.original.displayName}
            actions={[
              {
                id: 'view',
                label: t('parties.action.view'),
                icon: <Eye />,
                onSelect: () => undefined,
              },
              {
                id: 'edit',
                label: t('parties.action.edit'),
                icon: <Pencil />,
                onSelect: () => undefined,
              },
              {
                id: 'disable',
                label: t('parties.action.disable'),
                icon: <Ban />,
                onSelect: () => undefined,
              },
              {
                id: 'delete',
                label: t('parties.action.delete'),
                icon: <Trash2 />,
                destructive: true,
                onSelect: () => undefined,
              },
            ]}
          />
        ),
        size: 60,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [intl.locale] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const table = useReactTable({
    data: source.rows,
    columns,
    ...list.tableOptions,
    rowCount: source.total,
    getRowId: (row) => row.publicId,
    enableRowSelection: true,
    // `onChange` : la colonne suit le curseur pendant le glissé. `onEnd` ne
    // redessine qu'au relâchement — on ne voit pas ce qu'on fait.
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    enableColumnPinning: true,
    getCoreRowModel: getCoreRowModel(),
  })

  const selectedCount = Object.keys(table.getState().rowSelection).length

  return (
    <DataGrid
      table={table}
      recordCount={source.total}
      isLoading={source.isLoading}
      emptyMessage={t('parties.empty')}
      tableLayout={{
        columnsVisibility: true,
        columnsResizable: true,
        columnsPinnable: true,
      }}
      // GOUTTIÈRE (décision 04/08) : la bande touche les bords, mais le CONTENU
      // de la première et de la dernière colonne s'aligne sur le retrait de page.
      // Sans elle, le texte du tableau démarre 14 px avant le titre — l'œil le
      // voit sans savoir le nommer.
      tableClassNames={{
        edgeCell: 'first:ps-4 last:pe-4 lg:first:ps-7.5 lg:last:pe-7.5',
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Titre et action — RETRAIT porté par l'élément de page (décision 04/08). */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 lg:px-7.5">
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-ink text-xl font-semibold">
              {t('parties.title')}
            </h1>
            {/* « que vous pouvez voir » : le cloisonnement est par bureau, la
                liste n'est jamais complète. Un compteur muet mentirait. */}
            <span className="text-ink-muted text-2sm">
              {intl.formatMessage(
                { id: 'parties.visibleCount' },
                {
                  n: (
                    <span
                      dir="ltr"
                      className="tabular-nums [unicode-bidi:isolate]"
                    >
                      {source.total}
                    </span>
                  ),
                }
              )}
            </span>
          </div>
          <Button variant="primary" size="sm">
            <Plus />
            {t('parties.new')}
          </Button>
        </div>

        <div className="px-4 lg:px-7.5">
          {selectedCount > 0 ? (
            <DataGridBulkActions
              actions={[
                {
                  id: 'export',
                  label: t('parties.action.export'),
                  onSelect: () => undefined,
                },
                {
                  id: 'disable',
                  label: t('parties.action.disable'),
                  icon: <Ban />,
                  onSelect: () => undefined,
                },
              ]}
            />
          ) : (
            <FilterBar
              search={list.params.search}
              onSearchChange={list.setSearch}
              searchPlaceholder={t('parties.searchPlaceholder')}
              facets={facets}
              selected={list.params.facets}
              onFacetChange={list.setFacet}
              onClearAll={list.clearAll}
              trailing={
                <>
                  <DataGridColumnVisibility
                    table={table}
                    trigger={
                      <Button variant="secondary" size="sm">
                        <Columns3 />
                        {t('ui.table.columns')}
                      </Button>
                    }
                  />
                  <DataGridDensity label={false} />
                  <SavedViews />
                  <ExportButton recordCount={source.total} />
                </>
              }
            />
          )}
        </div>

        {/* Pleine largeur : le tableau touche les bords, son contenu reste aligné
            par une gouttière sur la première et la dernière colonne. */}
        <DataGridContainer border={false} className="border-border border-y">
          <DataGridTable />
        </DataGridContainer>

        <div className="px-4 lg:px-7.5">
          <DataGridPagination sizes={[10, 25, 50, 100]} />
        </div>
      </div>
    </DataGrid>
  )
}
