import * as React from 'react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { SelectField } from '@/shared/ui/select'
import { FormModal } from '@/shared/ui/form-modal'
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
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={t('party.detail.addInterlocutor')}
      description={t('party.detail.interlocutorHint')}
      submitLabel={t('party.detail.addInterlocutorSubmit')}
      onSubmit={submit}
      submitting={assign.isPending}
      // Le bouton d'ajout était posé DANS la carte de la personne choisie : la
      // validation changeait de place selon l'étape. Il vit maintenant au pied de la
      // modale, comme dans tous les autres formulaires, et reste inerte tant qu'il
      // manque une personne ou une fonction.
      canSubmit={selected !== null && functionCode !== ''}
      error={error}
    >
      {selected ? (
        <>
          <div className="border-border flex items-center justify-between gap-2 rounded-md border px-3 py-2">
            <span className="text-foreground text-2sm truncate font-medium">
              {selected.displayName}
            </span>
            <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
              {t('party.detail.changePerson')}
            </Button>
          </div>
          <SelectField
            label={t('party.detail.function')}
            value={functionCode}
            onChange={setFunctionCode}
            options={functions}
          />
        </>
      ) : (
        <>
          <Input
            placeholder={t('party.detail.searchPerson')}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            autoFocus
          />
          <ul className="flex max-h-64 flex-col overflow-y-auto">
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
        </>
      )}
    </FormModal>
  )
}
