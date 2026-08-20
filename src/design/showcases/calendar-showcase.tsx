import * as React from 'react'
import { useIntl } from 'react-intl'
import { ar, enUS, fr } from 'date-fns/locale'
import type { Locale } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { Calendar } from '@/shared/ui/calendar'
import { ShowcaseItem, ShowcaseSection } from '../design-page'

/**
 * Le calendrier, tiré du REGISTRE ReUI (`npx shadcn add @reui/date-selector`) et non
 * du paquet Metronic local — où il existe aussi, mais dans une version plus ancienne
 * qui ne retourne PAS ses flèches en arabe.
 *
 * Ce qu'on lui passe ici, et qui ne vient pas du composant :
 *   · la LOCALE date-fns, sinon les mois et les jours restent en anglais ;
 *   · `dir`, pour que la grille et les flèches suivent le sens de lecture.
 * Le reste — couleurs, focus, survol — n'a demandé aucune retouche : il consomme
 * les noms que la couche de raccordement alimente déjà.
 */
const LOCALES: Record<string, Locale> = { fr, en: enUS, ar }

export function CalendarShowcase() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })
  const locale = LOCALES[intl.locale] ?? fr
  const dir = intl.locale === 'ar' ? 'rtl' : 'ltr'

  const [single, setSingle] = React.useState<Date | undefined>(
    new Date(2026, 7, 20)
  )
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 7, 12),
    to: new Date(2026, 7, 19),
  })

  return (
    <div className="flex flex-col gap-4">
      <ShowcaseSection
        title={t('design.calendar.modes')}
        hint={t('design.calendar.localeHint')}
      >
        <ShowcaseItem label={t('design.calendar.single')}>
          <div className="border-border rounded-lg border">
            <Calendar
              mode="single"
              locale={locale}
              dir={dir}
              selected={single}
              onSelect={setSingle}
              defaultMonth={new Date(2026, 7)}
            />
          </div>
        </ShowcaseItem>

        <ShowcaseItem label={t('design.calendar.range')}>
          <div className="border-border rounded-lg border">
            <Calendar
              mode="range"
              locale={locale}
              dir={dir}
              selected={range}
              onSelect={setRange}
              defaultMonth={new Date(2026, 7)}
            />
          </div>
        </ShowcaseItem>

        <ShowcaseItem label={t('design.calendar.dropdown')}>
          <div className="border-border rounded-lg border">
            <Calendar
              mode="single"
              captionLayout="dropdown"
              locale={locale}
              dir={dir}
              defaultMonth={new Date(2026, 7)}
              startMonth={new Date(2020, 0)}
              endMonth={new Date(2030, 11)}
            />
          </div>
        </ShowcaseItem>
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.calendar.bounds')}
        hint={t('design.calendar.boundsHint')}
      >
        <ShowcaseItem label={t('design.calendar.pastDisabled')}>
          <div className="border-border rounded-lg border">
            <Calendar
              mode="single"
              locale={locale}
              dir={dir}
              defaultMonth={new Date(2026, 7)}
              disabled={{ before: new Date(2026, 7, 20) }}
            />
          </div>
        </ShowcaseItem>
      </ShowcaseSection>
    </div>
  )
}
