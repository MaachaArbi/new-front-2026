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
import { Columns3 } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DataGrid,
  DataGridContainer,
  type DataGridProps,
} from '@/shared/ui/data-grid'
import { DataGridColumnHeader } from '@/shared/ui/data-grid-column-header'
import { DataGridColumnVisibility } from '@/shared/ui/data-grid-column-visibility'
import { DataGridPagination } from '@/shared/ui/data-grid-pagination'
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/shared/ui/data-grid-table'
import { Skeleton } from '@/shared/ui/skeleton'
import { ShowcaseSection } from '../design-page'

/**
 * Le tableau, sur une VRAIE forme de liste : des tiers, avec un encours en
 * dinars et un statut. On ne juge pas un tableau sur trois colonnes « Nom /
 * Âge / Ville » — on le juge sur ce qu'il portera vraiment.
 *
 * ⚠️ Les douze lignes ci-dessous sont des FIXTURES de vitrine, pas des données.
 * Elles ne sortent pas de `/design`.
 *
 * Deux détails qui ne s'improvisent pas et qu'on met en évidence ici :
 *   · l'encours est en `dir="ltr"` + `tabular-nums` — sans ça, « 11 240,500 »
 *     se réagence en arabe et les colonnes de chiffres ne s'alignent pas ;
 *   · la colonne de sélection est épinglée au DÉBUT, pas « à gauche ».
 */
interface Tier {
  id: string
  name: string
  city: string
  outstanding: string
  status: 'active' | 'watch' | 'blocked'
  lastActivity: string
}

const TIERS: readonly Tier[] = [
  {
    id: '1',
    name: 'Groupe Sahara Voyages',
    city: 'Tunis',
    outstanding: '11 240,500',
    status: 'active',
    lastActivity: '18/08/2026',
  },
  {
    id: '2',
    name: 'Carthage Travel Services',
    city: 'Tunis',
    outstanding: '3 980,000',
    status: 'active',
    lastActivity: '17/08/2026',
  },
  {
    id: '3',
    name: 'Oasis Tours International',
    city: 'Djerba',
    outstanding: '27 105,250',
    status: 'watch',
    lastActivity: '12/08/2026',
  },
  {
    id: '4',
    name: 'Medina Holidays',
    city: 'Sousse',
    outstanding: '0,000',
    status: 'active',
    lastActivity: '19/08/2026',
  },
  {
    id: '5',
    name: 'Atlas Voyages & Loisirs',
    city: 'Sfax',
    outstanding: '48 700,000',
    status: 'blocked',
    lastActivity: '02/07/2026',
  },
  {
    id: '6',
    name: 'Sidi Bou Travel',
    city: 'Tunis',
    outstanding: '1 245,750',
    status: 'active',
    lastActivity: '19/08/2026',
  },
  {
    id: '7',
    name: 'Tabarka Évasion',
    city: 'Tabarka',
    outstanding: '6 320,000',
    status: 'watch',
    lastActivity: '09/08/2026',
  },
  {
    id: '8',
    name: 'Hammamet Sun Tours',
    city: 'Hammamet',
    outstanding: '9 015,500',
    status: 'active',
    lastActivity: '16/08/2026',
  },
  {
    id: '9',
    name: 'Kairouan Pèlerinages',
    city: 'Kairouan',
    outstanding: '15 400,000',
    status: 'active',
    lastActivity: '14/08/2026',
  },
  {
    id: '10',
    name: 'Bizerte Marine Travel',
    city: 'Bizerte',
    outstanding: '2 100,000',
    status: 'blocked',
    lastActivity: '28/06/2026',
  },
  {
    id: '11',
    name: 'Tozeur Desert Expeditions',
    city: 'Tozeur',
    outstanding: '33 890,750',
    status: 'watch',
    lastActivity: '11/08/2026',
  },
  {
    id: '12',
    name: 'Monastir Ribat Voyages',
    city: 'Monastir',
    outstanding: '780,000',
    status: 'active',
    lastActivity: '20/08/2026',
  },
]

const STATUS_VARIANT = {
  active: 'success',
  watch: 'warning',
  blocked: 'destructive',
} as const

const EMPTY: readonly Tier[] = []

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

