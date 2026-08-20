import * as React from 'react'
import { useIntl } from 'react-intl'
import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { Ban, Columns3, Download, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  DataGrid,
  DataGridContainer,
  type DataGridProps,
} from '@/shared/ui/data-grid'
import { DataGridBulkActions } from '@/shared/ui/data-grid-bulk-actions'
import { DataGridColumnHeader } from '@/shared/ui/data-grid-column-header'
import { DataGridColumnVisibility } from '@/shared/ui/data-grid-column-visibility'
import { DataGridPagination } from '@/shared/ui/data-grid-pagination'
import { DataGridRowActions } from '@/shared/ui/data-grid-row-actions'
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/shared/ui/data-grid-table'
import { useDataGridParams } from '@/shared/ui/use-data-grid-params'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  DateCell,
  MoneyCell,
  PartyCell,
  StatusCell,
} from '@/shared/table/cells'
import type { StatusDefinition } from '@/shared/table/cells'
import { fromMinorUnits, type Money } from '@/shared/money'
import { ShowcaseSection } from '../design-page'

/**
 * Le tableau sur une VRAIE forme de liste — des tiers, avec un encours en dinars
 * et un statut. On ne juge pas un tableau sur « Nom / Âge / Ville ».
 *
 * ⚠️ Les douze lignes sont des FIXTURES de vitrine. Elles ne sortent pas de
 * `/design` et ne sont inscrites nulle part comme donnée.
 *
 * Ce que cette page démontre, et qui ne se voit pas sur une capture figée :
 *   · cliquer une ligne ouvre la fiche, MAIS cocher une case ou ouvrir le menu
 *     d'actions ne l'ouvre pas — c'est la garde du clic de ligne ;
 *   · sélectionner fait APPARAÎTRE une barre d'actions groupées ;
 *   · le mode serveur ne trie ni ne pagine lui-même : il demande.
 */
type Status = 'active' | 'watch' | 'blocked'

interface Tier {
  id: string
  name: string
  email: string
  city: string
  outstandingMinor?: string
  status: Status
  lastActivity: string
}

const RAW: readonly [
  string,
  string,
  string,
  string | undefined,
  Status,
  string,
][] = [
  [
    'Groupe Sahara Voyages',
    'contact@sahara.tn',
    'Tunis',
    '11240500',
    'active',
    '2026-08-18',
  ],
  [
    'Carthage Travel Services',
    'info@carthage.tn',
    'Tunis',
    '3980000',
    'active',
    '2026-08-17',
  ],
  [
    'Oasis Tours International',
    'ops@oasis-tours.tn',
    'Djerba',
    '27105250',
    'watch',
    '2026-08-12',
  ],
  ['Medina Holidays', 'hello@medina.tn', 'Sousse', '0', 'active', '2026-08-19'],
  [
    'Atlas Voyages & Loisirs',
    'compta@atlas.tn',
    'Sfax',
    '48700000',
    'blocked',
    '2026-07-02',
  ],
  [
    'Sidi Bou Travel',
    'sbt@sidibou.tn',
    'Tunis',
    '1245750',
    'active',
    '2026-08-19',
  ],
  [
    'Tabarka Évasion',
    'contact@tabarka-ev.tn',
    'Tabarka',
    '6320000',
    'watch',
    '2026-08-09',
  ],
  [
    'Hammamet Sun Tours',
    'book@hst.tn',
    'Hammamet',
    '9015500',
    'active',
    '2026-08-16',
  ],
  // Encours INCONNU : « — », qui ne veut pas dire « zéro ».
  [
    'Kairouan Pèlerinages',
    'agence@kairouan-p.tn',
    'Kairouan',
    undefined,
    'active',
    '2026-08-14',
  ],
  [
    'Bizerte Marine Travel',
    'marine@bizerte.tn',
    'Bizerte',
    '2100000',
    'blocked',
    '2026-06-28',
  ],
  [
    'Tozeur Desert Expeditions',
    'desert@tozeur.tn',
    'Tozeur',
    '33890750',
    'watch',
    '2026-08-11',
  ],
  [
    'Monastir Ribat Voyages',
    'ribat@monastir.tn',
    'Monastir',
    '780000',
    'active',
    '2026-08-20',
  ],
]

const TIERS: readonly Tier[] = RAW.map(
  ([name, email, city, outstandingMinor, status, lastActivity], i) => ({
    id: String(i + 1),
    name,
    email,
    city,
    outstandingMinor,
    status,
    lastActivity,
  })
)

const EMPTY: readonly Tier[] = []

