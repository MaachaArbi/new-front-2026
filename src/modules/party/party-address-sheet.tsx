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
import { CountrySelect } from '@/shared/ui/country-select'
import type { ReferentialItem } from '@/shared/referentials'
import { usePartyAddressMutations } from './queries'
import type { PartyAddress } from './api'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

function orNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted-foreground text-sm">{label}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

/**
 * Ajout / édition d'une adresse en panneau latéral. `addressType` + `line1` requis ;
 * le reste facultatif (vide → `null`). Marquer « principale » déclasse l'ancienne du
 * même type (règle back). Le pays est un code alpha-2 (référentiel). Les adresses
 * vivent dans la fiche → la mutation invalide la fiche.
 */
export function PartyAddressSheet({
  open,
  onOpenChange,
  publicId,
  address,
  addressTypes,
  countries,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  publicId: string
  address: PartyAddress | null
  addressTypes: readonly ReferentialItem[]
  countries: readonly ReferentialItem[]
  t: Translate
}) {
  const isEdit = address != null
  const { create, update } = usePartyAddressMutations(publicId)
  const pending = create.isPending || update.isPending

  const [addressType, setAddressType] = React.useState('')
  const [line1, setLine1] = React.useState('')
  const [line2, setLine2] = React.useState('')
  const [city, setCity] = React.useState('')
  const [postalCode, setPostalCode] = React.useState('')
  const [countryAlpha2, setCountryAlpha2] = React.useState('')
  const [isPrimary, setIsPrimary] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setAddressType(address?.addressType ?? addressTypes[0]?.code ?? '')
    setLine1(address?.line1 ?? '')
    setLine2(address?.line2 ?? '')
    setCity(address?.city ?? '')
    setPostalCode(address?.postalCode ?? '')
    setCountryAlpha2(address?.countryAlpha2 ?? '')
    setIsPrimary(address?.isPrimary ?? false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const canSave = addressType !== '' && line1.trim() !== ''

  const save = () => {
    const input = {
      addressType,
      line1: line1.trim(),
      line2: orNull(line2),
      city: orNull(city),
      postalCode: orNull(postalCode),
      countryAlpha2: orNull(countryAlpha2),
      isPrimary,
    }
    if (isEdit && address) {
      update.mutate(
        { addressPublicId: address.publicId, input },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      create.mutate(input, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isEdit
              ? t('party.detail.editAddress')
              : t('party.detail.addAddress')}
          </SheetTitle>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-4">
          <SelectField
            label={t('party.address.type')}
            value={addressType}
            onChange={setAddressType}
            options={addressTypes}
          />
          <LabeledInput
            label={t('party.address.line1')}
            value={line1}
            onChange={setLine1}
          />
          <LabeledInput
            label={t('party.address.line2')}
            value={line2}
            onChange={setLine2}
          />
          <LabeledInput
            label={t('party.address.city')}
            value={city}
            onChange={setCity}
          />
          <LabeledInput
            label={t('party.address.postalCode')}
            value={postalCode}
            onChange={setPostalCode}
          />
          <label className="flex flex-col gap-1">
            <span className="text-muted-foreground text-sm">
              {t('party.column.country')}
            </span>
            <CountrySelect
              countries={countries}
              value={countryAlpha2}
              onChange={(next) => setCountryAlpha2(next ?? '')}
              t={t}
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(event) => setIsPrimary(event.target.checked)}
              className="size-4"
            />
            <span className="text-foreground text-sm">
              {t('party.address.primary')}
            </span>
          </label>
        </SheetBody>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('party.detail.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={save}
            disabled={pending || !canSave}
          >
            {t('party.detail.save')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
