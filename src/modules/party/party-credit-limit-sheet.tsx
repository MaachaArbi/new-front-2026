import * as React from 'react'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { CurrencySelect } from '@/shared/ui/currency-select'
import { SelectField } from '@/shared/ui/select'
import { DateField } from '@/shared/ui/date-field'
import { ApiError } from '@/shared/api/errors'
import { majorToMinor } from '@/shared/lib/money'
import type { ReferentialItem } from '@/shared/referentials'
import { usePartyFinanceMutations } from './queries'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

export interface OfficeChoice {
  value: number
  label: string
}

function orNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function violationsOf(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {}
  const map: Record<string, string> = {}
  for (const v of error.violations) map[v.field] = v.message
  return map
}

function LabeledField({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted-foreground text-sm">{label}</span>
      {children}
      {hint ? (
        <span className="text-muted-foreground text-xs">{hint}</span>
      ) : null}
      {error ? <span className="text-destructive text-xs">{error}</span> : null}
    </label>
  )
}

/**
 * Ajoute un **plafond de crédit** — société **obligatoire**, devise **obligatoire**, montant
 * saisi en unités **majeures** puis converti en mineures **selon les décimales de la devise**
 * (TND : 3). **Ne déclenche RIEN**. Type de service **facultatif** (vide = tous les services ;
 * sinon le plafond ne s’applique qu’à ce service — le plus spécifique l’emporte).
 */
export function PartyCreditLimitSheet({
  open,
  onOpenChange,
  publicId,
  offices,
  currencies,
  serviceTypes,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  publicId: string
  offices: readonly OfficeChoice[]
  currencies: readonly ReferentialItem[]
  serviceTypes: readonly ReferentialItem[]
  t: Translate
}) {
  const { creditLimit } = usePartyFinanceMutations(publicId)
  const create = creditLimit.create

  const [officeAccountId, setOfficeAccountId] = React.useState<number | null>(
    null
  )
  const [currencyCode, setCurrencyCode] = React.useState<string | null>(null)
  const [serviceTypeCode, setServiceTypeCode] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [validFrom, setValidFrom] = React.useState('')
  const [validTo, setValidTo] = React.useState('')

  React.useEffect(() => {
    if (!open) return
    setOfficeAccountId(
      offices.length === 1 ? (offices[0]?.value ?? null) : null
    )
    setCurrencyCode(null)
    setServiceTypeCode('')
    setAmount('')
    setValidFrom('')
    setValidTo('')
    create.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const errors = violationsOf(create.error)
  // 422 sans champ nommé (ex. « second socle », garde base) → sinon invisible.
  const generalError =
    create.error instanceof ApiError && create.error.violations.length === 0
      ? create.error.message
      : null
  const minor =
    currencyCode && amount.trim() !== ''
      ? majorToMinor(amount, currencyCode)
      : null
  const canSave =
    officeAccountId != null && currencyCode != null && minor != null

  const save = () => {
    if (officeAccountId == null || currencyCode == null || minor == null) return
    create.mutate(
      {
        officeAccountId,
        currencyCode,
        amountMinor: minor,
        serviceTypeCode: orNull(serviceTypeCode),
        validFrom: orNull(validFrom),
        validTo: orNull(validTo),
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('party.finance.addCreditLimit')}</SheetTitle>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-4">
          {generalError ? (
            <p className="text-destructive text-sm">{generalError}</p>
          ) : null}
          <LabeledField
            label={t('party.finance.office')}
            error={errors.officeAccountId}
          >
            <SelectField
              ariaLabel={t('party.finance.office')}
              value={officeAccountId === null ? '' : String(officeAccountId)}
              onChange={(next) =>
                setOfficeAccountId(next === '' ? null : Number(next))
              }
              emptyLabel={t('party.finance.chooseOffice')}
              options={offices.map((office) => ({
                code: String(office.value),
                label: office.label,
              }))}
            />
          </LabeledField>

          <LabeledField
            label={t('party.finance.currency')}
            error={errors.currencyCode}
          >
            <CurrencySelect
              currencies={currencies}
              value={currencyCode}
              onChange={setCurrencyCode}
              defaultLabel={t('party.finance.chooseCurrency')}
            />
          </LabeledField>

          <LabeledField
            label={t('party.finance.service')}
            hint={t('party.finance.service.hint')}
            error={errors.serviceTypeCode}
          >
            <SelectField
              ariaLabel={t('party.finance.service')}
              value={serviceTypeCode}
              onChange={setServiceTypeCode}
              emptyLabel={t('party.finance.allServices')}
              options={serviceTypes}
            />
          </LabeledField>

          <LabeledField
            label={t('party.finance.amount')}
            hint={t('party.finance.amount.hint')}
            error={errors.amountMinor}
          >
            <Input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              placeholder="0"
            />
          </LabeledField>

          <LabeledField
            label={t('party.finance.validFrom')}
            error={errors.validFrom}
          >
            <DateField
              ariaLabel={t('party.finance.validFrom')}
              value={validFrom}
              onChange={setValidFrom}
              max={validTo || undefined}
            />
          </LabeledField>

          <LabeledField
            label={t('party.finance.validTo')}
            hint={t('party.finance.limitDatesHint')}
            error={errors.validTo}
          >
            <DateField
              ariaLabel={t('party.finance.validTo')}
              value={validTo}
              onChange={setValidTo}
              min={validFrom || undefined}
            />
          </LabeledField>
        </SheetBody>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('party.detail.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={save}
            disabled={create.isPending || !canSave}
          >
            {t('party.detail.save')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
