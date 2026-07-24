/**
 * Page PÉDAGOGIQUE des raccourcis clavier (S-design) — route `/_dev/shortcuts`.
 *
 * Elle rend visible ce que le socle clavier (S5-UX, `src/shared/keyboard/`)
 * permet, pour comprendre le mécanisme. Les raccourcis affichés sont **extraits
 * du registre en direct** (`useActiveShortcuts`), pas listés à la main. Une zone
 * d'essai montre côte à côte `event.code` (position physique) et `event.key`
 * (caractère) : en changeant de disposition clavier (fr ↔ ar), le `code` ne
 * bouge pas, la `key` change — c'est pourquoi les raccourcis se basent sur la
 * position (ADR-F20.5).
 *
 * TEMPORAIRE (préfixe `_dev`) : à retirer avec les écrans métier (backlog).
 * Tokens uniquement, i18n, RTL, aucun composant hors `src/shared/ui/`.
 */

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@/app/providers/i18n-provider'
import {
  useShortcut,
  useActiveShortcuts,
  type ShortcutDefinition,
} from '@/shared/keyboard'
import { Kbd } from '@/shared/ui/kbd'

/** Une ligne de raccourci : ses touches (Kbd) + sa description traduite. */
function ShortcutRow({ shortcut }: { shortcut: ShortcutDefinition }) {
  const { t } = useI18n()
  const isSequence = shortcut.sequence.length === 2
  return (
    <li className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-foreground text-sm">
        {t(shortcut.descriptionKey)}
      </span>
      <span className="flex shrink-0 items-center gap-1">
        {shortcut.displayKeys.map((key, index) => (
          <React.Fragment key={`${shortcut.id}-${index}`}>
            {isSequence && index > 0 && (
              <span className="text-muted-foreground text-xs">
                {t('dev.shortcuts.then')}
              </span>
            )}
            <Kbd size="sm">{key}</Kbd>
          </React.Fragment>
        ))}
      </span>
    </li>
  )
}

/** Zone d'essai : capture une frappe et affiche code + key sans déclencher de raccourci. */
function KeyTester() {
  const { t } = useI18n()
  const ref = React.useRef<HTMLDivElement>(null)
  const [captured, setCaptured] = React.useState<{
    code: string
    key: string
  } | null>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    // Écouteur natif sur l'élément (phase de propagation montante) :
    // stopPropagation empêche l'événement d'atteindre l'écouteur global du socle
    // → la zone d'essai n'ouvre pas la palette ni l'aide, elle se contente
    // d'afficher code + key.
    const handler = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        el.blur()
        return
      }
      event.preventDefault()
      event.stopPropagation()
      setCaptured({ code: event.code, key: event.key })
    }
    el.addEventListener('keydown', handler)
    return () => el.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm">
        {t('dev.shortcuts.tester.instruction')}
      </p>
      <div
        ref={ref}
        tabIndex={0}
        role="button"
        aria-label={t('dev.shortcuts.tester.instruction')}
        className="border-border bg-muted/30 focus-visible:border-ring focus-visible:ring-ring/30 flex min-h-24 cursor-text flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-6 text-center outline-none focus-visible:ring-[3px]"
      >
        {captured ? (
          <div className="flex flex-wrap items-stretch justify-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-muted-foreground text-xs">
                {t('dev.shortcuts.tester.code')}
              </span>
              <Kbd>{captured.code}</Kbd>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-muted-foreground text-xs">
                {t('dev.shortcuts.tester.key')}
              </span>
              <Kbd>{captured.key === ' ' ? 'Space' : captured.key}</Kbd>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">
            {t('dev.shortcuts.tester.empty')}
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-xs">
        {t('dev.shortcuts.tester.escHint')}
      </p>
    </div>
  )
}

export function DevShortcutsPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const getActive = useActiveShortcuts()
  const [shortcuts, setShortcuts] = React.useState<ShortcutDefinition[]>([])

  // Séquences de démonstration (façon Gmail), enregistrées via le socle réel :
  // elles fonctionnent et apparaissent dans la liste extraite du registre.
  useShortcut({
    id: 'shortcuts-page.goto.parties',
    sequence: [{ code: 'KeyG' }, { code: 'KeyP' }],
    descriptionKey: 'shortcut.demo.gotoParties',
    displayKeys: ['G', 'P'],
    handler: () => navigate('/parties'),
  })
  useShortcut({
    id: 'shortcuts-page.goto.bookings',
    sequence: [{ code: 'KeyG' }, { code: 'KeyB' }],
    descriptionKey: 'shortcut.demo.gotoBookings',
    displayKeys: ['G', 'B'],
    handler: () => navigate('/bookings'),
  })

  // Extraction du registre après stabilisation des effets de montage (les
  // raccourcis globaux — palette, aide — sont enregistrés par des composants
  // frères ; un rAF garantit qu'ils sont pris en compte).
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setShortcuts(getActive()))
    return () => cancelAnimationFrame(id)
  }, [getActive])

  const sequences = shortcuts.filter((s) => s.sequence.length === 2)
  const singles = shortcuts.filter((s) => s.sequence.length === 1)

  return (
    <div className="flex flex-col gap-6 py-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-foreground text-xl font-semibold">
          {t('dev.shortcuts.title')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t('dev.shortcuts.subtitle')}
        </p>
      </header>

      {/* Note pédagogique : pourquoi la position physique */}
      <section className="border-primary/30 bg-primary/5 rounded-xl border p-5">
        <h2 className="text-foreground mb-1 font-medium">
          {t('dev.shortcuts.why.title')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('dev.shortcuts.why.body')}
        </p>
      </section>

      {/* Raccourcis globaux (une touche) */}
      <section className="border-border flex flex-col gap-1 rounded-xl border p-5">
        <h2 className="text-foreground mb-2 font-medium">
          {t('dev.shortcuts.section.global')}
        </h2>
        <ul className="divide-border divide-y">
          {singles.length > 0 ? (
            singles.map((s) => <ShortcutRow key={s.id} shortcut={s} />)
          ) : (
            <li className="text-muted-foreground py-1.5 text-sm">
              {t('dev.shortcuts.empty')}
            </li>
          )}
        </ul>
      </section>

      {/* Séquences à deux touches */}
      <section className="border-border flex flex-col gap-1 rounded-xl border p-5">
        <h2 className="text-foreground font-medium">
          {t('dev.shortcuts.section.sequences')}
        </h2>
        <p className="text-muted-foreground mb-2 text-sm">
          {t('dev.shortcuts.sequences.hint')}
        </p>
        <ul className="divide-border divide-y">
          {sequences.length > 0 ? (
            sequences.map((s) => <ShortcutRow key={s.id} shortcut={s} />)
          ) : (
            <li className="text-muted-foreground py-1.5 text-sm">
              {t('dev.shortcuts.empty')}
            </li>
          )}
        </ul>
      </section>

      {/* Zone d'essai : code vs key */}
      <section className="border-border flex flex-col gap-3 rounded-xl border p-5">
        <h2 className="text-foreground font-medium">
          {t('dev.shortcuts.section.tester')}
        </h2>
        <KeyTester />
      </section>
    </div>
  )
}
