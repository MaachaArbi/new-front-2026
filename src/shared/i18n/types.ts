export type LanguageCode = 'en' | 'fr' | 'ar'

export interface I18nContextType {
  currentLanguage: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: string, values?: Record<string, string | number>) => string
}
