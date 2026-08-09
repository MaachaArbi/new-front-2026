import * as React from 'react'
import { useIntl } from 'react-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

/**
 * CALENDRIER — grille d'un mois, sélection d'un jour.
 *
 * Écrit à la main plutôt qu'emprunté : la bibliothèque habituelle (react-day-picker)
 * apporte son propre système de langues (date-fns) à côté de `Intl`, que l'application
 * utilise déjà partout — deux sources pour les mêmes noms de mois, et l'arabe à
 * recâbler séparément. Ici, mois, jours et premier jour de semaine viennent tous de la
 * langue courante ; l'arabe et le RTL marchent sans rien ajouter.
 *
 * Les dates circulent en **ISO `AAAA-MM-JJ`**, jamais en `Date` : un `Date` porte une
 * heure et un fuseau, et « le 30 septembre » devient « le 29 à 23 h » dès qu'on
 * traverse un fuseau. Toute la manipulation se fait donc sur des composantes locales.
 */

/** `AAAA-MM-JJ` → composantes, sans passer par un fuseau horaire. */
function partsOf(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null
  const [, y, m, d] = match
  return { y: Number(y), m: Number(m) - 1, d: Number(d) }
}

function isoOf(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function todayIso(): string {
  const now = new Date()
  return isoOf(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * Premier jour de la semaine selon la langue : lundi en français, dimanche en anglais
 * américain. `weekInfo` n'existe pas dans tous les navigateurs — à défaut, lundi, qui
 * est la convention en Tunisie comme en France.
 */
function firstDayOfWeek(locale: string): number {
  try {
    const info = new Intl.Locale(locale) as Intl.Locale & {
      weekInfo?: { firstDay?: number }
      getWeekInfo?: () => { firstDay?: number }
    }
    const week = info.getWeekInfo?.() ?? info.weekInfo
    const first = week?.firstDay
    // La norme numérote lundi = 1 … dimanche = 7 ; `getDay()` numérote dimanche = 0.
    if (typeof first === 'number') return first === 7 ? 0 : first
  } catch {
    /* langue exotique : on garde le défaut */
  }
  return 1
}

export function Calendar({
  /** Jour sélectionné, en ISO. Chaîne vide = aucun. */
  value,
  onSelect,
  /** Bornes inclusives, en ISO — les jours hors bornes restent affichés mais inertes. */
  min,
  max,
  className,
}: {
  value: string
  onSelect: (iso: string) => void
  min?: string
  max?: string
  className?: string
}) {
  const intl = useIntl()
  const selected = partsOf(value)
  const today = todayIso()

  // Le mois affiché suit la valeur tant que l'utilisateur ne navigue pas ; à défaut,
  // le mois courant.
  const [cursor, setCursor] = React.useState(() => {
    const now = new Date()
    return {
      y: selected?.y ?? now.getFullYear(),
      m: selected?.m ?? now.getMonth(),
    }
  })
  React.useEffect(() => {
    if (selected) setCursor({ y: selected.y, m: selected.m })
    // On ne resynchronise que sur un changement de valeur venu de l'extérieur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const first = firstDayOfWeek(intl.locale)

  const monthLabel = intl.formatDate(new Date(cursor.y, cursor.m, 1), {
    month: 'long',
    year: 'numeric',
  })

  // Initiales des jours, dans l'ordre de la langue.
  const weekdays = React.useMemo(() => {
    const format = new Intl.DateTimeFormat(intl.locale, { weekday: 'short' })
    return Array.from({ length: 7 }, (_, i) => {
      // 2024-01-07 est un dimanche : point de départ connu, hors de tout fuseau utile.
      const day = new Date(2024, 0, 7 + ((first + i) % 7))
      return format.format(day)
    })
  }, [intl.locale, first])

  // Grille : on remonte au premier jour de semaine précédant le 1er du mois, puis on
  // avance de 42 cases — six semaines, la seule taille qui ne saute jamais.
  const cells = React.useMemo(() => {
    const firstOfMonth = new Date(cursor.y, cursor.m, 1)
    const shift = (firstOfMonth.getDay() - first + 7) % 7
    return Array.from({ length: 42 }, (_, i) => {
      const day = new Date(cursor.y, cursor.m, 1 - shift + i)
      return {
        iso: isoOf(day.getFullYear(), day.getMonth(), day.getDate()),
        label: day.getDate(),
        outside: day.getMonth() !== cursor.m,
      }
    })
  }, [cursor, first])

  const move = (delta: number) =>
    setCursor((c) => {
      const next = new Date(c.y, c.m + delta, 1)
      return { y: next.getFullYear(), m: next.getMonth() }
    })

  const disabled = (iso: string) =>
    (min !== undefined && min !== '' && iso < min) ||
    (max !== undefined && max !== '' && iso > max)

  return (
    <div className={cn('w-[17rem] p-2', className)}>
      <div className="mb-1 flex items-center justify-between">
        <button
          type="button"
          onClick={() => move(-1)}
          className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-7 items-center justify-center rounded-md"
          aria-label={intl.formatMessage({ id: 'calendar.previousMonth' })}
        >
          {/* Propriétés logiques impossibles sur une icône : on la retourne en RTL. */}
          <ChevronLeft className="size-4 rtl:rotate-180" />
        </button>
        <span className="text-foreground text-2sm font-semibold capitalize">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={() => move(1)}
          className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-7 items-center justify-center rounded-md"
          aria-label={intl.formatMessage({ id: 'calendar.nextMonth' })}
        >
          <ChevronRight className="size-4 rtl:rotate-180" />
        </button>
      </div>

      <div className="grid grid-cols-7">
        {weekdays.map((day) => (
          <div
            key={day}
            className="text-muted-foreground text-2xs flex h-7 items-center justify-center font-medium"
          >
            {day}
          </div>
        ))}
        {cells.map((cell) => {
          const isSelected = cell.iso === value
          const isToday = cell.iso === today
          const off = disabled(cell.iso)
          return (
            <button
              key={cell.iso}
              type="button"
              disabled={off}
              onClick={() => onSelect(cell.iso)}
              aria-current={isToday ? 'date' : undefined}
              className={cn(
                'text-2sm relative flex h-8 items-center justify-center rounded-md tabular-nums transition-colors',
                off && 'text-muted-foreground/40 cursor-not-allowed',
                !off && cell.outside && 'text-muted-foreground/60',
                !off && !cell.outside && 'text-foreground',
                !off && !isSelected && 'hover:bg-accent',
                isSelected && 'bg-primary hover:bg-primary text-white'
              )}
            >
              {cell.label}
              {/* Aujourd'hui : un point sous le chiffre — un cerclage se confondrait
                  avec la sélection. */}
              {isToday && !isSelected ? (
                <span className="bg-primary absolute bottom-1 size-1 rounded-full" />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
