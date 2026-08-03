import { describe, it, expect } from 'vitest'
import { countryName } from './country'

describe('countryName', () => {
  it('localise un alpha-2 via Intl (insensible à la casse)', () => {
    expect(countryName('TN', 'en')).toBe('Tunisia')
    expect(countryName('tn', 'fr')).toBe('Tunisie')
  })

  it('vide si absent', () => {
    expect(countryName(null, 'fr')).toBe('')
    expect(countryName('', 'fr')).toBe('')
  })
})
