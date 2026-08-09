import { SelectField } from '@/shared/ui/select'
import type { ReferentialItem } from '@/shared/referentials'

/**
 * Sélecteur de devise **partagé**. Affiche « CODE — Label » (ex. « TND — Tunisian
 * Dinar ») : les libellés sont en anglais temporairement, le code se comprend dans les
 * trois langues. Option vide = `defaultLabel` (aucune devise → le tiers suit le défaut
 * de son bureau).
 *
 * Il s'appuie sur `SelectField` comme toutes les autres listes : c'était le dernier
 * `<select>` natif de l'application, et il se voyait — chevron du système, hauteur et
 * police différentes, au milieu d'un formulaire par ailleurs homogène.
 *
 * ⚠️ Une devise n'impose RIEN (le grand livre a pour clé compte+rôle+devise) : ne jamais
 * dire « ce client est en X », ne jamais filtrer là-dessus.
 */
export function CurrencySelect({
  currencies,
  value,
  onChange,
  defaultLabel,
  ariaLabel,
  disabled,
  className,
}: {
  currencies: readonly ReferentialItem[]
  value: string | null
  onChange: (value: string | null) => void
  defaultLabel: string
  ariaLabel?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <SelectField
      ariaLabel={ariaLabel ?? defaultLabel}
      value={value ?? ''}
      onChange={(next) => onChange(next === '' ? null : next)}
      emptyLabel={defaultLabel}
      disabled={disabled}
      triggerClassName={className}
      options={currencies.map((currency) => ({
        code: currency.code,
        label: `${currency.code.toUpperCase()} — ${currency.label}`,
      }))}
    />
  )
}
