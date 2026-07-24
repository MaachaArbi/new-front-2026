import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createIntl, createIntlCache } from 'react-intl'
import en from './messages/en.json'
import fr from './messages/fr.json'
import ar from './messages/ar.json'
import { I18nProvider, useI18n } from '@/app/providers/i18n-provider'

const cache = createIntlCache()
function intlFor(locale: string, messages: Record<string, string>) {
  return createIntl({ locale, defaultLocale: 'fr', messages }, cache)
}

describe('catalogues ICU — interpolation', () => {
  it('insère une variable dans les trois langues', () => {
    expect(
      intlFor('en', en).formatMessage({ id: 'greeting' }, { name: 'Sofiane' })
    ).toBe('Hello Sofiane')
    expect(
      intlFor('fr', fr).formatMessage({ id: 'greeting' }, { name: 'Sofiane' })
    ).toBe('Bonjour Sofiane')
    expect(
      intlFor('ar', ar).formatMessage({ id: 'greeting' }, { name: 'Sofiane' })
    ).toContain('مرحبا')
  })
})

describe('pluriel arabe — les six formes CLDR', () => {
  const intl = intlFor('ar', ar)
  const count = (n: number) =>
    intl.formatMessage({ id: 'invoices.count' }, { count: n })

  it('zéro (0) → forme « zero »', () => {
    expect(count(0)).toBe('لا فواتير')
  })
  it('un (1) → forme « one »', () => {
    expect(count(1)).toBe('فاتورة واحدة')
  })
  it('deux (2) → forme « two » (duel) — la preuve clé', () => {
    expect(count(2)).toBe('فاتورتان')
  })
  it('trois (3) → forme « few »', () => {
    // « few » (3–10) : le mot pluriel « فواتير ».
    expect(count(3)).toContain('فواتير')
    expect(count(3)).not.toContain('فاتورتان')
  })
  it('onze (11) → forme « many », distincte de « few »', () => {
    // « many » (11–99) : le mot « فاتورة » — différent de « فواتير ».
    expect(count(11)).toContain('فاتورة')
    expect(count(11)).not.toContain('فواتير')
  })
})

describe('pluriel français — deux formes + zéro explicite', () => {
  const intl = intlFor('fr', fr)
  const count = (n: number) =>
    intl.formatMessage({ id: 'invoices.count' }, { count: n })

  it('0 / 1 / 2', () => {
    expect(count(0)).toBe('Aucune facture')
    expect(count(1)).toBe('1 facture')
    expect(count(2)).toBe('2 factures')
  })
})

describe('useI18n (react-intl) — bascule de langue préservée', () => {
  beforeEach(() => localStorage.clear())

  function Probe() {
    const { t, currentLanguage, setLanguage } = useI18n()
    return (
      <div>
        <span data-testid="lang">{currentLanguage}</span>
        <span data-testid="greet">{t('greeting', { name: 'Sofiane' })}</span>
        <button onClick={() => setLanguage('en')}>to-en</button>
        <button onClick={() => setLanguage('ar')}>to-ar</button>
      </div>
    )
  }

  it('langue par défaut fr, interpolation via t(), puis bascule', () => {
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>
    )
    // Défaut fr
    expect(screen.getByTestId('lang')).toHaveTextContent('fr')
    expect(screen.getByTestId('greet')).toHaveTextContent('Bonjour Sofiane')

    // Bascule en
    fireEvent.click(screen.getByText('to-en'))
    expect(screen.getByTestId('lang')).toHaveTextContent('en')
    expect(screen.getByTestId('greet')).toHaveTextContent('Hello Sofiane')

    // Bascule ar (persistance + currentLanguage pour Money)
    fireEvent.click(screen.getByText('to-ar'))
    expect(screen.getByTestId('lang')).toHaveTextContent('ar')
    expect(localStorage.getItem('i18n-language')).toBe('ar')
  })

  it('clé absente → repli silencieux sur la clé (pas de crash)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    function Missing() {
      const { t } = useI18n()
      return <span data-testid="x">{t('this.key.does.not.exist')}</span>
    }
    render(
      <I18nProvider>
        <Missing />
      </I18nProvider>
    )
    expect(screen.getByTestId('x')).toHaveTextContent('this.key.does.not.exist')
    spy.mockRestore()
  })
})
