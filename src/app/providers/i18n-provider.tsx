'use client'

import React, { createContext, useContext, useEffect, useMemo } from 'react'
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

  useEffect(() => {
    const stored = localStorage.getItem('i18n-language') as LanguageCode | null
    if (stored && stored in LANGUAGES) {
      setCurrentLanguageState(stored)
      applyLanguage(stored)
    } else {
      applyLanguage(currentLanguage)
    }
    setMounted(true)
  }, [])

  const applyLanguage = (lang: LanguageCode) => {
    const langConfig = LANGUAGES[lang]
    if (langConfig) {
      document.documentElement.setAttribute('dir', langConfig.direction)
      document.documentElement.setAttribute('lang', lang)
    }
  }

  const setLanguage = (lang: LanguageCode) => {
    setCurrentLanguageState(lang)
    localStorage.setItem('i18n-language', lang)
    applyLanguage(lang)
  }

  const t = (key: string): string => {
    return messages[currentLanguage][key] || key
  }

  const value: I18nContextType = useMemo(
    () => ({
      currentLanguage,
      setLanguage,
      t,
    }),
    [currentLanguage]
  )

  if (!mounted) return null

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
