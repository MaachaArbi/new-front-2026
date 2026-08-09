import * as React from 'react'
import { Input } from '@/shared/ui/input'
import { SelectField } from '@/shared/ui/select'
import { FormField, FormModal } from '@/shared/ui/form-modal'
import type { ReferentialItem } from '@/shared/referentials'
import { usePutPersonIdentity, usePutOrganizationIdentity } from './queries'
import type {
  PartyNature,
  PartyOrganizationIdentity,
  PartyPersonIdentity,
} from './api'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

/** Vide → `null` : le back efface sur `null`, jamais sur `""`. */
function orNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/**
 * Édition de l'identité en **panneau latéral** (form par bloc). `PUT` = remplacement
 * TOTAL : on renvoie le bloc entier, `null` pour effacer. Les 2 codes comptables de
 * l'organisation font l'**aller-retour** (lus dans la fiche, renvoyés tels quels, non
 * affichés). Le formulaire se réinitialise à chaque ouverture depuis l'identité courante.
 */
export function PartyIdentitySheet({
  open,
  onOpenChange,
  publicId,
  nature,
  identity,
  legalForms,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  publicId: string
  nature: PartyNature | undefined
  identity: PartyPersonIdentity | PartyOrganizationIdentity | null
  legalForms: readonly ReferentialItem[]
  t: Translate
}) {
  const isPerson = nature === 'person'
  const putPerson = usePutPersonIdentity(publicId)
  const putOrg = usePutOrganizationIdentity(publicId)
  const pending = putPerson.isPending || putOrg.isPending

  const person = isPerson ? (identity as PartyPersonIdentity | null) : null
  const org = !isPerson ? (identity as PartyOrganizationIdentity | null) : null

  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [employeeReference, setEmployeeReference] = React.useState('')
  const [taxId, setTaxId] = React.useState('')
  const [tradeRegister, setTradeRegister] = React.useState('')
  const [legalFormCode, setLegalFormCode] = React.useState('')
  const [website, setWebsite] = React.useState('')

  // Réinitialise depuis l'identité courante à chaque OUVERTURE (pas à chaque refetch).
  React.useEffect(() => {
    if (!open) return
    setFirstName(person?.firstName ?? '')
    setLastName(person?.lastName ?? '')
    setEmployeeReference(person?.employeeReference ?? '')
    setTaxId(org?.taxId ?? '')
    setTradeRegister(org?.tradeRegister ?? '')
    setLegalFormCode(org?.legalFormCode ?? '')
    setWebsite(org?.website ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const save = () => {
    if (isPerson) {
      putPerson.mutate(
        {
          firstName: orNull(firstName),
          lastName: orNull(lastName),
          employeeReference: orNull(employeeReference),
        },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      putOrg.mutate(
        {
          taxId: orNull(taxId),
          tradeRegister: orNull(tradeRegister),
          legalFormCode: orNull(legalFormCode),
          website: orNull(website),
          // Aller-retour : on renvoie ce que la fiche a rendu, sans le comprendre.
          accountingAccountCode: org?.accountingAccountCode ?? null,
          thirdPartyAccountCode: org?.thirdPartyAccountCode ?? null,
        },
        { onSuccess: () => onOpenChange(false) }
      )
    }
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={t('party.detail.editIdentity')}
      description={t('party.detail.identityHint')}
      submitLabel={t('party.detail.save')}
      onSubmit={save}
      submitting={pending}
    >
      {isPerson ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <FormField label={t('party.detail.field.firstName')}>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </FormField>
            <FormField label={t('party.detail.field.lastName')}>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </FormField>
          </div>
          <FormField label={t('party.detail.field.employeeRef')}>
            <Input
              value={employeeReference}
              onChange={(e) => setEmployeeReference(e.target.value)}
            />
          </FormField>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <FormField label={t('party.detail.field.taxId')}>
              <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} />
            </FormField>
            <FormField label={t('party.detail.field.tradeRegister')}>
              <Input
                value={tradeRegister}
                onChange={(e) => setTradeRegister(e.target.value)}
              />
            </FormField>
          </div>
          <SelectField
            label={t('party.detail.field.legalForm')}
            value={legalFormCode}
            onChange={setLegalFormCode}
            emptyLabel="—"
            options={legalForms}
          />
          <FormField label={t('party.detail.field.website')}>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </FormField>
        </>
      )}
    </FormModal>
  )
}
