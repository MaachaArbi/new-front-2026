/**
 * Session — login / refresh / logout (contrat §1.6, cookie httpOnly livré 03/08).
 *
 * - Les 3 routes auth partent avec `credentials:'include'` (le cookie
 *   `ostravel_refresh` désigne la session) ; refresh/logout ont un **corps vide**.
 * - **Rien n'est stocké** : l'access token vit en mémoire (`token-store`), le
 *   refresh token dans le cookie invisible au JS.
 * - **Jamais deux refresh en parallèle** (§1.6) : un refresh rejoué ferme toutes
 *   les sessions. On sérialise à deux niveaux — single-flight dans l'onglet, et
 *   **verrou inter-onglets** via l'API Web Locks (le second onglet attend, puis
 *   présente le cookie déjà tourné, donc jamais un jeton rejoué).
 */

import { apiRequest } from '@/shared/api/http-client'
import type { RequestOptions } from '@/shared/api/http-client'
import { AUTH_PATHS } from '@/shared/api/config'
import { ApiError } from '@/shared/api/errors'
import { setAccessToken, clearAccessToken } from './token-store'

interface TokenResponse {
  token: string
}

const REFRESH_LOCK = 'ostravel-refresh'

/** Connexion : pose l'access token en mémoire ; le cookie de refresh est posé par le serveur. */
export async function login(email: string, password: string): Promise<void> {
  const response = await apiRequest<TokenResponse>('POST', AUTH_PATHS.login, {
    body: { email, password },
    credentials: 'include',
    skipAuth: true,
  })
  setAccessToken(response.token)
}

/** Déconnexion : ferme la session côté serveur (cookie) et vide la mémoire. */
export async function logout(): Promise<void> {
  try {
    await apiRequest<undefined>('POST', AUTH_PATHS.logout, {
      credentials: 'include',
    })
  } finally {
    clearAccessToken()
  }
}

let inflightRefresh: Promise<string> | null = null

async function performRefresh(): Promise<string> {
  const response = await apiRequest<TokenResponse>('POST', AUTH_PATHS.refresh, {
    credentials: 'include',
    skipAuth: true,
  })
  setAccessToken(response.token)
  return response.token
}

async function withCrossTabLock(run: () => Promise<string>): Promise<string> {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined
  if (locks) {
    return locks.request(REFRESH_LOCK, () => run())
  }
  return run()
}

/**
 * Rafraîchit l'access token. **Single-flight** : deux appels concurrents dans le
 * même onglet partagent la même promesse ; entre onglets, le verrou Web Locks
 * sérialise. Rend le nouvel access token.
 */
export function refresh(): Promise<string> {
  if (inflightRefresh) return inflightRefresh
  inflightRefresh = withCrossTabLock(performRefresh).finally(() => {
    inflightRefresh = null
  })
  return inflightRefresh
}

/**
 * Reprise de session au démarrage : tente un refresh silencieux (le cookie
 * persiste au rechargement). `true` si la session vaut encore, `false` sinon.
 */
export async function restoreSession(): Promise<boolean> {
  try {
    await refresh()
    return true
  } catch {
    clearAccessToken()
    return false
  }
}

/**
 * Requête métier authentifiée. Sur `401` (access token expiré), tente **un**
 * refresh puis rejoue **une seule fois**. Si le refresh échoue → on vide la
 * mémoire et on relève l'erreur (l'appelant renvoie à la connexion).
 */
export async function authedRequest<T>(
  method: string,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  try {
    return await apiRequest<T>(method, path, options)
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) {
      try {
        await refresh()
      } catch {
        clearAccessToken()
        throw error
      }
      return apiRequest<T>(method, path, options)
    }
    throw error
  }
}
