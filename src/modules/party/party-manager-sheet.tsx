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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('party.finance.addManager')}</SheetTitle>
          <SheetDescription>{t('party.finance.manager.hint')}</SheetDescription>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-3">
          {error ? <p className="text-destructive text-xs">{error}</p> : null}

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
              <Button
                variant="primary"
                onClick={submit}
                disabled={create.isPending}
              >
                {t('party.finance.addManagerSubmit')}
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
