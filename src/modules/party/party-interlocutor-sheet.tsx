import * as React from 'react'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { ApiError } from '@/shared/api/errors'
import type { ReferentialItem } from '@/shared/referentials'
import { usePartyAccounts, usePartyFunctionMutations } from './queries'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

/**
 * Inscrit un **interlocuteur** chez cette organisation : on cherche une **personne**
 * (tiers indépendant), on choisit sa **fonction**, puis `POST` sur la personne avec
 * l'`accountId` de l'organisation. **Inscrire ne connecte personne** — aucun mot d'accès /
 * d'invitation. Refus back (**403** : organisation non visible, ou personne = soi) affiché tel quel.
 */
export function PartyInterlocutorSheet({
  open,
  onOpenChange,
  organizationPublicId,
  organizationAccountId,
  functions,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationPublicId: string
  organizationAccountId: number
  functions: readonly ReferentialItem[]
  t: Translate
}) {
  const { assign } = usePartyFunctionMutations(organizationPublicId)
  const [searchInput, setSearchInput] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [selected, setSelected] = React.useState<{
    publicId: string
    displayName: string
  } | null>(null)
  const [functionCode, setFunctionCode] = React.useState('')

  React.useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  React.useEffect(() => {
    if (!open) return
    setSearchInput('')
    setSearch('')
    setSelected(null)
    setFunctionCode(functions[0]?.code ?? '')
    assign.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const query = usePartyAccounts({ search, nature: 'person', limit: 8 })
  const results = query.data?.data ?? []
  const error = assign.error instanceof ApiError ? assign.error.message : null

  const submit = () => {
    if (!selected || !functionCode) return
    assign.mutate(
      {
        personPublicId: selected.publicId,
        organizationAccountId,
        functionCode,
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('party.detail.addInterlocutor')}</SheetTitle>
          <SheetDescription>
            {t('party.detail.interlocutorHint')}
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-3">
          {error ? <p className="text-destructive text-xs">{error}</p> : null}

          {selected ? (
            <div className="border-border flex flex-col gap-2 rounded-md border p-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-foreground truncate text-sm font-medium">
                  {selected.displayName}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelected(null)}
                >
                  {t('party.detail.changePerson')}
                </Button>
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">
                  {t('party.detail.function')}
                </span>
                <select
                  value={functionCode}
                  onChange={(event) => setFunctionCode(event.target.value)}
                  className="border-input bg-background h-8.5 rounded-md border px-3 text-sm"
                >
                  {functions.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                variant="primary"
                onClick={submit}
                disabled={assign.isPending || !functionCode}
              >
                {t('party.detail.addInterlocutorSubmit')}
              </Button>
            </div>
          ) : (
            <>
              <Input
                placeholder={t('party.detail.searchPerson')}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                autoFocus
              />
              <ul className="flex flex-col">
                {results.map((row) => (
                  <li key={row.publicId}>
                    <button
                      type="button"
                      onClick={() =>
                        setSelected({
                          publicId: row.publicId,
                          displayName: row.displayName,
                        })
                      }
                      className="hover:bg-muted/50 flex w-full flex-col gap-0.5 rounded-md p-2 text-start"
                    >
                      <span className="text-foreground truncate text-sm font-medium">
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
                  <li className="text-muted-foreground p-2 text-sm">
                    {t('party.empty')}
                  </li>
                ) : null}
              </ul>
            </>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}
