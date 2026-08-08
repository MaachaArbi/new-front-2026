import * as React from 'react'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { Button } from '@/shared/ui/button'
import { CurrencySelect } from '@/shared/ui/currency-select'
import { ApiError } from '@/shared/api/errors'
import type { ReferentialItem } from '@/shared/referentials'
import { usePatchPartyAccount } from './queries'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

/** `{champ: message}` des 422 (ex. devise inconnue ou retirée du service). */
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
 * Édition des **devises par défaut** (affichage / facturation) — `PATCH`. Facultatives :
 * vide (`null`) efface → le tiers **suit le défaut de son bureau**. Elles n'imposent RIEN
 * (le grand livre a pour clé compte+rôle+devise) : aucun libellé ne dit « ce client est en X ».
 */
export function PartyCurrencySheet({
  open,
  onOpenChange,
  publicId,
  displayCurrencyCode,
  billingCurrencyCode,
  currencies,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  publicId: string
  displayCurrencyCode: string | null
  billingCurrencyCode: string | null
  currencies: readonly ReferentialItem[]
  t: Translate
}) {
  const patch = usePatchPartyAccount(publicId)
  const [display, setDisplay] = React.useState<string | null>(null)
  const [billing, setBilling] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setDisplay(displayCurrencyCode)
    setBilling(billingCurrencyCode)
    patch.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const errors = violationsOf(patch.error)
  const defaultLabel = t('party.detail.currencyDefault')

  const save = () => {
    patch.mutate(
      { displayCurrencyCode: display, billingCurrencyCode: billing },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('party.detail.editCurrencies')}</SheetTitle>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-4">
          <LabeledField
            label={t('party.detail.currencyDisplay')}
            hint={t('party.detail.currencyDisplayHint')}
            error={errors.displayCurrencyCode}
          >
            <CurrencySelect
              currencies={currencies}
              value={display}
              onChange={setDisplay}
              defaultLabel={defaultLabel}
            />
          </LabeledField>
          <LabeledField
            label={t('party.detail.currencyBilling')}
            hint={t('party.detail.currencyBillingHint')}
            error={errors.billingCurrencyCode}
          >
            <CurrencySelect
              currencies={currencies}
              value={billing}
              onChange={setBilling}
              defaultLabel={defaultLabel}
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
