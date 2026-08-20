import * as React from 'react'
import { useIntl } from 'react-intl'
import { ShowcaseSection } from '../design-page'

/**
 * LA PALETTE, telle qu'elle est RÉELLEMENT appliquée.
 *
 * Les valeurs affichées ne sont pas recopiées de la planche : elles sont lues sur
 * `document.documentElement` au moment du rendu. C'est la seule façon d'attraper un
 * jeton qui ne serait pas raccordé — une case qui reste vide ou noire ici est un
 * jeton mort, et on le voit tout de suite plutôt que six écrans plus tard.
 *
 * Conséquence : bascule le thème et les valeurs changent sous tes yeux. C'est aussi
 * le test du mode sombre.
 */

/** Lit les variables sur la racine et se relit quand le thème change. */
function useResolvedTokens(names: readonly string[]): Record<string, string> {
  const [values, setValues] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    const read = () => {
      const style = getComputedStyle(document.documentElement)
      const next: Record<string, string> = {}
      for (const name of names) {
        next[name] = style.getPropertyValue(name).trim()
      }
      setValues(next)
    }
    read()
    // `next-themes` remplace l'attribut sur <html> ; on relit à ce moment-là.
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-sidebar'],
    })
    return () => observer.disconnect()
  }, [names])

  return values
}

const RAMPS: readonly {
  readonly family: string
  readonly stops: readonly number[]
}[] = [
  {
    family: 'blue',
    stops: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  },
  {
    family: 'neutral',
    stops: [0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  },
  { family: 'green', stops: [50, 100, 200, 500, 600, 700, 800, 900] },
  { family: 'amber', stops: [50, 100, 200, 500, 600, 700, 800, 900] },
  { family: 'red', stops: [50, 100, 200, 500, 600, 700, 800, 900] },
  { family: 'sky', stops: [50, 100, 200, 600, 700, 800, 900] },
]

const RAMP_TOKENS = RAMPS.flatMap((ramp) =>
  ramp.stops.map((stop) => `--${ramp.family}-${stop}`)
)

const ROLE_GROUPS: readonly {
  readonly label: string
  readonly tokens: readonly string[]
}[] = [
  {
    label: 'Surfaces',
    tokens: ['--surface-0', '--surface-1', '--surface-2', '--surface-3'],
  },
  {
    label: 'Texte',
    tokens: [
      '--text-primary',
      '--text-secondary',
      '--text-muted',
      '--text-disabled',
      '--text-inverse',
      '--text-link',
    ],
  },
  {
    label: 'Bordures',
    tokens: [
      '--border',
      '--border-strong',
      '--border-stronger',
      '--border-disabled',
    ],
  },
  {
    label: 'Primaire',
    tokens: [
      '--fill-primary',
      '--fill-primary-hover',
      '--fill-primary-active',
      '--on-primary',
      '--bg-primary',
      '--border-primary',
    ],
  },
  {
    label: 'Succès',
    tokens: [
      '--fill-success',
      '--bg-success',
      '--border-success',
      '--text-success',
    ],
  },
  {
    label: 'Alerte',
    tokens: [
      '--fill-warning',
      '--bg-warning',
      '--border-warning',
      '--text-warning',
    ],
  },
  {
    label: 'Danger',
    tokens: [
      '--fill-danger',
      '--fill-danger-hover',
      '--fill-danger-active',
      '--bg-danger',
      '--border-danger',
      '--text-danger',
    ],
  },
  {
    label: 'Info',
    tokens: ['--fill-info', '--bg-info', '--border-info', '--text-info'],
  },
  {
    label: 'Contrôles neutres',
    tokens: [
      '--fill-secondary',
      '--fill-secondary-hover',
      '--fill-ghost-hover',
      '--fill-ghost-active',
      '--fill-disabled',
    ],
  },
  {
    label: 'Barre latérale',
    tokens: [
      '--sidebar',
      '--sidebar-foreground',
      '--sidebar-muted',
      '--sidebar-border',
    ],
  },
]

const ROLE_TOKENS = ROLE_GROUPS.flatMap((group) => group.tokens)
const ALL_TOKENS = [...RAMP_TOKENS, ...ROLE_TOKENS]

/** Une pastille : la couleur, son nom, sa valeur résolue. */
function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span
        className="border-border h-10 w-full rounded-md border"
        style={{ background: `var(${name})` }}
      />
      <span className="text-ink text-2xs truncate font-medium">
        {name.replace(/^--/, '')}
      </span>
      <span
        dir="ltr"
        className="text-ink-muted text-2xs truncate font-mono uppercase [unicode-bidi:isolate]"
      >
        {value || '—'}
      </span>
    </div>
  )
}

export function PaletteShowcase() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })
  const resolved = useResolvedTokens(ALL_TOKENS)

  return (
    <div className="flex flex-col gap-4">
      <ShowcaseSection
        title={t('design.palette.ramps')}
        hint={t('design.palette.rampsHint')}
      >
        <div className="flex w-full flex-col gap-4">
          {RAMPS.map((ramp) => (
            <div key={ramp.family} className="flex flex-col gap-1.5">
              <span className="text-ink-secondary text-2xs font-semibold tracking-wider uppercase">
                {ramp.family}
              </span>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-13">
                {ramp.stops.map((stop) => {
                  const name = `--${ramp.family}-${stop}`
                  return (
                    <Swatch
                      key={name}
                      name={name}
                      value={resolved[name] ?? ''}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.palette.roles')}
        hint={t('design.palette.rolesHint')}
      >
        <div className="flex w-full flex-col gap-4">
          {ROLE_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1.5">
              <span className="text-ink-secondary text-2xs font-semibold tracking-wider uppercase">
                {group.label}
              </span>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {group.tokens.map((name) => (
                  <Swatch key={name} name={name} value={resolved[name] ?? ''} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title={t('design.palette.focus')}
        hint={t('design.palette.focusHint')}
      >
        <div className="flex flex-wrap items-center gap-6 py-2">
          <span className="border-border-strong bg-fill-secondary text-ink text-2sm inline-flex h-(--ui-row) items-center rounded-md border px-3.5 [box-shadow:var(--focus-ring)]">
            --focus-ring
          </span>
          <span className="bg-fill-danger text-on-danger text-2sm inline-flex h-(--ui-row) items-center rounded-md px-3.5 [box-shadow:var(--focus-ring-danger)]">
            --focus-ring-danger
          </span>
        </div>
      </ShowcaseSection>
    </div>
  )
}
