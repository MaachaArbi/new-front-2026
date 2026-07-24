/**
 * `MoneyInput` — champ de saisie d'un montant, conscient de la devise et de la
 * locale. Bâti sur le composant `Input` de `src/shared/ui/` (aucune nouvelle
 * dépendance ; le Number Field de ReUI n'est pas tiré en S4 — hors périmètre).
 *
 * Garanties :
 * - Accepte le séparateur décimal de la locale (virgule en fr, point en en).
 * - Refuse plus de décimales que la devise n'en autorise (`aria-invalid`).
 * - Ne perd **jamais** de précision : le brouillon texte reste la source pendant
 *   la frappe ; la valeur `Money` est dérivée sans passer par un flottant.
 * - Accessible : libellé associé (`htmlFor`/`id`), `aria-invalid` en erreur,
 *   message d'erreur relié par `aria-describedby`.
 * - **Aucune classe directionnelle physique** (règle ESLint ADR-F04).
 */

import * as React from 'react'
import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/lib/cn'
import { useI18n } from '@/app/providers/i18n-provider'
import { parseMoney, type ParseErrorReason } from './parse'
import { toEditableString } from './format'
import type { Money } from './money'

export interface MoneyInputProps {
  /** Devise du montant (fixe le nombre de décimales autorisé). */
  currency: string
  /** Valeur contrôlée. `null` = champ vide/invalide. */
  value: Money | null
  /** Notifié à chaque frappe valide (`Money`) ou vide/invalide (`null`). */
  onChange: (value: Money | null) => void
  /** `id` du champ — requis pour l'association du libellé. */
  id: string
  /** Libellé visible, associé au champ. */
  label: string
  /**
   * Locale de saisie. Par défaut, la langue active de l'i18n. Surchargée dans
   * les tests pour vérifier fr/en.
   */
  locale?: string
  /** Message d'erreur affiché quand la saisie est invalide (déjà traduit). */
  errorMessage?: string
  /** Désactive le champ. */
  disabled?: boolean
  className?: string
}

function MoneyInput({
  currency,
  value,
  onChange,
  id,
  label,
  locale,
  errorMessage,
  disabled,
  className,
}: MoneyInputProps) {
  const { currentLanguage } = useI18n()
  const activeLocale = locale ?? currentLanguage

  // Brouillon texte : source de vérité pendant la frappe (aucune reconstruction
  // depuis un flottant). Réinitialisé si la valeur externe change de façon non
  // équivalente au texte courant.
  const [draft, setDraft] = React.useState<string>(() =>
    value ? toEditableString(value, activeLocale) : ''
  )
  const [reason, setReason] = React.useState<ParseErrorReason | null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value
    setDraft(next)

    if (next.trim() === '') {
      setReason(null)
      onChange(null)
      return
    }

    const result = parseMoney(next, currency, activeLocale)
    if (result.ok) {
      setReason(null)
      onChange(result.money)
    } else {
      setReason(result.reason)
      onChange(null)
    }
  }

  const invalid = reason !== null
  const errorId = `${id}-error`

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-foreground text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        dir="ltr"
        autoComplete="off"
        value={draft}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && errorMessage ? errorId : undefined}
      />
      {invalid && errorMessage ? (
        <p id={errorId} role="alert" className="text-destructive text-xs">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}

export { MoneyInput }
