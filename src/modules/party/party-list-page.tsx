import * as React from 'react'
import { Columns3, Rows3 } from 'lucide-react'
import {
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { useI18n } from '@/app/providers/i18n-provider'
import { useAuth } from '@/app/providers/auth-provider'
import { officesOf } from '@/shared/auth/me'
import { useReferentials, codeLabel } from '@/shared/referentials'
import { usePartyAccounts } from './queries'
import { buildPartyColumns, PARTY_HIDDEN_BY_DEFAULT } from './columns'
import { PartyFilterBar, type PartyFilterValues } from './party-filter-bar'
import { PartyDetailPanel } from './party-detail-panel'
import { useUrlPanel } from '@/shared/navigation/use-url-panel'
import { ApiError } from '@/shared/api/errors'
import { Button } from '@/shared/ui/button'
import { StaleContent } from '@/shared/feedback'
import {
  DataTable,
  DataTableColumnsButton,
  type DataTableDensity,
} from '@/shared/ui/data-table'
import {
  Toolbar,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/shared/layout/components/toolbar'

const PAGE_SIZE = 20

/**
 * Liste des tiers (module de référence). Tableau partagé `DataTable`, pagination
 * **serveur**, tri **fixe** côté back (en-têtes non triables en V1). Filtres modèle
 * A (barre du haut) : recherche + nature + rôle + état + bureau + pays. RLS (§2.4) :
 * un écran vide n'est pas une erreur, le total est celui de l'appelant. Détail en
 * panneau adressable (fiche enrichie back à venir).
 */
export function PartyListPage() {
  const { t } = useI18n()
  const { me } = useAuth()
  const panel = useUrlPanel('open')

  const [page, setPage] = React.useState(1)
  const [searchInput, setSearchInput] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [filters, setFilters] = React.useState<PartyFilterValues>({})
  const [density, setDensity] = React.useState<DataTableDensity>('comfortable')
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(PARTY_HIDDEN_BY_DEFAULT)

  // Recherche différée (300 ms) ; toute nouvelle recherche revient page 1.
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => window.clearTimeout(id)
  }, [searchInput])

  const referentials = useReferentials().data
  const roleLabel = React.useMemo(
    () => codeLabel(referentials?.roles),
    [referentials]
  )
  const countryLabel = React.useMemo(
    () => codeLabel(referentials?.countries),
    [referentials]
  )

  const officeOptions = React.useMemo(
    () =>
      (me ? officesOf(me) : []).map((office) => ({
        value: office.accountId,
        label: office.displayName,
      })),
    [me]
  )

  const query = usePartyAccounts({
    page,
    limit: PAGE_SIZE,
    search,
    nature: filters.nature,
    role: filters.role,
    state: filters.state,
    officeAccountId: filters.officeAccountId,
    country: filters.country,
  })

  const columns = React.useMemo(
    () => buildPartyColumns(t, roleLabel, countryLabel),
    [t, roleLabel, countryLabel]
  )

  const data = React.useMemo(() => [...(query.data?.data ?? [])], [query.data])

  const table = useReactTable({
    data,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: query.data?.meta.totalPages ?? -1,
    initialState: { pagination: { pageIndex: 0, pageSize: PAGE_SIZE } },
  })

  const handleChange = (patch: Partial<PartyFilterValues>) => {
    setFilters((current) => ({ ...current, ...patch }))
    setPage(1)
  }

  const handleReset = () => {
    setFilters({})
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  const hasActive =
    searchInput !== '' ||
    filters.nature != null ||
    filters.role != null ||
    filters.state != null ||
    filters.country != null ||
    filters.officeAccountId != null

  const requestId =
    query.error instanceof ApiError ? query.error.requestId : null

  return (
    <div className="flex flex-col gap-4">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle>{t('nav.module.parties')}</ToolbarPageTitle>
        </ToolbarHeading>
      </Toolbar>

      <PartyFilterBar
        t={t}
        searchInput={searchInput}
        onSearchInput={setSearchInput}
        values={filters}
        onChange={handleChange}
        roleOptions={referentials?.roles ?? []}
        countryOptions={referentials?.countries ?? []}
        officeOptions={officeOptions}
        hasActive={hasActive}
        onReset={handleReset}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setDensity((current) =>
                  current === 'comfortable' ? 'compact' : 'comfortable'
                )
              }
              title={t('party.density.label')}
            >
              <Rows3 />
              <span className="sr-only">{t('party.density.label')}</span>
            </Button>
            <DataTableColumnsButton
              table={table}
              label={t('party.columns')}
              trigger={
                <Button variant="outline" size="sm">
                  <Columns3 />
                  {t('party.columns')}
                </Button>
              }
            />
          </>
        }
      />

      {query.error ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 rounded-xl border p-6"
        >
          <p className="text-destructive text-sm">{t('party.error')}</p>
          {requestId ? (
            <p className="text-muted-foreground mt-1 text-xs">
              {t('error.requestId')} {requestId}
            </p>
          ) : null}
        </div>
      ) : (
        <StaleContent
          stale={query.isFetching && !query.isLoading}
          className="flex flex-col gap-3"
        >
          <div className="border-border border-t">
            <DataTable
              table={table}
              isLoading={query.isLoading}
              density={density}
              onRowClick={(row) => panel.open(row.publicId)}
              emptyMessage={t('party.empty')}
            />
          </div>

          {query.data ? (
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground text-xs">
                {t('party.pageInfo', {
                  page: query.data.meta.page,
                  totalPages: query.data.meta.totalPages,
                  total: query.data.meta.total,
                })}
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  {t('party.prev')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= query.data.meta.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  {t('party.next')}
                </Button>
              </div>
            </div>
          ) : null}
        </StaleContent>
      )}

      <PartyDetailPanel publicId={panel.value} onClose={panel.close} />
    </div>
  )
}
