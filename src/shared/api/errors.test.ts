import { describe, it, expect } from 'vitest'
import { toApiError, ApiError } from './errors'

describe('toApiError', () => {
  it('parse l’enveloppe métier { error: {...} } + violations', () => {
    const err = toApiError(
      422,
      {
        error: {
          code: 'validation_failed',
          message: 'Refusé.',
          context: { limit: 200 },
          violations: [{ field: 'limit', message: 'trop grand' }],
        },
      },
      'req-1'
    )
    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBe(422)
    expect(err.code).toBe('validation_failed')
    expect(err.message).toBe('Refusé.')
    expect(err.context).toEqual({ limit: 200 })
    expect(err.violations).toEqual([{ field: 'limit', message: 'trop grand' }])
    expect(err.requestId).toBe('req-1')
    expect(err.isValidation).toBe(true)
  })

  it('parse la forme auth { code, message } (401)', () => {
    const err = toApiError(
      401,
      { code: 401, message: 'Invalid credentials.' },
      null
    )
    expect(err.status).toBe(401)
    expect(err.message).toBe('Invalid credentials.')
    expect(err.isUnauthorized).toBe(true)
  })

  it('drapeaux de statut', () => {
    expect(toApiError(403, {}, null).isForbidden).toBe(true)
    expect(toApiError(404, {}, null).isNotFound).toBe(true)
    expect(toApiError(409, {}, null).isConflict).toBe(true)
  })
})
