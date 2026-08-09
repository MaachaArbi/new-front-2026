import * as React from 'react'
import { Input } from '@/shared/ui/input'
import { SelectField } from '@/shared/ui/select'
import { CountrySelect } from '@/shared/ui/country-select'
import { CheckboxField } from '@/shared/ui/checkbox'
import { FormField, FormModal } from '@/shared/ui/form-modal'
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
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={
        isEdit ? t('party.detail.editAddress') : t('party.detail.addAddress')
      }
      submitLabel={t('party.detail.save')}
      onSubmit={save}
      submitting={pending}
      canSubmit={canSave}
    >
      <SelectField
        label={t('party.address.type')}
        value={addressType}
        onChange={setAddressType}
        options={addressTypes}
      />
      <FormField label={t('party.address.line1')}>
        <Input value={line1} onChange={(e) => setLine1(e.target.value)} />
      </FormField>
      <FormField label={t('party.address.line2')}>
        <Input value={line2} onChange={(e) => setLine2(e.target.value)} />
      </FormField>
      {/* Ville et code postal vont ensemble : deux champs courts sur une ligne. */}
      <div className="grid grid-cols-[1fr_9rem] gap-4">
        <FormField label={t('party.address.city')}>
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </FormField>
        <FormField label={t('party.address.postalCode')}>
          <Input
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
        </FormField>
      </div>
      <FormField label={t('party.column.country')}>
        <CountrySelect
          countries={countries}
          value={countryAlpha2}
          onChange={(next) => setCountryAlpha2(next ?? '')}
          t={t}
        />
      </FormField>
      <CheckboxField
        label={t('party.address.primary')}
        checked={isPrimary}
        onChange={setIsPrimary}
      />
    </FormModal>
  )
}
