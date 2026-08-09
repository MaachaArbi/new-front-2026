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
import { SelectField } from '@/shared/ui/select'
import { ApiError } from '@/shared/api/errors'
import { usePartyFinanceMutations } from './queries'
import type { OfficeChoice } from './party-credit-limit-sheet'
import type { PartyTaxExemption } from './api'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

const EXEMPTION_TYPES = ['stamp_duty', 'vat'] as const

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
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted-foreground text-sm">{label}</span>
      {children}
      {error ? <span className="text-destructive text-xs">{error}</span> : null}
    </label>
  )
}

/**
 * Exonération de TVA : **créer** (société obligatoire, type stamp_duty/vat, dates) OU **ajouter
 * le justificatif** (PATCH du numéro) sur une exonération existante. `certificateNumber` vide
 * = exonération **sans justificatif** — ce qu'on veut relancer. **Ne déclenche RIEN.**
 */
export function PartyTaxExemptionSheet({
  open,
  onOpenChange,
  publicId,
  offices,
  exemption,
  officeName,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  publicId: string
  offices: readonly OfficeChoice[]
  exemption: PartyTaxExemption | null
  officeName: (accountId: number | null) => string
  t: Translate
}) {
  const { taxExemption } = usePartyFinanceMutations(publicId)
  const isCertificate = exemption !== null
  const mutation = isCertificate
    ? taxExemption.updateCertificate
    : taxExemption.create

  const [officeAccountId, setOfficeAccountId] = React.useState<number | null>(
    null
  )
  const [exemptionType, setExemptionType] = React.useState<string>('vat')
  const [certificateNumber, setCertificateNumber] = React.useState('')
  const [validFrom, setValidFrom] = React.useState('')
  const [validTo, setValidTo] = React.useState('')

  React.useEffect(() => {
    if (!open) return
    setOfficeAccountId(
      offices.length === 1 ? (offices[0]?.value ?? null) : null
    )
    setExemptionType(exemption?.exemptionType ?? 'vat')
    setCertificateNumber(exemption?.certificateNumber ?? '')
    setValidFrom(exemption?.validFrom ?? '')
    setValidTo(exemption?.validTo ?? '')
    taxExemption.create.reset()
    taxExemption.updateCertificate.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const errors = violationsOf(mutation.error)
  // Erreur sans champ nommé (ex. garde base « ne traite pas ce client ») → sinon invisible.
  const generalError =
    mutation.error instanceof ApiError && mutation.error.violations.length === 0
      ? mutation.error.message
      : null

  const save = () => {
    if (isCertificate && exemption) {
      taxExemption.updateCertificate.mutate(
        {
          exemptionPublicId: exemption.publicId,
          input: { certificateNumber: orNull(certificateNumber) },
        },
        { onSuccess: () => onOpenChange(false) }
      )
      return
    }
    if (officeAccountId == null) return
    taxExemption.create.mutate(
      {
        officeAccountId,
        exemptionType,
        certificateNumber: orNull(certificateNumber),
        validFrom: orNull(validFrom),
        validTo: orNull(validTo),
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  const selectClass =
    'border-input bg-background h-8.5 rounded-md border px-3 text-sm'
  const canSave = isCertificate || officeAccountId != null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isCertificate
              ? t('party.finance.exemptionCertificate')
              : t('party.finance.addExemption')}
          </SheetTitle>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-4">
          {generalError ? (
            <p className="text-destructive text-sm">{generalError}</p>
          ) : null}
          {isCertificate && exemption ? (
            <p className="text-muted-foreground text-sm">
              {t(`party.finance.exemption.${exemption.exemptionType}`, {})} ·{' '}
              {officeName(exemption.officeAccountId)}
            </p>
          ) : (
            <>
              <LabeledField
                label={t('party.finance.office')}
                error={errors.officeAccountId}
              >
                <SelectField
                  ariaLabel={t('party.finance.office')}
                  value={
                    officeAccountId === null ? '' : String(officeAccountId)
                  }
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
                label={t('party.finance.exemptionType')}
                error={errors.exemptionType}
              >
                <SelectField
                  ariaLabel={t('party.finance.exemptionType')}
                  value={exemptionType}
                  onChange={setExemptionType}
                  options={EXEMPTION_TYPES.map((code) => ({
                    code,
                    label: t(`party.finance.exemption.${code}`),
                  }))}
                />
              </LabeledField>

              <LabeledField
                label={t('party.finance.validFrom')}
                error={errors.validFrom}
              >
                <input
                  type="date"
                  value={validFrom}
                  onChange={(event) => setValidFrom(event.target.value)}
                  className={selectClass}
                />
              </LabeledField>

              <LabeledField
                label={t('party.finance.validTo')}
                error={errors.validTo}
              >
                <input
                  type="date"
                  value={validTo}
                  onChange={(event) => setValidTo(event.target.value)}
                  className={selectClass}
                />
              </LabeledField>
            </>
          )}

          <LabeledField
            label={t('party.finance.certificateNumber')}
            error={errors.certificateNumber}
          >
            <Input
              value={certificateNumber}
              onChange={(event) => setCertificateNumber(event.target.value)}
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
            disabled={mutation.isPending || !canSave}
          >
            {t('party.detail.save')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
