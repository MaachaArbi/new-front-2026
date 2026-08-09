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
import { SelectField } from '@/shared/ui/select'
import { CheckboxField } from '@/shared/ui/checkbox'
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

          <SelectField
            label={t('party.finance.scope')}
            value={officeAccountId === null ? '' : String(officeAccountId)}
            disabled={isEdit}
            onChange={(next) =>
              setOfficeAccountId(next === '' ? null : Number(next))
            }
            emptyLabel={t('party.finance.commonPolicy')}
            options={offices.map((office) => ({
              code: String(office.value),
              label: office.label,
            }))}
          />

          <CheckboxField
            label={t('party.finance.forceOnRequest')}
            checked={forceOnRequest}
            onChange={setForceOnRequest}
          />

          <CheckboxField
            label={t('party.finance.blockInsufficient')}
            checked={blockInsufficient}
            onChange={setBlockInsufficient}
          />
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
