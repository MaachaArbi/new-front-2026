import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiRequest } from './http-client'
import { ApiError } from './errors'
import { setApiLocale } from './locale'
import { setAccessToken, clearAccessToken } from '@/shared/auth/token-store'

function respond(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  const init: ResponseInit = { status, headers }
  return new Response(body === null ? null : JSON.stringify(body), init)
}

function headersOf(init: RequestInit | undefined): Record<string, string> {
  return (init?.headers ?? {}) as Record<string, string>
}

beforeEach(() => {
  clearAccessToken()
  setApiLocale('fr')
})
afterEach(() => vi.restoreAllMocks())

describe('apiRequest', () => {
  it('envoie Accept-Language + Bearer, construit la query, parse le JSON', async () => {
    setAccessToken('tok-123')
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(respond({ data: [], meta: { total: 0 } }, 200))

    const result = await apiRequest('GET', '/party-accounts', {
      query: { page: 1, limit: 20, search: '' },
    })

    expect(result).toEqual({ data: [], meta: { total: 0 } })
    const [url, init] = fetchSpy.mock.calls[0] ?? []
    expect(String(url)).toContain('/party-accounts?page=1&limit=20')
    expect(String(url)).not.toContain('search=') // '' est omis
    const headers = headersOf(init)
    expect(headers['Accept-Language']).toBe('fr')
    expect(headers.Authorization).toBe('Bearer tok-123')
    expect(init?.credentials).toBe('same-origin')
  })

  it('credentials:include + pas de Bearer si skipAuth (login)', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(respond({ token: 't' }, 200))

    await apiRequest('POST', '/auth/login', {
      body: { email: 'a', password: 'b' },
      credentials: 'include',
      skipAuth: true,
    })

    const init = fetchSpy.mock.calls[0]?.[1]
    expect(init?.credentials).toBe('include')
    const headers = headersOf(init)
    expect(headers.Authorization).toBeUndefined()
    expect(headers['Content-Type']).toBe('application/json')
    expect(init?.body).toBe(JSON.stringify({ email: 'a', password: 'b' }))
  })

  it('lève une ApiError typée + X-Request-Id sur échec métier', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      respond(
        { error: { code: 'party_account.not_found', message: 'X' } },
        404,
        { 'X-Request-Id': 'req-9' }
      )
    )
    const error = await apiRequest('GET', '/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 404,
      code: 'party_account.not_found',
      requestId: 'req-9',
    })
  })

  it('204 → undefined', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(respond(null, 204))
    await expect(
      apiRequest('POST', '/auth/logout', { credentials: 'include' })
    ).resolves.toBeUndefined()
  })
})
