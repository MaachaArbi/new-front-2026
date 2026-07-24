/**
 * Aide de découvrabilité (ADR-F20.5) : la touche « ? » ouvre la liste des
 * raccourcis actuellement actifs.
 *
 * Note d'exception assumée : « ? » est lié par **caractère** (`event.key`), pas
 * par position — c'est une affordance définie par son **glyphe**, pas une
 * action. Tous les raccourcis d'action restent, eux, positionnels (`event.code`).
 * Choix documenté dans `docs/decisions/2026-07-25-raccourcis-position-physique.md`.
 */

import * as React from 'react'
import { useI18n } from '@/app/providers/i18n-provider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'
import { Kbd } from '@/shared/ui/kbd'
import { useShortcut, useActiveShortcuts } from './shortcut-provider'
import type { ShortcutDefinition } from './types'

export function ShortcutHelp() {
  const { t } = useI18n()
  const [open, setOpen] = React.useState(false)
  const getActive = useActiveShortcuts()
  const [list, setList] = React.useState<ShortcutDefinition[]>([])

  // Raccourci « ? » (glyphe) — ouvre/bascule l'aide. Autorisé hors champ de saisie.
  useShortcut({
    id: 'help.open',
    sequence: [{ key: '?' }],
    descriptionKey: 'shortcut.help.open',
    displayKeys: ['?'],
    handler: () => setOpen((v) => !v),
  })

  // Rafraîchit la liste à l'ouverture (les raccourcis actifs dépendent du contexte).
  React.useEffect(() => {
    if (open) setList(getActive().filter((s) => s.id !== 'help.open'))
  }, [open, getActive])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('shortcut.help.title')}</DialogTitle>
          <DialogDescription>{t('shortcut.help.subtitle')}</DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-2">
          {list.map((shortcut) => (
            <li
              key={shortcut.id}
              className="flex items-center justify-between gap-4"
            >
              <span className="text-foreground text-sm">
                {t(shortcut.descriptionKey)}
              </span>
              <span className="flex items-center gap-1">
                {shortcut.displayKeys.map((key, index) => (
                  <Kbd key={`${shortcut.id}-${index}`} size="sm">
                    {key}
                  </Kbd>
                ))}
              </span>
            </li>
          ))}
          {list.length === 0 && (
            <li className="text-muted-foreground text-sm">
              {t('shortcut.help.empty')}
            </li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
