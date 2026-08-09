import * as React from 'react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { FormModal } from '@/shared/ui/form-modal'
import { ApiError } from '@/shared/api/errors'
import { usePartyAccounts, usePatchPartyAccount } from './queries'
import type { PartyOfficeRef } from './api'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

/**
 * Rattache / détache l'**agence mère** (organisations seulement). Recherche parmi les
 * organisations de ton périmètre → `PATCH parentAccountPublicId`. `null` détache.
 * Un tiers ne peut pas être sa propre mère (exclu des résultats). Refus back (mère
 * hors périmètre) affiché tel quel.
 */
export function PartyParentSheet({
  open,
  onOpenChange,
  publicId,
  currentParent,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  publicId: string
  currentParent: PartyOfficeRef | null
  t: Translate
}) {
  const patch = usePatchPartyAccount(publicId)
  const [searchInput, setSearchInput] = React.useState('')
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  React.useEffect(() => {
    if (!open) return
    setSearchInput('')
    setSearch('')
    patch.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const query = usePartyAccounts({
    search,
    nature: 'organization',
    limit: 8,
  })
  const results = (query.data?.data ?? []).filter(
    (row) => row.publicId !== publicId
  )
  const error = patch.error instanceof ApiError ? patch.error.message : null

  const attach = (parentPublicId: string) =>
    patch.mutate(
      { parentAccountPublicId: parentPublicId },
      { onSuccess: () => onOpenChange(false) }
    )
  const detach = () =>
    patch.mutate(
      { parentAccountPublicId: null },
      { onSuccess: () => onOpenChange(false) }
    )

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={t('party.detail.editParent')}
      description={t('party.detail.parentHint')}
      // Pas d'enregistrement : choisir dans la liste rattache aussitôt. Le pied ne
      // propose donc que « Fermer », plutôt qu'un bouton qui ne ferait rien.
      error={error}
    >
      {currentParent ? (
        <div className="border-border flex items-center justify-between gap-2 rounded-md border px-3 py-2">
          <span className="text-foreground text-2sm truncate">
            {currentParent.displayName}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={detach}
            disabled={patch.isPending}
          >
            {t('party.detail.detachParent')}
          </Button>
        </div>
      ) : null}

      <Input
        placeholder={t('party.detail.searchParent')}
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
      />

      <ul className="flex max-h-64 flex-col overflow-y-auto">
        {results.map((row) => (
          <li key={row.publicId}>
            <button
              type="button"
              onClick={() => attach(row.publicId)}
              disabled={patch.isPending}
              className="hover:bg-muted/50 flex w-full flex-col gap-0.5 rounded-md p-2 text-start"
            >
              <span className="text-foreground text-2sm truncate font-medium">
                {row.displayName}
              </span>
              {row.email ? (
                <span className="text-muted-foreground truncate text-xs">
                  {row.email}
                </span>
              ) : null}
            </button>
          </li>
        ))}
        {search !== '' && results.length === 0 && !query.isFetching ? (
          <li className="text-muted-foreground text-2sm p-2">
            {t('party.empty')}
          </li>
        ) : null}
      </ul>
    </FormModal>
  )
}
