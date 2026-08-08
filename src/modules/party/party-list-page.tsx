import * as React from 'react'
import { Columns3, Plus, Rows3 } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import {
  PartyFilterBar,
  ActiveFilterChips,
  type ActiveFilterChip,
  type PartyFilterValues,
} from './party-filter-bar'
import { PartyCreateSheet } from './party-create-sheet'
import { ApiError } from '@/shared/api/errors'
import { Button } from '@/shared/ui/button'
import { Card, CardToolbar, CardFooter } from '@/shared/ui/card'
import { StaleContent } from '@/shared/feedback'
import {
  DataTable,
  DataTableColumnsButton,
  DataTablePagination,
  DATA_TABLE_DEFAULT_PAGE_SIZE,
  DATA_TABLE_PAGE_SIZES,
  type DataTableDensity,
} from '@/shared/ui/data-table'
import {
  Toolbar,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/shared/layout/components/toolbar'
import type { PartyState } from './api'

const STATES: readonly PartyState[] = [
  'active',
  'disabled',
  'prospect',
  'disputed',
]

/**
 * Liste des tiers (module de référence). L'**état de la liste** (recherche, filtres,
 * page, taille) vit **dans l'URL** (ADR-F20.2) : lien partageable/bookmarkable, bouton
 * Retour fonctionnel, et **base des vues enregistrées** (branchées en base plus tard).
 * Densité et visibilité de colonnes restent des préférences locales en V1.
 *
 * Tableau full-bleed `DataTable` (défauts compact + 10/page), tri **serveur fixe**.
 * RLS (§2.4) : un écran vide n'est pas une erreur, le total est celui de l'appelant.
 */
export function PartyListPage() {
  const { t } = useI18n()
  const { me } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // --- État dérivé de l'URL (source unique de vérité) ---
  const urlSearch = searchParams.get('q') ?? ''
  const natureParam = searchParams.get('nature')
  const stateParam = searchParams.get('state') as PartyState | null
  const sizeParam = Number(searchParams.get('size') ?? '')
  const filters: PartyFilterValues = {
    nature:
      natureParam === 'person' || natureParam === 'organization'
        ? natureParam
        : undefined,
    role: searchParams.get('role') ?? undefined,
    state: stateParam && STATES.includes(stateParam) ? stateParam : undefined,
    country: searchParams.get('country') ?? undefined,
    officeAccountId: searchParams.get('office')
      ? Number(searchParams.get('office'))
      : undefined,
  }
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)
  const pageSize = (DATA_TABLE_PAGE_SIZES as readonly number[]).includes(
    sizeParam
  )
    ? sizeParam
    : DATA_TABLE_DEFAULT_PAGE_SIZE

  // Écriture groupée dans l'URL (push → Retour fonctionne). Valeur vide = retirée.
  const updateParams = React.useCallback(
    (changes: Record<string, string | undefined>, resetPage = false) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(changes)) {
            if (value == null || value === '') next.delete(key)
            else next.set(key, value)
          }
          if (resetPage) next.delete('page')
          return next
        },
        { replace: false }
      )
    },
    [setSearchParams]
  )

  // --- Recherche : champ local réactif + écriture différée (300 ms) dans l'URL ---
  const [searchInput, setSearchInput] = React.useState(urlSearch)
  const lastWritten = React.useRef(urlSearch)
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      if (searchInput !== lastWritten.current) {
        lastWritten.current = searchInput
        updateParams({ q: searchInput || undefined }, true)
      }
    }, 300)
    return () => window.clearTimeout(id)
  }, [searchInput, updateParams])
  // Synchronise le champ si l'URL change de l'extérieur (bouton Retour).
  React.useEffect(() => {
    if (urlSearch !== lastWritten.current) {
      lastWritten.current = urlSearch
      setSearchInput(urlSearch)
    }
  }, [urlSearch])

  // --- Préférences UI locales (non URL en V1) ---
  const [density, setDensity] = React.useState<DataTableDensity>('compact')
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(PARTY_HIDDEN_BY_DEFAULT)
  const [createOpen, setCreateOpen] = React.useState(false)

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
    limit: pageSize,
    search: urlSearch,
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
    state: {
      columnVisibility,
      pagination: { pageIndex: page - 1, pageSize },
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: query.data?.meta.totalPages ?? -1,
  })

  const handleChange = (patch: Partial<PartyFilterValues>) => {
    const changes: Record<string, string | undefined> = {}
    if ('nature' in patch) changes.nature = patch.nature
    if ('role' in patch) changes.role = patch.role
    if ('state' in patch) changes.state = patch.state
    if ('country' in patch) changes.country = patch.country
    if ('officeAccountId' in patch)
      changes.office =
        patch.officeAccountId != null
          ? String(patch.officeAccountId)
          : undefined
    updateParams(changes, true)
  }

  const clearSearch = () => {
    setSearchInput('')
    lastWritten.current = ''
    updateParams({ q: undefined }, true)
  }

  const handleReset = () => {
    setSearchInput('')
    lastWritten.current = ''
    updateParams(
      {
        q: undefined,
        nature: undefined,
        role: undefined,
        state: undefined,
        country: undefined,
        office: undefined,
        page: undefined,
      },
      false
    )
  }

  const hasActive =
    urlSearch !== '' ||
    filters.nature != null ||
    filters.role != null ||
    filters.state != null ||
    filters.country != null ||
    filters.officeAccountId != null

  // Puces de filtres actifs (retrait individuel).
  const chips: ActiveFilterChip[] = [
    urlSearch && {
      key: 'q',
      label: `« ${urlSearch} »`,
      onRemove: clearSearch,
    },
    filters.nature && {
      key: 'nature',
      label: `${t('party.column.nature')} : ${t(`party.nature.${filters.nature}`)}`,
      onRemove: () => updateParams({ nature: undefined }, true),
    },
    filters.role && {
      key: 'role',
      label: `${t('party.filter.role')} : ${roleLabel(filters.role)}`,
      onRemove: () => updateParams({ role: undefined }, true),
    },
    filters.state && {
      key: 'state',
      label: `${t('party.filter.state')} : ${t(`party.state.${filters.state}`)}`,
      onRemove: () => updateParams({ state: undefined }, true),
    },
    filters.country && {
      key: 'country',
      label: `${t('party.filter.country')} : ${countryLabel(filters.country)}`,
      onRemove: () => updateParams({ country: undefined }, true),
    },
    filters.officeAccountId != null && {
      key: 'office',
      label: `${t('party.filter.office')} : ${
        officeOptions.find((o) => o.value === filters.officeAccountId)?.label ??
        filters.officeAccountId
      }`,
      onRemove: () => updateParams({ office: undefined }, true),
    },
  ].filter(Boolean) as ActiveFilterChip[]

  const requestId =
    query.error instanceof ApiError ? query.error.requestId : null
  const total = query.data?.meta.total ?? 0
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 px-4 lg:px-7.5">
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle>{t('nav.module.parties')}</ToolbarPageTitle>
          </ToolbarHeading>
        </Toolbar>
        <Button
          variant="primary"
          size="sm"
          className="shrink-0"
          onClick={() => setCreateOpen(true)}
        >
          <Plus />
          {t('party.create.button')}
        </Button>
      </div>

      <Card>
        <CardToolbar className="px-4 lg:px-7.5">
          <div className="flex flex-col gap-2">
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
            <ActiveFilterChips
              chips={chips}
              removeLabel={t('party.filter.remove')}
            />
          </div>
        </CardToolbar>

        {query.error ? (
          <div role="alert" className="p-6">
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
            className="flex flex-col"
          >
            <DataTable
              table={table}
              isLoading={query.isLoading}
              density={density}
              onRowClick={(row) =>
                navigate(`/parties/${row.publicId}`, {
                  state: { summary: row },
                })
              }
              emptyMessage={t('party.empty')}
            />

            {query.data ? (
              <CardFooter className="px-4 lg:px-7.5">
                <DataTablePagination
                  className="w-full"
                  pageIndex={page - 1}
                  pageCount={query.data.meta.totalPages}
                  pageSize={pageSize}
                  pageSizes={DATA_TABLE_PAGE_SIZES}
                  onPageChange={(index) =>
                    updateParams({
                      page: index + 1 === 1 ? undefined : String(index + 1),
                    })
                  }
                  onPageSizeChange={(size) =>
                    updateParams(
                      {
                        size:
                          size === DATA_TABLE_DEFAULT_PAGE_SIZE
                            ? undefined
                            : String(size),
                      },
                      true
                    )
                  }
                  rowsPerPageLabel={t('party.rowsPerPage')}
                  info={t('party.range', { from, to, total })}
                  prevLabel={t('party.prev')}
                  nextLabel={t('party.next')}
                />
              </CardFooter>
            ) : null}
          </StaleContent>
        )}
      </Card>

      <PartyCreateSheet open={createOpen} onOpenChange={setCreateOpen} t={t} />
    </div>
  )
}
