import * as React from 'react'
import { Input } from '@/shared/ui/input'
import { CurrencySelect } from '@/shared/ui/currency-select'
import { SelectField } from '@/shared/ui/select'
import { DateField } from '@/shared/ui/date-field'
import { FormField, FormModal } from '@/shared/ui/form-modal'
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
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={t('party.finance.addCreditLimit')}
      description={t('party.finance.limitDatesHint')}
      submitLabel={t('party.detail.save')}
      onSubmit={save}
      submitting={create.isPending}
      canSubmit={canSave}
      error={generalError}
    >
      <FormField
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
      </FormField>

      {/* Deux champs courts côte à côte, comme la maquette validée : le formulaire
          tient dans la hauteur de la modale sans défilement. */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label={t('party.finance.service')}
          error={errors.serviceTypeCode}
        >
          <SelectField
            ariaLabel={t('party.finance.service')}
            value={serviceTypeCode}
            onChange={setServiceTypeCode}
            emptyLabel={t('party.finance.allServices')}
            options={serviceTypes}
          />
        </FormField>
        <FormField
          label={t('party.finance.currency')}
          error={errors.currencyCode}
        >
          <CurrencySelect
            currencies={currencies}
            value={currencyCode}
            onChange={setCurrencyCode}
            defaultLabel={t('party.finance.chooseCurrency')}
          />
        </FormField>
      </div>

      <FormField
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
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label={t('party.finance.validFrom')}
          error={errors.validFrom}
        >
          <DateField
            ariaLabel={t('party.finance.validFrom')}
            value={validFrom}
            onChange={setValidFrom}
            max={validTo || undefined}
          />
        </FormField>
        <FormField label={t('party.finance.validTo')} error={errors.validTo}>
          <DateField
            ariaLabel={t('party.finance.validTo')}
            value={validTo}
            onChange={setValidTo}
            min={validFrom || undefined}
          />
        </FormField>
      </div>
    </FormModal>
  )
}
