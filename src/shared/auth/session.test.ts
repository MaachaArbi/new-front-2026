import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiError } from '@/shared/api/errors'

vi.mock('@/shared/api/http-client', () => ({ apiRequest: vi.fn() }))
import { apiRequest } from '@/shared/api/http-client'
import {
  login,
  logout,
  refresh,
  restoreSession,
  authedRequest,
} from './session'
import { getAccessToken, setAccessToken, clearAccessToken } from './token-store'

const mockApi = vi.mocked(apiRequest)

beforeEach(() => {
  clearAccessToken()
  mockApi.mockReset()
})

describe('session', () => {
  it('login stocke l’access token (credentials include, skipAuth)', async () => {
    mockApi.mockResolvedValueOnce({ token: 'a1' })
    await login('e@x', 'p')
    expect(getAccessToken()).toBe('a1')
    expect(mockApi).toHaveBeenCalledWith(
      'POST',
      '/auth/login',
      expect.objectContaining({ credentials: 'include', skipAuth: true })
    )
  })

  it('refresh single-flight : deux appels concurrents = UN seul appel réseau', async () => {
    let resolveApi: (v: { token: string }) => void = () => {}
    mockApi.mockReturnValueOnce(
      new Promise((r) => {
        resolveApi = r
      })
    )
    const a = refresh()
    const b = refresh()
    resolveApi({ token: 'r1' })
    await Promise.all([a, b])
    expect(mockApi).toHaveBeenCalledTimes(1)
    expect(getAccessToken()).toBe('r1')
  })

  it('authedRequest : 401 → refresh → rejoue une fois', async () => {
    const unauthorized = new ApiError(401, '401', 'expiré')
    mockApi
      .mockRejectedValueOnce(unauthorized) // appel métier → 401
      .mockResolvedValueOnce({ token: 'r2' }) // refresh
      .mockResolvedValueOnce({ ok: true }) // rejeu
    const result = await authedRequest('GET', '/party-accounts')
    expect(result).toEqual({ ok: true })
    expect(mockApi).toHaveBeenCalledTimes(3)
    expect(getAccessToken()).toBe('r2')
  })

  it('authedRequest : refresh échoué → vide la mémoire et relève l’erreur', async () => {
    setAccessToken('stale')
    const unauthorized = new ApiError(401, '401', 'expiré')
    mockApi
      .mockRejectedValueOnce(unauthorized)
      .mockRejectedValueOnce(new ApiError(401, 'invalid_refresh_token', 'x'))
    await expect(authedRequest('GET', '/x')).rejects.toBe(unauthorized)
    expect(getAccessToken()).toBeNull()
  })

  it('restoreSession : true si le refresh passe, false sinon', async () => {
    mockApi.mockResolvedValueOnce({ token: 'r3' })
    await expect(restoreSession()).resolves.toBe(true)
    mockApi.mockRejectedValueOnce(new ApiError(401, 'x', 'y'))
    await expect(restoreSession()).resolves.toBe(false)
    expect(getAccessToken()).toBeNull()
  })

  it('logout vide la mémoire même si l’appel réussit', async () => {
    setAccessToken('x')
    mockApi.mockResolvedValueOnce(undefined)
    await logout()
    expect(getAccessToken()).toBeNull()
    expect(mockApi).toHaveBeenCalledWith(
      'POST',
      '/auth/logout',
      expect.objectContaining({ credentials: 'include' })
    )
  })
})
