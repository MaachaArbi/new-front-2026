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
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { SelectField } from '@/shared/ui/select'
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('party.detail.editIdentity')}</SheetTitle>
          <SheetDescription>{t('party.detail.identityHint')}</SheetDescription>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-4">
          {isPerson ? (
            <>
              <LabeledInput
                label={t('party.detail.field.firstName')}
                value={firstName}
                onChange={setFirstName}
              />
              <LabeledInput
                label={t('party.detail.field.lastName')}
                value={lastName}
                onChange={setLastName}
              />
              <LabeledInput
                label={t('party.detail.field.employeeRef')}
                value={employeeReference}
                onChange={setEmployeeReference}
              />
            </>
          ) : (
            <>
              <LabeledInput
                label={t('party.detail.field.taxId')}
                value={taxId}
                onChange={setTaxId}
              />
              <LabeledInput
                label={t('party.detail.field.tradeRegister')}
                value={tradeRegister}
                onChange={setTradeRegister}
              />
              <SelectField
                label={t('party.detail.field.legalForm')}
                value={legalFormCode}
                onChange={setLegalFormCode}
                emptyLabel="—"
                options={legalForms}
              />
              <LabeledInput
                label={t('party.detail.field.website')}
                value={website}
                onChange={setWebsite}
              />
            </>
          )}
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
