import * as React from 'react'
import { useI18n } from '@/app/providers/i18n-provider'
import { usePartyAccounts } from './queries'
import type { PartyNature } from './api'
import { PartyDetailPanel } from './party-detail-panel'
import { useUrlPanel } from '@/shared/navigation/use-url-panel'
import { ApiError } from '@/shared/api/errors'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { SkeletonRow, StaleContent } from '@/shared/feedback'
import {
  Toolbar,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/shared/layout/components/toolbar'

const PAGE_SIZE = 20
const NATURES: readonly (PartyNature | 'all')[] = [
  'all',
  'person',
  'organization',
]

/**
 * Liste des tiers (contrat §3). Pagination **serveur** (ADR-F12), recherche sur le
 * nom affiché + filtre par nature. RLS (§2.4) : **écran vide ≠ erreur** ; on
 * n'affiche jamais le total comme celui de l'agence. Détail en panneau adressable.
 */
export function PartyListPage() {
  const { t } = useI18n()
  const panel = useUrlPanel('open')
  const [page, setPage] = React.useState(1)
  const [natureFilter, setNatureFilter] = React.useState<PartyNature | 'all'>(
    'all'
  )
  const [searchInput, setSearchInput] = React.useState('')
  const [search, setSearch] = React.useState('')

  // Recherche différée (300 ms) ; toute nouvelle recherche revient page 1.
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => window.clearTimeout(id)
  }, [searchInput])

  const query = usePartyAccounts({
    page,
    limit: PAGE_SIZE,
    nature: natureFilter === 'all' ? undefined : natureFilter,
    search,
  })

  const requestId =
    query.error instanceof ApiError ? query.error.requestId : null

  return (
    <div className="flex flex-col gap-4">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle>{t('nav.module.parties')}</ToolbarPageTitle>
        </ToolbarHeading>
      </Toolbar>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-xs"
          placeholder={t('party.search')}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          aria-label={t('party.search')}
        />
        <div className="flex gap-1">
          {NATURES.map((value) => (
            <Button
              key={value}
              size="sm"
              variant={natureFilter === value ? 'primary' : 'outline'}
              onClick={() => {
                setNatureFilter(value)
                setPage(1)
              }}
            >
              {t(`party.nature.${value}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Corps : erreur → squelette → vide → tableau */}
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
      ) : query.isLoading ? (
        <div className="border-border flex flex-col gap-3 rounded-xl border p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonRow key={index} columns={3} />
          ))}
        </div>
      ) : query.data && query.data.data.length === 0 ? (
        <div className="border-border bg-muted/20 rounded-xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">{t('party.empty')}</p>
        </div>
      ) : query.data ? (
        <StaleContent stale={query.isFetching} className="flex flex-col gap-3">
          <div className="border-border overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-start font-medium">
                    {t('party.column.nature')}
                  </th>
                  <th className="px-4 py-2 text-start font-medium">
                    {t('party.column.name')}
                  </th>
                  <th className="px-4 py-2 text-start font-medium">
                    {t('party.column.email')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {query.data.data.map((item) => (
                  <tr
                    key={item.publicId}
                    className="border-border hover:bg-muted/30 border-t"
                  >
                    <td className="px-4 py-2">
                      <Badge variant="secondary" size="sm">
                        {t(`party.nature.${item.nature}`)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => panel.open(item.publicId)}
                        className="text-foreground hover:text-primary text-start font-medium"
                      >
                        {item.displayName}
                      </button>
                    </td>
                    <td className="text-muted-foreground px-4 py-2">
                      {item.email ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination serveur */}
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
        </StaleContent>
      ) : null}

      <PartyDetailPanel publicId={panel.value} onClose={panel.close} />
    </div>
  )
}
