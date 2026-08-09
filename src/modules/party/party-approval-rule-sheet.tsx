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
import { SelectField } from '@/shared/ui/select'
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('party.finance.addApprovalRule')}</SheetTitle>
          <SheetDescription>
            {t('party.finance.approvalRules.hint')}
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-3">
          {error ? <p className="text-destructive text-xs">{error}</p> : null}

          <SelectField
            label={t('party.finance.function')}
            value={functionCode}
            onChange={setFunctionCode}
            options={functions}
          />

          {selected ? (
            <div className="border-border flex flex-col gap-3 rounded-md border p-2">
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
              <Button
                variant="primary"
                onClick={submit}
                disabled={create.isPending}
              >
                {t('party.finance.addApprovalSubmit')}
              </Button>
            </div>
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