/** La table de correspondance vit avec le DOMAINE, pas dans la cellule. */
const TIER_STATUS: Readonly<Record<Status, StatusDefinition>> = {
  active: { tone: 'success', labelKey: 'design.table.status.active' },
  watch: { tone: 'warning', labelKey: 'design.table.status.watch' },
  blocked: { tone: 'destructive', labelKey: 'design.table.status.blocked' },
}

const money = (minor: string | undefined): Money | undefined =>
  minor === undefined ? undefined : fromMinorUnits(minor, 'TND')

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()

/** Un tableau et SON état — tri, sélection, page. Rien n'est partagé. */
function useTiersGrid(
  data: readonly Tier[],
  columns: ColumnDef<Tier>[],
  pageSize: number
) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState({})

  return useReactTable({
    data: data as Tier[],
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize } },
  })
}

/**
 * SOURCE D'ESSAI — elle imite un serveur : elle trie, pagine et répond après un
 * délai. Elle ne parle à aucune API et n'en connaît aucune. C'est ce qui permet
 * de vérifier la FORME du contrat sans rien rebrancher.
 */
function useFakeSource(params: {
  pageIndex: number
  pageSize: number
  sorting: SortingState
}) {
  const [rows, setRows] = React.useState<Tier[]>([])
  const [isLoading, setLoading] = React.useState(true)
  const key = JSON.stringify(params)

  React.useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      const sorted = [...TIERS]
      const first = params.sorting[0]
      if (first) {
        sorted.sort((a, b) => {
          const av = String(a[first.id as keyof Tier] ?? '')
          const bv = String(b[first.id as keyof Tier] ?? '')
          return (first.desc ? -1 : 1) * av.localeCompare(bv)
        })
      }
      const start = params.pageIndex * params.pageSize
      setRows(sorted.slice(start, start + params.pageSize))
      setLoading(false)
    }, 450)
    return () => clearTimeout(timer)
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return { rows, total: TIERS.length, isLoading }
}

