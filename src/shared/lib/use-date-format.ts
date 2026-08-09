import { useIntl } from 'react-intl'

/**
 * Formatage des dates — un seul endroit pour toute l'application.
 *
 * Pourquoi : le même `intl.formatDate(iso, { day, month, year })` était réécrit dans
 * chaque écran, et plusieurs endroits affichaient carrément l'ISO brut (`2026-09-30`).
 * Une date lisible n'est pas un détail dans un ERP : c'est ce que l'agent compare.
 *
 * `day` reste le format par défaut : « 30 septembre 2026 » — sans ambiguïté entre
 * les conventions jour/mois et mois/jour, et correct en arabe comme en anglais.
 */
export function useDateFormat() {
  const intl = useIntl()

  const day = (iso: string | null | undefined): string =>
    iso
      ? intl.formatDate(iso, { day: 'numeric', month: 'long', year: 'numeric' })
      : ''

  /** Compact, pour les listes denses : « 30 sept. ». */
  const short = (iso: string | null | undefined): string =>
    iso ? intl.formatDate(iso, { day: 'numeric', month: 'short' }) : ''

  const time = (iso: string | null | undefined): string =>
    iso ? intl.formatDate(iso, { hour: '2-digit', minute: '2-digit' }) : ''

  /** « il y a 2 heures » — plus parlant qu'une date pour un événement récent. */
  const relative = (iso: string | null | undefined): string => {
    if (!iso) return ''
    const diffMs = new Date(iso).getTime() - Date.now()
    const abs = Math.abs(diffMs)
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
      ['year', 31_536_000_000],
      ['month', 2_592_000_000],
      ['day', 86_400_000],
      ['hour', 3_600_000],
      ['minute', 60_000],
    ]
    for (const [unit, ms] of units) {
      if (abs >= ms) return intl.formatRelativeTime(Math.round(diffMs / ms), unit)
    }
    return intl.formatRelativeTime(0, 'minute')
  }

  return { day, short, time, relative }
}
