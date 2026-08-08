import * as React from 'react'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { Button } from '@/shared/ui/button'
import { ApiError } from '@/shared/api/errors'
import { usePartyFinanceMutations } from './queries'
import type { OfficeChoice } from './party-credit-limit-sheet'
import type { PartyCommercialPolicy } from './api'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

/**
 * Politique commerciale — **PUT par portée** (commune ou une société). Une commune et une de
 * société coexistent, la plus précise l'emporte. **Ne déclenche RIEN** : ce sont des réglages
 * enregistrés, pas des comportements. (Pas de suppression : on ré-enregistre.)
 */
export function PartyPolicySheet({
  open,
  onOpenChange,
  publicId,
  offices,
  policy,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  publicId: string
  offices: readonly OfficeChoice[]
  policy: PartyCommercialPolicy | null
  t: Translate
}) {
  const { policy: policyMutations } = usePartyFinanceMutations(publicId)
  const put = policyMutations.put

  const [officeAccountId, setOfficeAccountId] = React.useState<number | null>(
    null
  )
  const [forceOnRequest, setForceOnRequest] = React.useState(false)
  const [blockInsufficient, setBlockInsufficient] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setOfficeAccountId(policy?.officeAccountId ?? null)
    setForceOnRequest(policy?.forceOnRequest ?? false)
    setBlockInsufficient(policy?.blockWhenInsufficientBalance ?? false)
    put.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const error = put.error instanceof ApiError ? put.error.message : null
  const isEdit = policy !== null

  const save = () =>
    put.mutate(
      {
        officeAccountId,
        forceOnRequest,
        blockWhenInsufficientBalance: blockInsufficient,
      },
      { onSuccess: () => onOpenChange(false) }
    )

  const selectClass =
    'border-input bg-background h-8.5 rounded-md border px-3 text-sm'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('party.finance.setPolicy')}</SheetTitle>
          <SheetDescription>
            {t('party.finance.commercialPolicy.hint')}
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-4">
          {error ? <p className="text-destructive text-xs">{error}</p> : null}

          <label className="flex flex-col gap-1">
            <span className="text-muted-foreground text-sm">
              {t('party.finance.scope')}
            </span>
            <select
              value={officeAccountId ?? ''}
              disabled={isEdit}
              onChange={(event) =>
                setOfficeAccountId(
                  event.target.value === '' ? null : Number(event.target.value)
                )
              }
              className={selectClass}
            >
              <option value="">{t('party.finance.commonPolicy')}</option>
              {offices.map((office) => (
                <option key={office.value} value={office.value}>
                  {office.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="size-4"
              checked={forceOnRequest}
              onChange={(event) => setForceOnRequest(event.target.checked)}
            />
            <span className="text-foreground text-sm">
              {t('party.finance.forceOnRequest')}
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="size-4"
              checked={blockInsufficient}
              onChange={(event) => setBlockInsufficient(event.target.checked)}
            />
            <span className="text-foreground text-sm">
              {t('party.finance.blockInsufficient')}
            </span>
          </label>
        </SheetBody>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('party.detail.cancel')}
          </Button>
          <Button variant="primary" onClick={save} disabled={put.isPending}>
            {t('party.detail.save')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
