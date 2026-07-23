import { useTheme } from 'next-themes'
import { Languages, Moon, Sun } from 'lucide-react'
import { useI18n } from '@/app/providers/i18n-provider'
import { LANGUAGES } from '@/shared/i18n/config'
import type { LanguageCode } from '@/shared/i18n/types'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

// Réécrit de layout-21/components/header-toolbar.tsx : les actions de
// démonstration (Coffee, Reports, Add…) sont remplacées par les deux contrôles
// globaux réels — langue et thème. Tokens sémantiques, libellés i18n.
export function HeaderToolbar() {
  const { currentLanguage, setLanguage, t } = useI18n()
  const { resolvedTheme, setTheme } = useTheme()

  const isDark = resolvedTheme === 'dark'
  const current = LANGUAGES[currentLanguage]

  return (
    <nav className="flex items-center gap-2.5">
      {/* Sélecteur de langue */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Languages />
            <span>{current?.flag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {Object.values(LANGUAGES).map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code as LanguageCode)}
              data-active={lang.code === currentLanguage}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Bascule de thème */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            mode="icon"
            variant="outline"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={
              isDark ? t('layout.theme.light') : t('layout.theme.dark')
            }
          >
            {isDark ? <Sun /> : <Moon />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isDark ? t('layout.theme.light') : t('layout.theme.dark')}
        </TooltipContent>
      </Tooltip>
    </nav>
  )
}
