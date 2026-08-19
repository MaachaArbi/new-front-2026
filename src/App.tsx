import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './app/providers/theme-provider'
import { DisplayPreferencesProvider } from './app/providers/display-preferences'
import { I18nProvider, useI18n } from './app/providers/i18n-provider'
import { QueryProvider } from './app/providers/query-provider'
import { AuthProvider, useAuth } from './app/providers/auth-provider'
import { AppRoutes } from './app/router'
import { LoginPage } from './app/pages/login'
import { ShortcutProvider, ShortcutHelp } from '@/shared/keyboard'
import { CommandPalette } from '@/shared/command-palette'
import { NavigationShortcuts } from '@/shared/navigation/navigation-shortcuts'

// Point d'entrée applicatif.
//
// Ordre des providers : thème → i18n (pilote aussi Accept-Language) → TanStack
// Query (état serveur) → routeur → Auth. La porte `AuthGate` décide : splash
// pendant la reprise de session, écran de connexion si non authentifié, sinon
// l'app protégée (socle d'interactions inclus).

function SplashScreen() {
  const { t } = useI18n()
  return (
    <div className="bg-background flex min-h-dvh items-center justify-center">
      <span className="text-muted-foreground text-sm">{t('app.loading')}</span>
    </div>
  )
}

function AuthGate() {
  const { status } = useAuth()
  if (status === 'loading') return <SplashScreen />
  if (status === 'unauthenticated') return <LoginPage />
  return (
    <ShortcutProvider>
      <AppRoutes />
      <CommandPalette />
      <ShortcutHelp />
      <NavigationShortcuts />
    </ShortcutProvider>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <DisplayPreferencesProvider>
        <I18nProvider>
          <QueryProvider>
            <BrowserRouter>
              <AuthProvider>
                <AuthGate />
              </AuthProvider>
            </BrowserRouter>
          </QueryProvider>
        </I18nProvider>
      </DisplayPreferencesProvider>
    </ThemeProvider>
  )
}
