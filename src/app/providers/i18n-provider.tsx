'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import { DirectionProvider as RadixDirectionProvider } from '@radix-ui/react-direction'
import { DEFAULT_LANGUAGE, LANGUAGES } from '@/shared/i18n/config'
import type { LanguageCode, I18nContextType } from '@/shared/i18n/types'
import en from '@/shared/i18n/messages/en.json'
import fr from '@/shared/i18n/messages/fr.json'
import ar from '@/shared/i18n/messages/ar.json'

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const messages: Record<LanguageCode, Record<string, string>> = {
  en,
  fr,
  ar,
}

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
  }, [])

  // Initialisation au montage, une seule fois : lit le choix stocké, sinon
  // applique la langue par défaut. On référence DEFAULT_LANGUAGE — et non
  // currentLanguage — car au montage les deux sont identiques ; l'effet reste
  // ainsi honnêtement sans dépendance changeante.
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

  const t = useCallback(
    (key: string): string => {
      return messages[currentLanguage][key] || key
    },
    [currentLanguage]
  )

  const value: I18nContextType = useMemo(
    () => ({
      currentLanguage,
      setLanguage,
      t,
    }),
    [currentLanguage, setLanguage, t]
  )

  if (!mounted) return null

  // Piège RTL (S3b §5) : sans DirectionProvider, les primitives Radix (menus
  // déroulants, infobulles, tiroir) s'ouvrent du mauvais côté en arabe. On
  // propage la direction de la langue courante à tout l'arbre Radix.
  const direction = LANGUAGES[currentLanguage]?.direction ?? 'ltr'

  return (
    <I18nContext.Provider value={value}>
      <RadixDirectionProvider dir={direction}>
        {children}
      </RadixDirectionProvider>
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