export function TableShowcase() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  const columns = React.useMemo<ColumnDef<Tier>[]>(
    () => [
      {
        id: 'select',
        header: () => <DataGridTableRowSelectAll size="sm" />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} size="sm" />,
        size: 44,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
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
          <span className="text-ink truncate font-medium">
            {row.original.name}
          </span>
        ),
        size: 260,
        meta: {
          headerTitle: t('design.table.col.name'),
          skeleton: <Skeleton className="h-4 w-40" />,
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
        size: 130,
        meta: {
          headerTitle: t('design.table.col.city'),
          skeleton: <Skeleton className="h-4 w-20" />,
        },
      },
      {
        accessorKey: 'outstanding',
        id: 'outstanding',
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            title={t('design.table.col.outstanding')}
            className="justify-end"
            visibility
          />
        ),
        // Isolé et tabulaire : c'est ce qui fait qu'une colonne de montants
        // s'aligne à la virgule et ne se réagence pas en arabe.
        cell: ({ row }) => (
          <span
            dir="ltr"
            className="text-ink block text-end tabular-nums [unicode-bidi:isolate]"
          >
            {row.original.outstanding}
          </span>
        ),
        size: 140,
        meta: {
          headerTitle: t('design.table.col.outstanding'),
          headerClassName: 'text-end [&>*]:justify-end',
          skeleton: <Skeleton className="ms-auto h-4 w-16" />,
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
          <Badge
            variant={STATUS_VARIANT[row.original.status]}
            appearance="light"
            size="sm"
          >
            {t(`design.table.status.${row.original.status}`)}
          </Badge>
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
        cell: ({ row }) => (
          <span dir="ltr" className="text-ink-secondary [unicode-bidi:isolate]">
            {row.original.lastActivity}
          </span>
        ),
        size: 140,
        meta: {
          headerTitle: t('design.table.col.lastActivity'),
          skeleton: <Skeleton className="h-4 w-20" />,
        },
      },
    ],
    [intl.locale] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // ⚠️ CHAQUE tableau possède SON état. Les faire partager un seul `rowSelection`
  // gelait l'onglet : le tableau « vide » ne trouvait aucune ligne correspondant à
  // la sélection et la repurgeait à chaque rendu, ce qui relançait un rendu. Le
  // symptôme était brutal — le `mousedown` sur une case ne rendait jamais la main.
  // Deux tableaux ne partagent un état que si on l'a VOULU.
  const main = useTiersGrid(TIERS, columns, 6)
  const dense = useTiersGrid(TIERS, columns, 4)
  const stripped = useTiersGrid(TIERS, columns, 4)
  const empty = useTiersGrid(EMPTY, columns, 4)
  const loading = useTiersGrid(TIERS, columns, 4)
  const selectedCount = Object.keys(main.getState().rowSelection).length

  const layouts: Record<string, DataGridProps<Tier>['tableLayout']> = {
    dense: { dense: true, rowBorder: true },
    stripped: { stripped: true, rowBorder: false, headerBackground: false },
  }

  return (
    <div className="flex flex-col gap-4">
      <ShowcaseSection
        title={t('design.table.full')}
        hint={t('design.table.fullHint')}
      >
        <div className="flex w-full flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-ink-muted text-2sm">
              {t('design.table.selected')} :{' '}
              <span dir="ltr" className="tabular-nums [unicode-bidi:isolate]">
                {selectedCount}
              </span>
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
          </div>
          <DataGrid
            table={main}
            recordCount={TIERS.length}
            tableLayout={{ columnsVisibility: true, columnsPinnable: true }}
          >
            <DataGridContainer>
              <DataGridTable />
            </DataGridContainer>
            <div className="px-2.5 py-2.5">
              {/* Les tailles proposées doivent CONTENIR la taille courante, sinon
                  le sélecteur s'affiche vide — piège classique. */}
              <DataGridPagination sizes={[6, 12, 25, 50]} />
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
        <div className="grid w-full gap-4 xl:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-ink-secondary text-2xs font-semibold tracking-wider uppercase">
              {t('design.state.loading')}
            </span>
            <DataGrid table={loading} recordCount={TIERS.length} isLoading>
              <DataGridContainer>
                <DataGridTable />
              </DataGridContainer>
            </DataGrid>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-ink-secondary text-2xs font-semibold tracking-wider uppercase">
              {t('design.table.emptyState')}
            </span>
            <DataGrid table={empty} recordCount={0}>
              <DataGridContainer>
                <DataGridTable />
              </DataGridContainer>
            </DataGrid>
          </div>
        </div>
      </ShowcaseSection>
    </div>
  )
}
