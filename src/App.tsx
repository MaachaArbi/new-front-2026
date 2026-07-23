import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './app/providers/theme-provider'
import { I18nProvider } from './app/providers/i18n-provider'
import { AppRoutes } from './app/router'

// Point d'entrée applicatif. Le layout provisoire de S2 (couleurs brutes,
// chaînes en dur) est supprimé : le vrai layout-21 est monté par le routeur.
export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  )
}
