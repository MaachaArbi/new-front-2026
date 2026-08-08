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
import { PhoneInput } from '@/shared/ui/phone-input'
import { CountrySelect } from '@/shared/ui/country-select'
import { Button } from '@/shared/ui/button'
import { ApiError } from '@/shared/api/errors'
import type { ReferentialItem } from '@/shared/referentials'
import { usePatchPartyAccount } from './queries'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

function orNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/** `{champ: message}` des 422 (ex. email déjà utilisé, pays inconnu). */
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
 * Édition des contacts (email, tél 1/2, pays) — `PATCH` partiel. **Aucune validation
 * de format** (le back accepte 50 car. libres pour les téléphones ; un masque qui
 * refuse ce que l'API accepte crée un désaccord invisible). Les **422** (email déjà
 * utilisé, pays inconnu) s'affichent par champ — sans jamais nommer l'autre compte.
 */
export function PartyContactSheet({
  open,
  onOpenChange,
  publicId,
  email,
  phonePrimary,
  phoneSecondary,
  country,
  countries,
  defaultCountry,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  publicId: string
  email: string | null
  phonePrimary: string | null
  phoneSecondary: string | null
  country: string | null
  countries: readonly ReferentialItem[]
  /** Pays du bureau (présélection de l'indicatif) ; `undefined` = pas de repli. */
  defaultCountry?: string
  t: Translate
}) {
  const patch = usePatchPartyAccount(publicId)

  const [emailValue, setEmailValue] = React.useState('')
  const [phone1, setPhone1] = React.useState('')
  const [phone2, setPhone2] = React.useState('')
  const [countryValue, setCountryValue] = React.useState('')

  React.useEffect(() => {
    if (!open) return
    setEmailValue(email ?? '')
    setPhone1(phonePrimary ?? '')
    setPhone2(phoneSecondary ?? '')
    setCountryValue(country ?? '')
    patch.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const errors = violationsOf(patch.error)

  const save = () => {
    patch.mutate(
      {
        email: orNull(emailValue),
        phonePrimary: orNull(phone1),
        phoneSecondary: orNull(phone2),
        country: orNull(countryValue),
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('party.detail.editCoordinates')}</SheetTitle>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-4">
          <LabeledField label={t('party.detail.email')} error={errors.email}>
            <Input
              type="text"
              value={emailValue}
              onChange={(event) => setEmailValue(event.target.value)}
            />
          </LabeledField>
          <LabeledField label={t('party.column.phone')}>
            <PhoneInput
              value={phone1}
              onChange={setPhone1}
              countries={countries}
              defaultCountry={defaultCountry}
              t={t}
            />
          </LabeledField>
          <LabeledField label={t('party.detail.field.phoneSecondary')}>
            <PhoneInput
              value={phone2}
              onChange={setPhone2}
              countries={countries}
              defaultCountry={defaultCountry}
              t={t}
            />
          </LabeledField>
          <LabeledField
            label={t('party.column.country')}
            error={errors.country}
          >
            <CountrySelect
              countries={countries}
              value={countryValue || null}
              onChange={(value) => setCountryValue(value ?? '')}
              t={t}
            />
          </LabeledField>
        </SheetBody>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('party.detail.cancel')}
          </Button>
          <Button variant="primary" onClick={save} disabled={patch.isPending}>
            {t('party.detail.save')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
