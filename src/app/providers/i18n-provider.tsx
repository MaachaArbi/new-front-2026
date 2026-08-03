'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import { IntlProvider, useIntl } from 'react-intl'
import { DirectionProvider as RadixDirectionProvider } from '@radix-ui/react-direction'
import { DEFAULT_LANGUAGE, LANGUAGES } from '@/shared/i18n/config'
import { setApiLocale } from '@/shared/api/locale'
import type { LanguageCode, I18nContextType } from '@/shared/i18n/types'
import en from '@/shared/i18n/messages/en.json'
import fr from '@/shared/i18n/messages/fr.json'
import ar from '@/shared/i18n/messages/ar.json'

/**
 * Internationalisation — react-intl / FormatJS (ADR-F06).
 *
 * Le provider maison de S2 (une fonction `t` qui ne faisait ni interpolation ni
 * pluriel) est remplacé par `IntlProvider`. On gagne l'**ICU MessageFormat** :
 * interpolation `{name}` et pluriels corrects dans les **six formes arabes**
 * (contre deux en français). Le besoin avait été révélé par S5-UX (dérive n°6).
 *
 * Ce qui fonctionnait est **préservé** : bascule de langue + persistance
 * (localStorage), `dir`/`lang` sur `<html>`, `RadixDirectionProvider` (sans lui
 * les menus Radix s'ouvrent du mauvais côté en arabe — piège S3b), langue par
 * défaut `fr`.
 *
 * `useI18n()` reste l'API d'appel (`t`, `currentLanguage`, `setLanguage`) pour ne
 * pas casser les 13 appelants ; `t` délègue désormais à `intl.formatMessage` et
 * accepte donc des valeurs d'interpolation.
 */

const messages: Record<LanguageCode, Record<string, string>> = {
  en,
  fr,
  ar,
}

/** Contexte de langue (état + bascule), distinct de l'intl de react-intl. */
interface LanguageContextValue {
  currentLanguage: LanguageCode
  setLanguage: (lang: LanguageCode) => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguageState] =
    React.useState<LanguageCode>(DEFAULT_LANGUAGE as LanguageCode)
  const [mounted, setMounted] = React.useState(false)

  const applyLanguage = useCallback((lang: LanguageCode) => {
    const langConfig = LANGUAGES[lang]
    if (langConfig) {
      document.documentElement.setAttribute('dir', langConfig.direction)
      document.documentElement.setAttribute('lang', lang)
    }
    // La langue active pilote l'en-tête Accept-Language du client API (§2.1).
    setApiLocale(lang)
  }, [])

  // Initialisation au montage, une seule fois : lit le choix stocké, sinon
  // applique la langue par défaut. On référence DEFAULT_LANGUAGE — et non
  // currentLanguage — car au montage les deux sont identiques.
  useEffect(() => {
    const stored = localStorage.getItem('i18n-language') as LanguageCode | null
    if (stored && stored in LANGUAGES) {
      setCurrentLanguageState(stored)
      applyLanguage(stored)
    } else {
      applyLanguage(DEFAULT_LANGUAGE as LanguageCode)
    }
    setMounted(true)
  }, [applyLanguage])

  const setLanguage = useCallback(
    (lang: LanguageCode) => {
      setCurrentLanguageState(lang)
      localStorage.setItem('i18n-language', lang)
      applyLanguage(lang)
    },
    [applyLanguage]
  )

  const languageValue = useMemo<LanguageContextValue>(
    () => ({ currentLanguage, setLanguage }),
    [currentLanguage, setLanguage]
  )

  if (!mounted) return null

  const direction = LANGUAGES[currentLanguage]?.direction ?? 'ltr'

  return (
    <LanguageContext.Provider value={languageValue}>
      <IntlProvider
        locale={currentLanguage}
        defaultLocale={DEFAULT_LANGUAGE}
        messages={messages[currentLanguage]}
        onError={(err) => {
          // Une traduction manquante retombe silencieusement sur la clé
          // (comportement voulu, comme l'ancien provider). Les autres erreurs
          // (syntaxe ICU) restent visibles en développement.
          if (
            err.code === 'MISSING_TRANSLATION' ||
            err.code === 'MISSING_DATA'
          ) {
            return
          }
          console.error(err)
        }}
      >
        <RadixDirectionProvider dir={direction}>
          {children}
        </RadixDirectionProvider>
      </IntlProvider>
    </LanguageContext.Provider>
  )
}

/**
 * API d'appel de l'i18n. `t(key, values?)` délègue à `intl.formatMessage` : les
 * clés simples fonctionnent comme avant, et l'interpolation/les pluriels ICU
 * sont désormais disponibles. `currentLanguage`/`setLanguage` restent inchangés
 * (sélecteur de langue, et noyau Money via `money-input.tsx`).
 */
export function useI18n(): I18nContextType {
  const language = useContext(LanguageContext)
  const intl = useIntl()
  if (!language) {
    throw new Error('useI18n must be used within I18nProvider')
  }

  const t = useCallback(
    (key: string, values?: Record<string, string | number>): string =>
      intl.formatMessage({ id: key }, values),
    [intl]
  )

  return {
    currentLanguage: language.currentLanguage,
    setLanguage: language.setLanguage,
    t,
  }
}
