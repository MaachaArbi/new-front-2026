/**
 * Montants en **unités mineures**, manipulés en **chaîne** (jamais `Number` : un solde peut
 * dépasser la précision d'un float). Le nombre de décimales dépend de la devise — le TND en a
 * **3** (millimes), l'EUR **2** — et vient d'`Intl` (ICU du navigateur), sans dépendance.
 */

export function currencyDecimals(code: string): number {
  try {
    return (
      new Intl.NumberFormat('en', {
        style: 'currency',
        currency: code,
      }).resolvedOptions().maximumFractionDigits ?? 2
    )
  } catch {
    return 2
  }
}

/** « 1000500 » (TND) → « 1 000,500 ». Groupe les milliers, insère la virgule — en pur texte. */
export function formatMinor(amountMinor: string, code: string): string {
  const decimals = currencyDecimals(code)
  const negative = amountMinor.trim().startsWith('-')
  const digits = amountMinor.replace(/\D/g, '') || '0'
  const padded = digits.padStart(decimals + 1, '0')
  const intPart = padded.slice(0, padded.length - decimals)
  const fracPart = decimals > 0 ? padded.slice(padded.length - decimals) : ''
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${negative ? '-' : ''}${grouped}${fracPart ? ',' + fracPart : ''}`
}

/**
 * Saisie utilisateur (unités **majeures**, ex. « 1000,5 ») → unités mineures en chaîne,
 * selon les décimales de la devise (TND : « 1000,5 » → « 1000500 »). `null` si invalide.
 */
export function majorToMinor(input: string, code: string): string | null {
  const decimals = currencyDecimals(code)
  const cleaned = input.trim().replace(/\s/g, '').replace(',', '.')
  if (cleaned === '' || !/^\d*\.?\d*$/.test(cleaned)) return null
  const [intRaw, fracRaw = ''] = cleaned.split('.')
  const intPart = intRaw === '' ? '0' : intRaw
  const frac = (fracRaw + '0'.repeat(decimals)).slice(0, decimals)
  const minor = (intPart + frac).replace(/^0+(?=\d)/, '')
  return minor === '' ? '0' : minor
}
