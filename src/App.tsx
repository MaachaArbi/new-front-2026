import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './app/providers/theme-provider'
import { I18nProvider } from './app/providers/i18n-provider'
import { AppRoutes } from './app/router'
import { ShortcutProvider, ShortcutHelp } from '@/shared/keyboard'
import { CommandPalette } from '@/shared/command-palette'
import { NavigationShortcuts } from '@/shared/navigation/navigation-shortcuts'

// Point d'entrée applicatif. Le layout provisoire de S2 (couleurs brutes,
// chaînes en dur) est supprimé : le vrai layout-21 est monté par le routeur.
//
// Socle d'interactions (S5-UX) monté globalement, à l'intérieur du routeur (les
// raccourcis et la palette naviguent) : registre de raccourcis, palette Ctrl+K,
// aide « ? ». Ce sont les fondations d'ADR-F20, pas le layout — App.tsx n'est
// pas modifié dans src/shared/layout/.
export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter>
          <ShortcutProvider>
            <AppRoutes />
            <CommandPalette />
            <ShortcutHelp />
            <NavigationShortcuts />
          </ShortcutProvider>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  )
}
