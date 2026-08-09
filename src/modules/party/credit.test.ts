import { describe, expect, it } from 'vitest'
import { groupCreditLimits } from './credit'
import type { PartyCreditLimit } from './api'

/**
 * Le plafond effectif décide si un agent peut engager une réservation. Il se calculait
 * en double — onglet Finance et rail de la fiche — et les deux se sont contredits à
 * l'écran dès qu'on a corrigé un seul côté. Ces cas verrouillent la règle unique.
 */

const TODAY = '2026-08-09'

function limit(over: Partial<PartyCreditLimit>): PartyCreditLimit {
  return {
    publicId: Math.random().toString(36).slice(2),
    officeAccountId: 1,
    currencyCode: 'TND',
    serviceTypeCode: null,
    amountMinor: '0',
    validFrom: null,
    validTo: null,
    isExtension: false,
    ...over,
  }
}

describe('plafond effectif', () => {
  it('somme le socle et les rallonges en cours', () => {
    const [scope] = groupCreditLimits(
      [
        limit({ amountMinor: '10000500' }),
        limit({
          isExtension: true,
          amountMinor: '500000',
          validFrom: '2026-08-01',
          validTo: '2026-12-31',
        }),
      ],
      TODAY
    )
    expect(scope?.effectiveMinor).toBe('10500500')
  })

  it("EXCLUT une rallonge qui n'a pas encore commencé", () => {
    // Le défaut d'origine : une rallonge du lendemain gonflait le plafond du jour, et
    // un agent pouvait engager un montant que le client n'a pas encore.
    const [scope] = groupCreditLimits(
      [
        limit({ amountMinor: '10000500' }),
        limit({
          isExtension: true,
          amountMinor: '500000',
          validFrom: '2026-08-10',
          validTo: '2026-08-11',
        }),
      ],
      TODAY
    )
    expect(scope?.effectiveMinor).toBe('10000500')
    // Elle reste listée : on ne la compte pas, on ne la cache pas.
    expect(scope?.extensions).toHaveLength(1)
  })

  it('exclut une rallonge expirée', () => {
    const [scope] = groupCreditLimits(
      [
        limit({ amountMinor: '10000500' }),
        limit({
          isExtension: true,
          amountMinor: '500000',
          validTo: '2026-08-08',
        }),
      ],
      TODAY
    )
    expect(scope?.effectiveMinor).toBe('10000500')
  })

  it('compte une rallonge dont la période commence exactement aujourd’hui', () => {
    const [scope] = groupCreditLimits(
      [
        limit({ amountMinor: '1000' }),
        limit({
          isExtension: true,
          amountMinor: '500',
          validFrom: TODAY,
          validTo: TODAY,
        }),
      ],
      TODAY
    )
    // Bornes INCLUSIVES des deux côtés — un jour de validité reste un jour de validité.
    expect(scope?.effectiveMinor).toBe('1500')
  })

  it('sépare les portées par société, devise et service', () => {
    const scopes = groupCreditLimits(
      [
        limit({ officeAccountId: 1, currencyCode: 'TND', amountMinor: '100' }),
        limit({ officeAccountId: 1, currencyCode: 'EUR', amountMinor: '200' }),
        limit({
          officeAccountId: 1,
          currencyCode: 'TND',
          serviceTypeCode: 'flight',
          amountMinor: '300',
        }),
        limit({ officeAccountId: 2, currencyCode: 'TND', amountMinor: '400' }),
      ],
      TODAY
    )
    expect(scopes).toHaveLength(4)
    expect(scopes.map((s) => s.effectiveMinor).sort()).toEqual([
      '100',
      '200',
      '300',
      '400',
    ])
  })

  it('somme en BigInt — un montant au-delà de la précision d’un number reste exact', () => {
    const [scope] = groupCreditLimits(
      [
        limit({ amountMinor: '9007199254740993' }),
        limit({ isExtension: true, amountMinor: '1' }),
      ],
      TODAY
    )
    // En `number`, 9007199254740993 + 1 donne 9007199254740994 par arrondi.
    expect(scope?.effectiveMinor).toBe('9007199254740994')
  })
})
