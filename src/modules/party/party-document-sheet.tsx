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
import { CountrySelect } from '@/shared/ui/country-select'
import { SelectField } from '@/shared/ui/select'
import { DateField } from '@/shared/ui/date-field'
import { ApiError } from '@/shared/api/errors'
import type { ReferentialItem } from '@/shared/referentials'
import { usePartyDocumentMutations } from './queries'
import type { PartyDocument } from './api'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

const DOCUMENT_TYPES = [
  'passport',
  'cin',
  'driving_license',
  'contract',
  'other',
] as const

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
 * Créer / éditer une **pièce du dossier**. Seul `documentType` est requis — et **seulement à
 * la création** (le changer n'a pas de sens : en édition il est figé). Dates `AAAA-MM-JJ`,
 * expiration ≥ émission (422 par champ sinon). Le **fichier se dépose à part**, sur la carte.
 */
export function PartyDocumentSheet({
  open,
  onOpenChange,
  publicId,
  document,
  countries,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  publicId: string
  document: PartyDocument | null
  countries: readonly ReferentialItem[]
  t: Translate
}) {
  const { create, update } = usePartyDocumentMutations(publicId)
  const isEdit = document !== null

  const [documentType, setDocumentType] = React.useState('passport')
  const [documentNumber, setDocumentNumber] = React.useState('')
  const [issuingCountry, setIssuingCountry] = React.useState<string | null>(
    null
  )
  const [issueDate, setIssueDate] = React.useState('')
  const [expiryDate, setExpiryDate] = React.useState('')

  React.useEffect(() => {
    if (!open) return
    setDocumentType(document?.documentType ?? 'passport')
    setDocumentNumber(document?.documentNumber ?? '')
    setIssuingCountry(document?.issuingCountry ?? null)
    setIssueDate(document?.issueDate ?? '')
    setExpiryDate(document?.expiryDate ?? '')
    create.reset()
    update.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const pending = create.isPending || update.isPending
  const errors = violationsOf(create.error ?? update.error)

  const save = () => {
    const shared = {
      documentNumber: orNull(documentNumber),
      issuingCountry,
      issueDate: orNull(issueDate),
      expiryDate: orNull(expiryDate),
    }
    if (isEdit && document) {
      update.mutate(
        { documentPublicId: document.publicId, input: shared },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      create.mutate(
        { documentType, ...shared },
        { onSuccess: () => onOpenChange(false) }
      )
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isEdit ? t('party.document.edit') : t('party.document.add')}
          </SheetTitle>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-4">
          <LabeledField
            label={t('party.document.type')}
            error={errors.documentType}
          >
            {isEdit ? (
              <span className="text-foreground text-sm">
                {t(`party.document.type.${documentType}`)}
              </span>
            ) : (
              <SelectField
                ariaLabel={t('party.document.type')}
                value={documentType}
                onChange={setDocumentType}
                options={DOCUMENT_TYPES.map((code) => ({
                  code,
                  label: t(`party.document.type.${code}`),
                }))}
              />
            )}
          </LabeledField>

          <LabeledField
            label={t('party.document.number')}
            error={errors.documentNumber}
          >
            <Input
              value={documentNumber}
              onChange={(event) => setDocumentNumber(event.target.value)}
            />
          </LabeledField>

          <LabeledField
            label={t('party.document.issuingCountry')}
            error={errors.issuingCountry}
          >
            <CountrySelect
              countries={countries}
              value={issuingCountry}
              onChange={setIssuingCountry}
              t={t}
            />
          </LabeledField>

          <LabeledField
            label={t('party.document.issueDate')}
            error={errors.issueDate}
          >
            <DateField
              ariaLabel={t('party.document.issueDate')}
              value={issueDate}
              onChange={setIssueDate}
              max={expiryDate || undefined}
            />
          </LabeledField>

          <LabeledField
            label={t('party.document.expiryDate')}
            error={errors.expiryDate}
          >
            <DateField
              ariaLabel={t('party.document.expiryDate')}
              value={expiryDate}
              onChange={setExpiryDate}
              min={issueDate || undefined}
            />
          </LabeledField>
        </SheetBody>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('party.detail.cancel')}
          </Button>
          <Button variant="primary" onClick={save} disabled={pending}>
            {t('party.detail.save')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
