import * as React from 'react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { SelectField } from '@/shared/ui/select'
import { FormModal } from '@/shared/ui/form-modal'
import { ApiError } from '@/shared/api/errors'
import type { ReferentialItem } from '@/shared/referentials'
import { usePartyAccounts, usePartyFinanceMutations } from './queries'
import type { OfficeChoice } from './party-credit-limit-sheet'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

/**
 * Ajoute une **règle d'approbation** — une **fonction** (référentiel), un **validateur**
 * (personne recherchée), une société **facultative**. Plusieurs validateurs pour une même
 * fonction ; **l'accord d'un seul suffit**. **Ne déclenche RIEN.**
 */
export function PartyApprovalRuleSheet({
  open,
  onOpenChange,
  publicId,
  offices,
  functions,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  publicId: string
  offices: readonly OfficeChoice[]
  functions: readonly ReferentialItem[]
  t: Translate
}) {
  const { approvalRule } = usePartyFinanceMutations(publicId)
  const create = approvalRule.create

  const [functionCode, setFunctionCode] = React.useState('')
  const [searchInput, setSearchInput] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [selected, setSelected] = React.useState<{
    publicId: string
    displayName: string
  } | null>(null)
  const [officeAccountId, setOfficeAccountId] = React.useState<number | null>(
    null
  )

  React.useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  React.useEffect(() => {
    if (!open) return
    setFunctionCode(functions[0]?.code ?? '')
    setSearchInput('')
    setSearch('')
    setSelected(null)
    setOfficeAccountId(null)
    create.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const query = usePartyAccounts({ search, nature: 'person', limit: 8 })
  const results = query.data?.data ?? []
  const error = create.error instanceof ApiError ? create.error.message : null

  const submit = () => {
    if (!selected || !functionCode) return
    create.mutate(
      {
        functionCode,
        validatorPublicId: selected.publicId,
        officeAccountId,
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={t('party.finance.addApprovalRule')}
      description={t('party.finance.approvalRules.hint')}
      submitLabel={t('party.finance.addApprovalSubmit')}
      onSubmit={submit}
      submitting={create.isPending}
      canSubmit={selected !== null && functionCode !== ''}
      error={error}
    >
      <SelectField
        label={t('party.finance.function')}
        value={functionCode}
        onChange={setFunctionCode}
        options={functions}
      />

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
          <span className="text-muted-foreground text-sm">
            {t('party.finance.validator')}
          </span>
          <Input
            placeholder={t('party.detail.searchPerson')}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
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
