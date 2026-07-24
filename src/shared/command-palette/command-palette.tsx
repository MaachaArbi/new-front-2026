/**
 * Coquille de la palette de commandes (ADR-F20.8).
 *
 * `Ctrl+K` / `Cmd+K` l'ouvre — « on ne navigue plus, on saute ». En S5-UX c'est
 * une **coquille** : ouverture/fermeture, navigation flèches + Entrée, et des
 * **actions statiques de démonstration** (aller à un module, basculer le thème,
 * changer de langue). Le remplissage réel (sauter à une réservation, à un client)
 * viendra avec les écrans métier et l'API.
 *
 * RTL : `cmdk` + le `DirectionProvider` (déjà monté) ouvrent la palette du bon
 * côté ; le `Dialog` sous-jacent utilise des propriétés logiques.
 * i18n : toutes les étiquettes via `useI18n`, dans les trois langues.
 *
 * L'ouverture par `Ctrl/Cmd+K` passe par le **registre de raccourcis** central
 * (position physique `KeyK`), pas par un écouteur local.
 */

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { Moon, Sun, Languages, ArrowRight } from 'lucide-react'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/shared/ui/command'
import { useShortcut } from '@/shared/keyboard'
import { useI18n } from '@/app/providers/i18n-provider'
import type { LanguageCode } from '@/shared/i18n/types'
import { LANGUAGES } from '@/shared/i18n/config'
import { MODULES } from '@/shared/layout/menu.config'

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()
  const { setTheme, resolvedTheme } = useTheme()
  const { t, currentLanguage, setLanguage } = useI18n()

  // Ouverture par Ctrl+K / Cmd+K via le registre central (position KeyK).
  // Deux définitions (ctrl et meta) pour couvrir Windows/Linux et macOS.
  useShortcut({
    id: 'palette.open.ctrl',
    sequence: [{ code: 'KeyK', ctrl: true }],
    descriptionKey: 'palette.shortcut.open',
    displayKeys: ['Ctrl', 'K'],
    allowInInput: true,
    handler: () => setOpen((v) => !v),
  })
  useShortcut({
    id: 'palette.open.meta',
    sequence: [{ code: 'KeyK', meta: true }],
    descriptionKey: 'palette.shortcut.open',
    displayKeys: ['⌘', 'K'],
    allowInInput: true,
    handler: () => setOpen((v) => !v),
  })

  const run = (action: () => void) => {
    setOpen(false)
    action()
  }

  const otherThemeLabel =
    resolvedTheme === 'dark' ? t('layout.theme.light') : t('layout.theme.dark')

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t('palette.placeholder')} />
      <CommandList>
        <CommandEmpty>{t('palette.empty')}</CommandEmpty>

        <CommandGroup heading={t('palette.group.navigate')}>
          {MODULES.map((module) => (
            <CommandItem
              key={module.id}
              value={`nav ${t(module.titleKey)}`}
              onSelect={() => run(() => navigate(module.path))}
            >
              <ArrowRight />
              {t(module.titleKey)}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading={t('palette.group.actions')}>
          <CommandItem
            value={`theme ${otherThemeLabel}`}
            onSelect={() =>
              run(() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'))
            }
          >
            {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
            {otherThemeLabel}
          </CommandItem>

          {/* Le nom de la langue est affiché dans sa propre graphie (auto-explicite,
              aucune interpolation — le `t` du provider n'en fait pas). */}
          {Object.values(LANGUAGES)
            .filter((lang) => lang.code !== currentLanguage)
            .map((lang) => (
              <CommandItem
                key={lang.code}
                value={`lang ${lang.name}`}
                onSelect={() =>
                  run(() => setLanguage(lang.code as LanguageCode))
                }
              >
                <Languages />
                <span>{`${t('palette.action.language')} · ${lang.name}`}</span>
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
