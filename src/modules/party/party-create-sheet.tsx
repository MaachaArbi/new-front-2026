import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { Input } from '@/shared/ui/input'
import { PhoneInput } from '@/shared/ui/phone-input'
import { CountrySelect } from '@/shared/ui/country-select'
import { Button } from '@/shared/ui/button'
import { RadioField } from '@/shared/ui/radio-group'
import { Segmented } from '@/shared/ui/segmented'
import { CheckboxField } from '@/shared/ui/checkbox'
import { ApiError } from '@/shared/api/errors'
import { useAuth } from '@/app/providers/auth-provider'
import { officesOf, officeCountryOf } from '@/shared/auth/me'
import { useReferentials, codeLabel } from '@/shared/referentials'
import { useCreatePartyAccount } from './queries'
import type { PartyNature } from './api'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

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
 * Création d'un tiers — **shell** (option A) : nature + nom + portée bureau requis ;
 * coordonnées optionnelles. Identité, rôles, adresses, agence mère s'ajoutent APRÈS
 * sur la fiche (on y navigue au succès). `restricted` exige des bureaux (de `/me`) +
 * un rôle. 422 du back (email déjà utilisé, pays inconnu) affichés par champ.
 */
export function PartyCreateSheet({
  open,
  onOpenChange,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  t: Translate
}) {
  const navigate = useNavigate()
  const { me } = useAuth()
  const officeCountry = me ? officeCountryOf(me) : null
  const referentials = useReferentials().data
  const roleLabel = codeLabel(referentials?.roles)
  const officeOptions = React.useMemo(
    () =>
      (me ? officesOf(me) : []).map((office) => ({
        value: office.accountId,
        label: office.displayName,
      })),
    [me]
  )

  const create = useCreatePartyAccount()

  const [nature, setNature] = React.useState<PartyNature>('organization')
  const [displayName, setDisplayName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone1, setPhone1] = React.useState('')
  const [phone2, setPhone2] = React.useState('')
  const [country, setCountry] = React.useState('')
  const [officeScope, setOfficeScope] = React.useState<
    'all_offices' | 'restricted'
  >('all_offices')
  const [offices, setOffices] = React.useState<number[]>([])
  const [relationType, setRelationType] = React.useState<
    'customer' | 'supplier'
  >('customer')

  React.useEffect(() => {
    if (!open) return
    setNature('organization')
    setDisplayName('')
    setEmail('')
    setPhone1('')
    setPhone2('')
    setCountry('')
    setOfficeScope('all_offices')
    setOffices([])
    setRelationType('customer')
    create.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const errors = violationsOf(create.error)
  const canSave =
    displayName.trim() !== '' &&
    (officeScope === 'all_offices' || offices.length > 0)

  const toggleOffice = (value: number, checked: boolean) =>
    setOffices((current) =>
      checked ? [...current, value] : current.filter((id) => id !== value)
    )

  const submit = () => {
    create.mutate(
      {
        nature,
        displayName: displayName.trim(),
        email: orNull(email),
        phonePrimary: orNull(phone1),
        phoneSecondary: orNull(phone2),
        country: orNull(country),
        officeScope,
        officeAccountIds: officeScope === 'restricted' ? offices : undefined,
        relationType: officeScope === 'restricted' ? relationType : undefined,
      },
      {
        onSuccess: (created) => {
          onOpenChange(false)
          navigate(`/parties/${created.publicId}`)
        },
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('party.create.title')}</SheetTitle>
          <SheetDescription>{t('party.create.hint')}</SheetDescription>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-4">
          <Segmented
            label={t('party.column.nature')}
            value={nature}
            onChange={(next) => setNature(next as PartyNature)}
            options={(['person', 'organization'] as const).map((value) => ({
              code: value,
              label: t(`party.nature.${value}`),
            }))}
          />

          <LabeledField
            label={t('party.create.displayName')}
            error={errors.displayName}
          >
            <Input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoFocus
            />
          </LabeledField>
          <LabeledField label={t('party.detail.email')} error={errors.email}>
            <Input
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </LabeledField>
          <LabeledField label={t('party.column.phone')}>
            <PhoneInput
              value={phone1}
              onChange={setPhone1}
              countries={referentials?.countries ?? []}
              defaultCountry={officeCountry ?? undefined}
              t={t}
            />
          </LabeledField>
          <LabeledField label={t('party.detail.field.phoneSecondary')}>
            <PhoneInput
              value={phone2}
              onChange={setPhone2}
              countries={referentials?.countries ?? []}
              defaultCountry={officeCountry ?? undefined}
              t={t}
            />
          </LabeledField>
          <LabeledField
            label={t('party.column.country')}
            error={errors.country}
          >
            <CountrySelect
              countries={referentials?.countries ?? []}
              value={country || null}
              onChange={(value) => setCountry(value ?? '')}
              t={t}
            />
          </LabeledField>

          <Segmented
            label={t('party.create.scope')}
            value={officeScope}
            onChange={(next) =>
              setOfficeScope(next as 'all_offices' | 'restricted')
            }
            options={(['all_offices', 'restricted'] as const).map((value) => ({
              code: value,
              label: t(`party.create.scope.${value}`),
            }))}
          />

          {officeScope === 'restricted' ? (
            officeOptions.length > 0 ? (
              <>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-sm">
                    {t('party.create.offices')}
                  </span>
                  {errors.officeAccountIds ? (
                    <span className="text-destructive text-xs">
                      {errors.officeAccountIds}
                    </span>
                  ) : null}
                  <div className="flex flex-col gap-1">
                    {officeOptions.map((office) => (
                      <CheckboxField
                        key={office.value}
                        label={office.label}
                        checked={offices.includes(office.value)}
                        onChange={(checked) =>
                          toggleOffice(office.value, checked)
                        }
                      />
                    ))}
                  </div>
                </div>
                <LabeledField
                  label={t('party.create.relationType')}
                  error={errors.relationType}
                >
                  <RadioField
                    orientation="horizontal"
                    value={relationType}
                    onChange={(next) =>
                      setRelationType(next as 'customer' | 'supplier')
                    }
                    options={[
                      { code: 'customer', label: roleLabel('customer') },
                      { code: 'supplier', label: roleLabel('supplier') },
                    ]}
                  />
                </LabeledField>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                {t('party.create.noOffices')}
              </p>
            )
          ) : null}
        </SheetBody>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('party.detail.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={submit}
            disabled={create.isPending || !canSave}
          >
            {t('party.create.submit')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
