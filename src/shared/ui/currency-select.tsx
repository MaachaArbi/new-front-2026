import { cn } from '@/shared/lib/cn'
import type { ReferentialItem } from '@/shared/referentials'

/**
 * Sélecteur de devise **partagé** — liste courte (référentiel `currencies`), donc `select`
 * natif. Affiche « CODE — Label » (ex. « TND — Tunisian Dinar ») : les libellés sont en
 * anglais temporairement, le code se comprend dans les trois langues. Option vide =
 * `defaultLabel` (aucune devise → le tiers suit le défaut de son bureau).
 *
 * ⚠️ Une devise n'impose RIEN (le grand livre a pour clé compte+rôle+devise) : ne jamais
 * dire « ce client est en X », ne jamais filtrer là-dessus.
 */
export function CurrencySelect({
  currencies,
  value,
  onChange,
  defaultLabel,
  id,
  disabled,
  className,
}: {
  currencies: readonly ReferentialItem[]
  value: string | null
  onChange: (value: string | null) => void
  defaultLabel: string
  id?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <select
      id={id}
      disabled={disabled}
      value={value ?? ''}
      onChange={(event) =>
        onChange(event.target.value === '' ? null : event.target.value)
      }
      className={cn(
        'border-input bg-background h-8.5 rounded-md border px-3 text-sm',
        className
      )}
    >
      <option value="">{defaultLabel}</option>
      {currencies.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.code.toUpperCase()} — {currency.label}
        </option>
      ))}
    </select>
  )
}
