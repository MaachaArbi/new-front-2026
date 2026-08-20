import * as React from 'react'
import { useIntl } from 'react-intl'
import { useLocation } from 'react-router-dom'
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { DataGrid, DataGridContainer } from '@/shared/ui/data-grid'
import { DataGridColumnHeader } from '@/shared/ui/data-grid-column-header'
import { DataGridPagination } from '@/shared/ui/data-grid-pagination'
import { DataGridTable } from '@/shared/ui/data-grid-table'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  DateCell,
  MoneyCell,
  PartyCell,
  StatusCell,
} from '@/shared/table/cells'
import type { StatusDefinition } from '@/shared/table/cells'
import {
  ExportButton,
  FilterBar,
  SavedViews,
  useListUrlState,
} from '@/shared/table/list'
import { fromMinorUnits } from '@/shared/money'
import { ShowcaseSection } from '../design-page'

/**
 * LA PAGE-LISTE, assemblée.
 *
 * Ce qu'il faut regarder ici n'est pas l'aspect — c'est **la barre d'adresse**.
 * Filtre, cherche, trie, change de page : tout se retrouve dans l'URL, donc la
 * vue se partage par lien et le retour arrière du navigateur fonctionne.
 *
 * ⚠️ Fixtures de vitrine, et une source d'essai en mémoire qui imite un serveur.
 * Aucune API n'est appelée — règle du 20/08.
 *
 * Deux pièces sont **volontairement désactivées et annoncées** : les vues nommées
 * et l'export, tous deux en attente d'un endpoint (phase 2 du 04/08). On montre
 * l'écran complet et on marque ce qui manque, plutôt que de masquer le trou.
 */
type Status = 'active' | 'watch' | 'blocked'
type Role = 'client' | 'supplier' | 'both'

interface Tier {
  id: string
  name: string
  email: string
  city: string
  role: Role
  outstandingMinor?: string
  status: Status
  lastActivity: string
}

const RAW: readonly [
  string,
  string,
  string,
  Role,
  string | undefined,
  Status,
  string,
][] = [
  [
    'Groupe Sahara Voyages',
    'contact@sahara.tn',
    'Tunis',
    'client',
    '11240500',
    'active',
    '2026-08-18',
  ],
  [
    'Carthage Travel Services',
    'info@carthage.tn',
    'Tunis',
    'both',
    '3980000',
    'active',
    '2026-08-17',
  ],
  [
    'Oasis Tours International',
    'ops@oasis-tours.tn',
    'Djerba',
    'client',
    '27105250',
    'watch',
    '2026-08-12',
  ],
  [
    'Medina Holidays',
    'hello@medina.tn',
    'Sousse',
    'supplier',
    '0',
    'active',
    '2026-08-19',
  ],
  [
    'Atlas Voyages & Loisirs',
    'compta@atlas.tn',
    'Sfax',
    'client',
    '48700000',
    'blocked',
    '2026-07-02',
  ],
  [
    'Sidi Bou Travel',
    'sbt@sidibou.tn',
    'Tunis',
    'client',
    '1245750',
    'active',
    '2026-08-19',
  ],
  [
    'Tabarka Évasion',
    'contact@tabarka-ev.tn',
    'Tabarka',
    'both',
    '6320000',
    'watch',
    '2026-08-09',
  ],
  [
    'Hammamet Sun Tours',
    'book@hst.tn',
    'Hammamet',
    'supplier',
    '9015500',
    'active',
    '2026-08-16',
  ],
  [
    'Kairouan Pèlerinages',
    'agence@kairouan-p.tn',
    'Kairouan',
    'client',
    undefined,
    'active',
    '2026-08-14',
  ],
  [
    'Bizerte Marine Travel',
    'marine@bizerte.tn',
    'Bizerte',
    'supplier',
    '2100000',
    'blocked',
    '2026-06-28',
  ],
  [
    'Tozeur Desert Expeditions',
    'desert@tozeur.tn',
    'Tozeur',
    'client',
    '33890750',
    'watch',
    '2026-08-11',
  ],
  [
    'Monastir Ribat Voyages',
    'ribat@monastir.tn',
    'Monastir',
    'both',
    '780000',
    'active',
    '2026-08-20',
  ],
]

const TIERS: readonly Tier[] = RAW.map(
  ([name, email, city, role, outstandingMinor, status, lastActivity], i) => ({
    id: String(i + 1),
    name,
    email,
    city,
    role,
    outstandingMinor,
    status,
    lastActivity,
  })
)

const TIER_STATUS: Readonly<Record<Status, StatusDefinition>> = {
  active: { tone: 'success', labelKey: 'design.table.status.active' },
  watch: { tone: 'warning', labelKey: 'design.table.status.watch' },
  blocked: { tone: 'destructive', labelKey: 'design.table.status.blocked' },
}

const FACET_KEYS = ['city', 'status', 'role'] as const

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()

/**
 * SOURCE D'ESSAI — elle cherche, filtre, trie et pagine comme le ferait un
 * serveur, puis répond après un délai. Aucune API. C'est ce qui permet de
 * vérifier que le contrat tient sans rien rebrancher.
 */
