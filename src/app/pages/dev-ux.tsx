/**
 * Page de DÉMONSTRATION temporaire (S5-UX) — route `/_dev/ux`.
 *
 * Elle exerce les quatre fondations d'interaction : raccourcis clavier,
 * squelettes/estompage, convention panneau↔URL + modale, et rappelle la palette
 * `Ctrl+K` (montée globalement).
 *
 * TEMPORAIRE : à retirer quand les écrans métier existent (backlog). Aucune
 * donnée factice hors `src/shared/dev/`. Aucune règle métier.
 */

import * as React from 'react'
import { useI18n } from '@/app/providers/i18n-provider'
import { useShortcut, useShortcutScope } from '@/shared/keyboard'
import { useUrlPanel } from '@/shared/navigation/use-url-panel'
import { SkeletonCard, SkeletonRow, StaleContent } from '@/shared/feedback'
import { Button } from '@/shared/ui/button'
import { Kbd } from '@/shared/ui/kbd'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from '@/shared/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'

/** Portée active uniquement pendant que le panneau est ouvert (démo de portée). */
function PanelScope({ children }: { children: React.ReactNode }) {
  useShortcutScope('demo-panel')
  return <>{children}</>
}

export function DevUxPage() {
  const { t } = useI18n()
  const panel = useUrlPanel('open')
  const [createOpen, setCreateOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [stale, setStale] = React.useState(false)

  // — Fondation 1 : raccourcis (position physique event.code) —
  // Les séquences de navigation g→p / g→b sont enregistrées GLOBALEMENT
  // (NavigationShortcuts, montées dans App) : elles marchent depuis toutes les
  // pages. Ici, deux démos locales à cette page : touche N (modale) et, en
  // portée, touche S (fermer le panneau).
  useShortcut({
    id: 'demo.create',
    sequence: [{ code: 'KeyN' }],
    descriptionKey: 'shortcut.demo.create',
    displayKeys: ['N'],
    handler: () => setCreateOpen(true),
  })
  // Raccourci de PORTÉE : actif uniquement quand le panneau est ouvert.
  useShortcut({
    id: 'demo.panel.save',
    sequence: [{ code: 'KeyS' }],
    descriptionKey: 'shortcut.demo.save',
    displayKeys: ['S'],
    scope: 'demo-panel',
    handler: () => panel.close(),
  })

  const simulateLoad = () => {
    setLoading(true)
    window.setTimeout(() => setLoading(false), 1500)
  }
  const simulateRefresh = () => {
    setStale(true)
    window.setTimeout(() => setStale(false), 1500)
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-foreground text-xl font-semibold">
          {t('dev.ux.title')}
        </h1>
        <p className="text-muted-foreground text-sm">{t('dev.ux.subtitle')}</p>
      </header>

      {/* Fondation 1 — Raccourcis */}
      <section className="border-border flex flex-col gap-3 rounded-xl border p-5">
        <h2 className="text-foreground font-medium">
          {t('dev.ux.section.shortcuts')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('dev.ux.shortcuts.desc')}
        </p>
        <ul className="flex flex-col gap-2 text-sm">
          <li className="flex items-center justify-between">
            <span>{t('shortcut.demo.gotoParties')}</span>
            <span className="flex gap-1">
              <Kbd size="sm">G</Kbd>
              <Kbd size="sm">P</Kbd>
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span>{t('shortcut.demo.gotoBookings')}</span>
            <span className="flex gap-1">
              <Kbd size="sm">G</Kbd>
              <Kbd size="sm">B</Kbd>
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span>{t('shortcut.demo.create')}</span>
            <Kbd size="sm">N</Kbd>
          </li>
          <li className="flex items-center justify-between">
            <span>{t('shortcut.help.open')}</span>
            <Kbd size="sm">?</Kbd>
          </li>
        </ul>
      </section>

      {/* Fondation 2 — Squelettes & estompage */}
      <section className="border-border flex flex-col gap-3 rounded-xl border p-5">
        <h2 className="text-foreground font-medium">
          {t('dev.ux.section.skeletons')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('dev.ux.skeletons.desc')}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={simulateLoad}>
            {t('dev.ux.skeletons.reload')}
          </Button>
          <Button size="sm" variant="outline" onClick={simulateRefresh}>
            {t('dev.ux.skeletons.refresh')}
          </Button>
        </div>

        {loading ? (
          <SkeletonCard />
        ) : (
          <div className="border-border bg-muted/30 rounded-lg border p-4 text-sm">
            {t('dev.ux.skeletons.content')}
          </div>
        )}

        <StaleContent stale={stale} className="flex flex-col gap-2">
          <SkeletonRow columns={4} />
          <SkeletonRow columns={4} />
          <span className="text-muted-foreground text-xs">
            {stale
              ? t('dev.ux.skeletons.staleOn')
              : t('dev.ux.skeletons.staleOff')}
          </span>
        </StaleContent>
      </section>

      {/* Fondation 3 — Panneau ↔ URL + modale */}
      <section className="border-border flex flex-col gap-3 rounded-xl border p-5">
        <h2 className="text-foreground font-medium">
          {t('dev.ux.section.panels')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('dev.ux.panels.desc')}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => panel.open('demo-1')}>
            {t('dev.ux.panels.openPanel')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCreateOpen(true)}
          >
            {t('dev.ux.panels.openModal')}
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          {t('dev.ux.panels.urlHint')}
          {panel.value ? ` — ?open=${panel.value}` : ''}
        </p>
      </section>

      {/* Fondation 4 — Palette (montée globalement) */}
      <section className="border-border flex flex-col gap-3 rounded-xl border p-5">
        <h2 className="text-foreground font-medium">
          {t('dev.ux.section.palette')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('dev.ux.palette.desc')}
        </p>
        <span className="flex items-center gap-1 text-sm">
          <Kbd size="sm">Ctrl</Kbd>
          <Kbd size="sm">K</Kbd>
        </span>
      </section>

      {/* Panneau latéral synchronisé à l'URL (?open=<id>) */}
      <Sheet open={panel.isOpen} onOpenChange={panel.onOpenChange}>
        <SheetContent side="right">
          <PanelScope>
            <SheetHeader>
              <SheetTitle>{t('dev.ux.panels.sheetTitle')}</SheetTitle>
              <SheetDescription>
                {t('dev.ux.panels.sheetDesc')}
              </SheetDescription>
            </SheetHeader>
            <SheetBody className="flex flex-col gap-3">
              <p className="text-muted-foreground text-sm">
                {t('dev.ux.panels.currentId')} : {panel.value}
              </p>
              <p className="flex items-center gap-1 text-sm">
                {t('dev.ux.panels.scopedHint')}
                <Kbd size="sm">S</Kbd>
              </p>
            </SheetBody>
          </PanelScope>
        </SheetContent>
      </Sheet>

      {/* Modale de création rapide */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dev.ux.panels.modalTitle')}</DialogTitle>
            <DialogDescription>
              {t('dev.ux.panels.modalDesc')}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
