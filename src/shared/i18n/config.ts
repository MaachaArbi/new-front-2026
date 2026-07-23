export interface Language {
  code: string
  name: string
  direction: 'ltr' | 'rtl'
  flag: string
}

export const LANGUAGES: Record<string, Language> = {
  en: {
    code: 'en',
    name: 'English',
    direction: 'ltr',
    flag: '🇬🇧',
  },
  fr: {
    code: 'fr',
    name: 'Français',
    direction: 'ltr',
    flag: '🇫🇷',
  },
  ar: {
    code: 'ar',
    name: 'العربية',
    direction: 'rtl',
    flag: '🇸🇦',
  },
}

export const DEFAULT_LANGUAGE = 'fr'
