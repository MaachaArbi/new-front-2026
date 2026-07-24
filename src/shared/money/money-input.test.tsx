import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { I18nProvider } from '@/app/providers/i18n-provider'
import { MoneyInput } from './money-input'
import { fromMinorUnits, type Money } from './money'

function renderInput(props: {
  currency: string
  locale?: string
  value?: Money | null
  onChange: (v: Money | null) => void
}) {
  return render(
    <I18nProvider>
      <MoneyInput
        id="amount"
        label="Montant"
        currency={props.currency}
        locale={props.locale}
        value={props.value ?? null}
        onChange={props.onChange}
        errorMessage="Montant invalide"
      />
    </I18nProvider>
  )
}

describe('MoneyInput', () => {
  it('associe le libellé au champ (accessible)', () => {
    renderInput({ currency: 'EUR', locale: 'en', onChange: vi.fn() })
    // getByLabelText échoue si l'association htmlFor/id est absente.
    expect(screen.getByLabelText('Montant')).toBeInTheDocument()
  })

  it('émet un Money sur saisie valide (en, point décimal)', () => {
    const onChange = vi.fn()
    renderInput({ currency: 'EUR', locale: 'en', onChange })
    fireEvent.change(screen.getByLabelText('Montant'), {
      target: { value: '12.34' },
    })
    const last = onChange.mock.lastCall?.[0] as Money | null
    expect(last?.amount).toBe(1234n)
    expect(last?.currency).toBe('EUR')
  })

  it('accepte la virgule décimale en français', () => {
    const onChange = vi.fn()
    renderInput({ currency: 'EUR', locale: 'fr', onChange })
    fireEvent.change(screen.getByLabelText('Montant'), {
      target: { value: '12,34' },
    })
    expect((onChange.mock.lastCall?.[0] as Money).amount).toBe(1234n)
  })

  it('refuse plus de décimales que la devise : aria-invalid + message', () => {
    const onChange = vi.fn()
    renderInput({ currency: 'EUR', locale: 'en', onChange })
    const input = screen.getByLabelText('Montant')
    fireEvent.change(input, { target: { value: '12.345' } }) // 3 déc. > 2
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(screen.getByRole('alert')).toHaveTextContent('Montant invalide')
  })

  it('champ vidé → onChange(null), pas d’erreur', () => {
    const onChange = vi.fn()
    renderInput({ currency: 'EUR', locale: 'en', onChange })
    const input = screen.getByLabelText('Montant')
    fireEvent.change(input, { target: { value: '5' } })
    fireEvent.change(input, { target: { value: '' } })
    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('initialise le champ depuis une valeur (string éditable, sans symbole)', () => {
    renderInput({
      currency: 'EUR',
      locale: 'en',
      value: fromMinorUnits(500n, 'EUR'),
      onChange: vi.fn(),
    })
    // « 5.00 » — pas « €5.00 » : réinjectable dans le parseur.
    expect(screen.getByLabelText('Montant')).toHaveValue('5.00')
  })
})
