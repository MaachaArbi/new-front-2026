import * as React from 'react'
import { useParams } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { FileCode2, Wrench } from 'lucide-react'
import { CATALOG } from './catalog'
import { ButtonShowcase } from './showcases/button-showcase'
import { CalendarShowcase } from './showcases/calendar-showcase'
import { InputShowcase } from './showcases/input-showcase'
import { PaletteShowcase } from './showcases/palette-showcase'

/**
 * Une page par composant : sa source, ses écarts, puis tous ses états.
 *
 * L'en-tête n'est pas décoratif. Il dit **d'où vient** le composant et **ce qu'on a
 * changé** — les deux questions qui reviennent six mois plus tard, quand personne ne
 * se souvient si une valeur était un choix ou un héritage.
 */
const SHOWCASES: Record<string, React.ComponentType> = {
  button: ButtonShowcase,
  palette: PaletteShowcase,
  input: InputShowcase,
  calendar: CalendarShowcase,
}

export function DesignPage() {
  const intl = useIntl()
  const { componentId } = useParams<{ componentId: string }>()
  const t = (id: string, values?: Record<string, string>) =>
    intl.formatMessage({ id }, values)

  const entry = CATALOG.flatMap((group) => group.entries).find(
    (item) => item.id === componentId
  )
  const Showcase = componentId ? SHOWCASES[componentId] : undefined

  if (!entry) {
    return (
      <div className="flex flex-col gap-2 px-4 lg:px-7.5">
        <h1 className="text-foreground text-xl font-semibold">
          {t('design.title')}
        </h1>
        <p className="text-muted-foreground text-2sm max-w-prose">
          {t('design.intro')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-7.5">
      <header className="flex flex-col gap-2">
        <h1 className="text-foreground text-xl font-semibold">
          {t(entry.titleKey)}
        </h1>
        <div className="flex flex-col gap-1">
          {entry.source ? (
            <span className="text-muted-foreground flex items-center gap-2 text-xs">
              <FileCode2 className="size-3.5 shrink-0" />
              <span dir="ltr" className="font-mono [unicode-bidi:isolate]">
                {t('design.source', { path: entry.source })}
              </span>
            </span>
          ) : null}
          {entry.adapted ? (
            <span className="text-muted-foreground flex items-center gap-2 text-xs">
              <Wrench className="size-3.5 shrink-0" />
              {t('design.adapted', { what: entry.adapted })}
            </span>
          ) : null}
        </div>
      </header>

      {Showcase ? (
        <Showcase />
      ) : (
        <div className="border-border text-muted-foreground text-2sm flex min-h-48 items-center justify-center rounded-xl border border-dashed">
          {t('design.status.pending')}
        </div>
      )}
    </div>
  )
}

/** Bloc d'états : un titre, une remarque facultative, et les exemples. */
export function ShowcaseSection({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="border-border flex flex-col overflow-hidden rounded-xl border">
      <div className="border-border bg-muted/40 flex items-baseline justify-between gap-3 border-b px-4 py-2.5">
        <span className="text-foreground text-2sm font-semibold">{title}</span>
        {hint ? (
          <span className="text-muted-foreground text-xs">{hint}</span>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3 p-4">{children}</div>
    </section>
  )
}

/** Un exemple, avec son étiquette dessous — on doit pouvoir nommer ce qu'on voit. */
export function ShowcaseItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      {children}
      <span className="text-muted-foreground text-2xs">{label}</span>
    </div>
  )
}