export function TableShowcase() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })
  const [opened, setOpened] = React.useState<string | null>(null)

  const columns = React.useMemo<ColumnDef<Tier>[]>(
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
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            title={t('design.table.col.name')}
            visibility
          />
        ),
        cell: ({ row }) => (
          <PartyCell
            name={row.original.name}
            secondary={row.original.email}
            initials={initials(row.original.name)}
            href={`/design/table#${row.original.id}`}
          />
        ),
        size: 300,
        meta: {
          headerTitle: t('design.table.col.name'),
          skeleton: <Skeleton className="h-8 w-52" />,
        },
      },
      {
        accessorKey: 'city',
        id: 'city',
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            title={t('design.table.col.city')}
            visibility
          />
        ),
        size: 120,
        meta: {
          headerTitle: t('design.table.col.city'),
          skeleton: <Skeleton className="h-4 w-20" />,
        },
      },
      {
        accessorKey: 'outstandingMinor',
        id: 'outstanding',
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            title={t('design.table.col.outstanding')}
            visibility
          />
        ),
        cell: ({ row }) => (
          <MoneyCell value={money(row.original.outstandingMinor)} />
        ),
        size: 150,
        meta: {
          headerTitle: t('design.table.col.outstanding'),
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
            visibility
          />
        ),
        cell: ({ row }) => (
          <StatusCell value={row.original.status} map={TIER_STATUS} />
        ),
        size: 130,
        meta: {
          headerTitle: t('design.table.col.status'),
          skeleton: <Skeleton className="h-5 w-16 rounded-full" />,
        },
      },
      {
        accessorKey: 'lastActivity',
        id: 'lastActivity',
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            title={t('design.table.col.lastActivity')}
            visibility
          />
        ),
        cell: ({ row }) => <DateCell value={row.original.lastActivity} />,
        size: 130,
        meta: {
          headerTitle: t('design.table.col.lastActivity'),
          skeleton: <Skeleton className="h-4 w-20" />,
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <DataGridRowActions
            rowLabel={row.original.name}
            actions={[
              {
                id: 'view',
                label: t('design.table.action.view'),
                icon: <Eye />,
                onSelect: () => setOpened(row.original.name),
              },
              {
                id: 'edit',
                label: t('design.table.action.edit'),
                icon: <Pencil />,
                onSelect: () => setOpened(row.original.name),
              },
              {
                id: 'block',
                label: t('design.table.action.block'),
                icon: <Ban />,
                onSelect: () => setOpened(row.original.name),
              },
              {
                id: 'delete',
                label: t('design.table.action.delete'),
                icon: <Trash2 />,
                destructive: true,
                onSelect: () => setOpened(row.original.name),
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

  const main = useTiersGrid(TIERS, columns, 6)
  const dense = useTiersGrid(TIERS, columns, 4)
  const stripped = useTiersGrid(TIERS, columns, 4)
  const empty = useTiersGrid(EMPTY, columns, 4)

  // ── Mode serveur : l'état est tenu par le hook, les données par la source.
  const { params, tableOptions } = useDataGridParams({ pageSize: 4 })
  const source = useFakeSource(params)
  const server = useReactTable({
    data: source.rows,
    columns,
    ...tableOptions,
    rowCount: source.total,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  })

  const layouts: Record<string, DataGridProps<Tier>['tableLayout']> = {
    dense: { density: 'compact', rowBorder: true },
    stripped: { striped: true, rowBorder: false, headerBackground: false },
  }

  return (
    <div className="flex flex-col gap-4">
      <ShowcaseSection
        title={t('design.table.full')}
        hint={t('design.table.fullHint')}
      >
        <div className="flex w-full flex-col gap-2.5">
          <div className="flex min-h-(--ui-row) items-center justify-between gap-2">
            {/* La barre d'actions groupées PREND la place de la barre d'outils :
                si elle s'ajoutait, tout le tableau descendrait au premier clic. */}
            {Object.keys(main.getState().rowSelection).length > 0 ? (
              <DataGrid table={main} recordCount={TIERS.length}>
                <DataGridBulkActions
                  actions={[
                    {
                      id: 'export',
                      label: t('design.table.action.export'),
                      icon: <Download />,
                      onSelect: () => undefined,
                    },
                    {
                      id: 'block',
                      label: t('design.table.action.block'),
                      icon: <Ban />,
                      onSelect: () => undefined,
                    },
                    {
                      id: 'delete',
                      label: t('design.table.action.delete'),
                      icon: <Trash2 />,
                      destructive: true,
                      onSelect: () => undefined,
                    },
                  ]}
                />
              </DataGrid>
            ) : (
              <>
                <span className="text-ink-muted text-2sm">
                  {opened
                    ? intl.formatMessage(
                        { id: 'design.table.opened' },
                        { name: opened }
                      )
                    : t('design.table.clickHint')}
                </span>
                <DataGridColumnVisibility
                  table={main}
                  trigger={
                    <Button variant="secondary" size="sm">
                      <Columns3 />
                      {t('ui.table.columns')}
                    </Button>
                  }
                />
              </>
            )}
          </div>
          <DataGrid
            table={main}
            recordCount={TIERS.length}
            onRowClick={(row) => setOpened(row.name)}
            tableLayout={{ columnsVisibility: true, columnsPinnable: true }}
          >
            <DataGridContainer>
              <DataGridTable />
            </DataGridContainer>
            <div className="px-2.5 py-2.5">
              <DataGridPagination sizes={[6, 12, 25, 50]} />
            </div>
          </DataGrid>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.table.server')}
        hint={t('design.table.serverHint')}
      >
        <div className="w-full">
          <DataGrid
            table={server}
            recordCount={source.total}
            isLoading={source.isLoading}
          >
            <DataGridContainer>
              <DataGridTable />
            </DataGridContainer>
            <div className="px-2.5 py-2.5">
              <DataGridPagination sizes={[4, 8, 12]} />
            </div>
          </DataGrid>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.table.layouts')}
        hint={t('design.table.layoutsHint')}
      >
        <div className="flex w-full flex-col gap-4">
          {(['dense', 'stripped'] as const).map((key) => (
            <div key={key} className="flex flex-col gap-1.5">
              <span className="text-ink-secondary text-2xs font-semibold tracking-wider uppercase">
                {key}
              </span>
              <DataGrid
                table={key === 'dense' ? dense : stripped}
                recordCount={TIERS.length}
                tableLayout={layouts[key]}
              >
                <DataGridContainer>
                  <DataGridTable />
                </DataGridContainer>
              </DataGrid>
            </div>
          ))}
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.table.states')}
        hint={t('design.table.statesHint')}
      >
        <div className="w-full">
          <span className="text-ink-secondary text-2xs font-semibold tracking-wider uppercase">
            {t('design.table.emptyState')}
          </span>
          <DataGrid table={empty} recordCount={0}>
            <DataGridContainer>
              <DataGridTable />
            </DataGridContainer>
          </DataGrid>
        </div>
      </ShowcaseSection>
    </div>
  )
}
