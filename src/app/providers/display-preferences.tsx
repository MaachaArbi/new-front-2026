import * as React from 'react'

/**
 * PRÉFÉRENCES D'AFFICHAGE — barre latérale, police.
 *
 * Le thème clair/sombre reste chez `next-themes` (il a déjà la reprise système et
 * l'anti-clignotement). Les deux autres axes vivent ici, sous la même forme : un
 * attribut `data-*` sur `<html>`, lu par la cascade CSS de `tokens.css`. Aucun style
 * n'est calculé en JavaScript — le rendu React n'a rien à en savoir.
 *
 * L'axe ACCENT est retiré (décision C du 20/08). La palette « Bleu de Prusse » est
 * un système ACCORDÉ : ses neutres portent la teinte du primaire (chroma ≈ 0,006).
 * Proposer un accent ambre ou indigo par-dessus des neutres bleutés ferait jurer
 * toute l'interface — l'option aurait été une façon de laisser l'utilisateur casser
 * le produit. Une seule palette, tenue. Restaurable : l'axe ne coûtait qu'une
 * cascade CSS, il n'a laissé aucune trace ailleurs.
 *
 * Ce qui N'EST PAS ouvert non plus : la densité et la taille de l'interface. Les
 * variables existent (`--ui-row`, `--ui-scale`) et les composants les lisent, mais
 * on ne promet pas des centaines de combinaisons que personne ne peut vérifier.
 */

export const SIDEBARS = ['dark', 'light'] as const
export const FONTS = ['inter', 'plex', 'barlow', 'system'] as const

export type SidebarTone = (typeof SIDEBARS)[number]
export type FontChoice = (typeof FONTS)[number]

export interface DisplayPreferences {
  sidebar: SidebarTone
  font: FontChoice
}

/** Défauts : menu sombre (le contraste ancre la navigation), Inter. */
export const DEFAULT_PREFERENCES: DisplayPreferences = {
  sidebar: 'dark',
  font: 'inter',
}

export const PREFERENCES_STORAGE_KEY = 'ostravel-display'

/**
 * Familles Google Fonts par choix. `inter` est déjà chargée par `index.html` ;
 * les autres ne se téléchargent QUE si l'utilisateur les demande — porter trois
 * familles au chargement pour n'en afficher qu'une serait payer trois fois.
 */
const FONT_HREF: Partial<Record<FontChoice, string>> = {
  plex: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Condensed:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
  barlow:
    'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@400;500;600;700&display=swap',
}

function ensureFontLoaded(font: FontChoice): void {
  const href = FONT_HREF[font]
  if (!href) return
  const id = `font-${font}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

function isOneOf<T extends string>(
  values: readonly T[],
  candidate: unknown
): candidate is T {
  return (
    typeof candidate === 'string' &&
    (values as readonly string[]).includes(candidate)
  )
}

export function readPreferences(): DisplayPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY)
    if (!raw) return DEFAULT_PREFERENCES
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null)
      return DEFAULT_PREFERENCES
    const record = parsed as Record<string, unknown>
    return {
      sidebar: isOneOf(SIDEBARS, record.sidebar)
        ? record.sidebar
        : DEFAULT_PREFERENCES.sidebar,
      font: isOneOf(FONTS, record.font)
        ? record.font
        : DEFAULT_PREFERENCES.font,
    }
  } catch {
    // Stockage indisponible (navigation privée stricte) : les défauts suffisent.
    return DEFAULT_PREFERENCES
  }
}

export function applyPreferences(preferences: DisplayPreferences): void {
  const root = document.documentElement
  root.dataset.sidebar = preferences.sidebar
  root.dataset.font = preferences.font
  ensureFontLoaded(preferences.font)
}

interface PreferencesContext extends DisplayPreferences {
  setPreference: <K extends keyof DisplayPreferences>(
    key: K,
    value: DisplayPreferences[K]
  ) => void
  reset: () => void
}

const Context = React.createContext<PreferencesContext | null>(null)

export function DisplayPreferencesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [preferences, setPreferences] =
    React.useState<DisplayPreferences>(readPreferences)

  React.useEffect(() => {
    applyPreferences(preferences)
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
    } catch {
      // Rien à faire : le réglage vaut pour la session, il ne survivra pas.
    }
  }, [preferences])

  const value = React.useMemo<PreferencesContext>(
    () => ({
      ...preferences,
      setPreference: (key, next) =>
        setPreferences((current) => ({ ...current, [key]: next })),
      reset: () => setPreferences(DEFAULT_PREFERENCES),
    }),
    [preferences]
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useDisplayPreferences(): PreferencesContext {
  const context = React.useContext(Context)
  if (!context) {
    throw new Error(
      'useDisplayPreferences doit être appelé sous <DisplayPreferencesProvider>.'
    )
  }
  return context
}