function useFakeSource(params: ReturnType<typeof useListUrlState>['params']) {
  const [state, setState] = React.useState({
    rows: [] as Tier[],
    total: 0,
    isLoading: true,
  })
  const key = JSON.stringify(params)

  React.useEffect(() => {
    setState((s) => ({ ...s, isLoading: true }))
    const timer = setTimeout(() => {
      const needle = params.search.trim().toLowerCase()
      let rows = TIERS.filter((tier) => {
        if (
          needle &&
          !`${tier.name} ${tier.email}`.toLowerCase().includes(needle)
        )
          return false
        for (const key of FACET_KEYS) {
          const wanted = params.facets[key]
          if (wanted && wanted.length > 0 && !wanted.includes(tier[key]))
            return false
        }
        return true
      })
      const first = params.sorting[0]
      if (first) {
        rows = [...rows].sort((a, b) => {
          const av = String(a[first.id as keyof Tier] ?? '')
          const bv = String(b[first.id as keyof Tier] ?? '')
          return (first.desc ? -1 : 1) * av.localeCompare(bv)
        })
      }
      const start = params.pageIndex * params.pageSize
      setState({
        rows: rows.slice(start, start + params.pageSize),
        total: rows.length,
        isLoading: false,
      })
    }, 350)
    return () => clearTimeout(timer)
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return state
}

export function ListShowcase() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })
  const location = useLocation()

  const list = useListUrlState({ facetKeys: FACET_KEYS, defaultPageSize: 5 })
  const source = useFakeSource(list.params)

  const facets = React.useMemo(
    () => [
      {
        key: 'city',
        label: t('design.list.facet.city'),
        // Options venues d'un référentiel — jamais d'un balayage des lignes.
        options: [...new Set(TIERS.map((tier) => tier.city))]
          .sort()
          .map((city) => ({ value: city, label: city })),
      },
      {
        key: 'status',
        label: t('design.list.facet.status'),
        options: (['active', 'watch', 'blocked'] as const).map((value) => ({
          value,
          label: t(`design.table.status.${value}`),
        })),
      },
      {
        key: 'role',
        label: t('design.list.facet.role'),
        options: (['client', 'supplier', 'both'] as const).map((value) => ({
          value,
          label: t(`design.list.role.${value}`),
        })),
      },
    ],
    [intl.locale] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const columns = React.useMemo<ColumnDef<Tier>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            title={t('design.table.col.name')}
          />
        ),
        cell: ({ row }) => (
          <PartyCell
            name={row.original.name}
            secondary={row.original.email}
            initials={initials(row.original.name)}
            href={`/design/list#${row.original.id}`}
          />
        ),
        size: 300,
        meta: { skeleton: <Skeleton className="h-8 w-52" /> },
      },
      {
        accessorKey: 'city',
        id: 'city',
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            title={t('design.table.col.city')}
          />
        ),
        size: 130,
        meta: { skeleton: <Skeleton className="h-4 w-20" /> },
      },
      {
        accessorKey: 'outstandingMinor',
        id: 'outstanding',
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            title={t('design.table.col.outstanding')}
          />
        ),
        cell: ({ row }) => (
          <MoneyCell
            value={
              row.original.outstandingMinor === undefined
                ? undefined
                : fromMinorUnits(row.original.outstandingMinor, 'TND')
            }
          />
        ),
        size: 150,
        meta: {
          headerClassName: 'text-end [&>*]:justify-end',
          skeleton: <Skeleton className="ms-auto h-4 w-20" />,
        },
      },
      {
        accessorKey: 'status',
        id: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            title={t('design.table.col.status')}
          />
        ),
        cell: ({ row }) => (
          <StatusCell value={row.original.status} map={TIER_STATUS} />
        ),
        size: 130,
        meta: { skeleton: <Skeleton className="h-5 w-16 rounded-full" /> },
      },
      {
        accessorKey: 'lastActivity',
        id: 'lastActivity',
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            title={t('design.table.col.lastActivity')}
          />
        ),
        cell: ({ row }) => <DateCell value={row.original.lastActivity} />,
        size: 140,
        meta: { skeleton: <Skeleton className="h-4 w-20" /> },
      },
    ],
    [intl.locale] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const table = useReactTable({
    data: source.rows,
    columns,
    ...list.tableOptions,
    rowCount: source.total,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex flex-col gap-4">
      <ShowcaseSection
        title={t('design.list.assembled')}
        hint={t('design.list.assembledHint')}
      >
        <div className="flex w-full flex-col gap-4">
          {/* Titre + action principale */}
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-ink text-lg font-semibold">
              {t('design.list.title')}
            </h2>
            <Button variant="primary" size="sm">
              <Plus />
              {t('design.list.new')}
            </Button>
          </div>

          <FilterBar
            search={list.params.search}
            onSearchChange={list.setSearch}
            searchPlaceholder={t('design.list.searchPlaceholder')}
            facets={facets}
            selected={list.params.facets}
            onFacetChange={list.setFacet}
            onClearAll={list.clearAll}
            trailing={
              <>
                <SavedViews />
                <ExportButton recordCount={source.total} />
              </>
            }
          />

          <DataGrid
            table={table}
            recordCount={source.total}
            isLoading={source.isLoading}
            emptyMessage={t('ui.table.empty')}
          >
            <DataGridContainer>
              <DataGridTable />
            </DataGridContainer>
            <div className="px-2.5 py-2.5">
              <DataGridPagination sizes={[5, 10, 25]} />
            </div>
          </DataGrid>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.list.url')}
        hint={t('design.list.urlHint')}
      >
        <code
          dir="ltr"
          className="bg-muted text-ink-secondary block w-full overflow-x-auto rounded-md px-3 py-2 font-mono text-xs [unicode-bidi:isolate]"
        >
          {location.pathname}
          {location.search || '  (aucun filtre)'}
        </code>
      </ShowcaseSection>
    </div>
  )
}
