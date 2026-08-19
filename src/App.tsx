import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './app/providers/theme-provider'
import { DisplayPreferencesProvider } from './app/providers/display-preferences'
import { I18nProvider } from './app/providers/i18n-provider'
import { QueryProvider } from './app/providers/query-provider'

/**
 * Racine de l'application — SOCLE SEUL.
 *
 * Reprise du 19/08 : toute la couche visuelle a été retirée (voir la branche
 * `archive/ui-v1` pour la précédente). Ce qui reste ici est ce qui avait été payé
 * cher et qu'il aurait été absurde de réapprendre : l'accès à l'API et son enveloppe
 * d'erreur, la session sans stockage, le noyau monétaire, l'i18n et le RTL, les
 * raccourcis par position physique, les jetons de thème.
 *
 * L'ordre des fournisseurs n'est pas indifférent : le thème et les préférences
 * s'appliquent avant tout rendu (sinon l'écran saute), l'i18n encadre le reste
 * (les messages d'erreur de l'API sont traduits), et les requêtes viennent en
 * dernier — elles dépendent de la langue envoyée en en-tête.
 *
 * `AuthProvider` et le routage réel reviendront avec les premiers écrans.
 */
export function App() {
  return (
    <ThemeProvider>
      <DisplayPreferencesProvider>
        <I18nProvider>
          <QueryProvider>
            <BrowserRouter>
              <Routes>
                <Route path="*" element={<Placeholder />} />
              </Routes>
            </BrowserRouter>
          </QueryProvider>
        </I18nProvider>
      </DisplayPreferencesProvider>
    </ThemeProvider>
  )
}

/** Repère temporaire : l'application démarre, le socle répond, rien n'est dessiné. */
function Placeholder() {
  return (
    <div className="bg-background text-foreground flex min-h-dvh items-center justify-center">
      <p className="text-muted-foreground text-sm">
        Socle en place — la couche visuelle est à construire.
      </p>
    </div>
  )
}
