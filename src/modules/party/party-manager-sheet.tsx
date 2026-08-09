import * as React from 'react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { SelectField } from '@/shared/ui/select'
import { FormModal } from '@/shared/ui/form-modal'
import { ApiError } from '@/shared/api/errors'
import { usePartyAccounts, usePartyFinanceMutations } from './queries'
import type { OfficeChoice } from './party-credit-limit-sheet'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

const ASSIGNMENT_TYPES = ['commercial', 'collection'] as const

/**
 * Ajoute un **chargé de compte** — une **personne** (recherchée), un **type** (commercial /
 * recouvrement), une société **facultative** (vide = **toutes les sociétés**). Un client peut
 * en avoir **plusieurs** à la fois. **Ne déclenche RIEN.**
 */
export function PartyManagerSheet({
  open,
  onOpenChange,
  publicId,
  offices,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  publicId: string
  offices: readonly OfficeChoice[]
  t: Translate
}) {
  const { manager } = usePartyFinanceMutations(publicId)
  const create = manager.create

  const [searchInput, setSearchInput] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [selected, setSelected] = React.useState<{
    publicId: string
    displayName: string
  } | null>(null)
  const [assignmentType, setAssignmentType] =
    React.useState<string>('commercial')
  const [officeAccountId, setOfficeAccountId] = React.useState<number | null>(
    null
  )

  React.useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  React.useEffect(() => {
    if (!open) return
    setSearchInput('')
    setSearch('')
    setSelected(null)
    setAssignmentType('commercial')
    setOfficeAccountId(null)
    create.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const query = usePartyAccounts({ search, nature: 'person', limit: 8 })
  const results = query.data?.data ?? []
  // Le doublon (même personne + titre + société) est refusé PAR LA BASE (409, message dédié).
  const error = create.error instanceof ApiError ? create.error.message : null

  const submit = () => {
    if (!selected) return
    create.mutate(
      { managerPublicId: selected.publicId, assignmentType, officeAccountId },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={t('party.finance.addManager')}
      submitLabel={t('party.finance.addManagerSubmit')}
      onSubmit={submit}
      submitting={create.isPending}
      // Comme pour les interlocuteurs : la validation quitte la carte de la personne
      // pour le pied de la modale, et attend qu'une personne soit choisie.
      canSubmit={selected !== null}
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
            label={t('party.finance.assignmentType')}
            value={assignmentType}
            onChange={setAssignmentType}
            options={ASSIGNMENT_TYPES.map((code) => ({
              code,
              label: t(`party.finance.assignment.${code}`),
            }))}
          />
          <SelectField
            label={t('party.finance.office')}
            value={officeAccountId === null ? '' : String(officeAccountId)}
            onChange={(next) =>
              setOfficeAccountId(next === '' ? null : Number(next))
            }
            emptyLabel={t('party.finance.allOffices')}
            options={offices.map((office) => ({
              code: String(office.value),
              label: office.label,
            }))}
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
