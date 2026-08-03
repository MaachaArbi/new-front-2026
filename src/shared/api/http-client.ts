/**
 * Client HTTP bas niveau (ADR-F09/F14). Il ne gère PAS le rafraîchissement sur
 * 401 — cette logique vit dans la couche auth (`session.ts`), pour garder ce
 * client simple et sans état de session.
 *
 * Il pose systématiquement `Accept-Language` (§2.1), le `Bearer` (sauf routes
 * publiques), et lève une `ApiError` typée en cas d'échec, avec `X-Request-Id`.
 */

import { API_BASE_URL } from './config'
import { ApiError, toApiError } from './errors'
import { getApiLocale } from './locale'
import { getAccessToken } from '@/shared/auth/token-store'

const REQUEST_ID_HEADER = 'X-Request-Id'

export type QueryValue = string | number | boolean | undefined | null

export interface RequestOptions {
  body?: unknown
  /** `'include'` UNIQUEMENT sur les 3 routes auth (cookie). Défaut : `'same-origin'`. */
  credentials?: RequestCredentials
  /** Ne pas joindre le Bearer (routes publiques : login). */
  skipAuth?: boolean
  signal?: AbortSignal
  query?: Record<string, QueryValue>
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${API_BASE_URL}${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

/**
 * Émet une requête et rend le corps décodé (ou `undefined` sur 204). Lève une
 * `ApiError` sur tout statut non-2xx.
 */
export async function apiRequest<T>(
  method: string,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Language': getApiLocale(),
  }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (!options.skipAuth) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    credentials: options.credentials ?? 'same-origin',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  const requestId = response.headers.get(REQUEST_ID_HEADER)

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  const decoded: unknown = text.length > 0 ? JSON.parse(text) : null

  if (!response.ok) {
    throw toApiError(response.status, decoded, requestId)
  }

  return decoded as T
}

export { ApiError }
