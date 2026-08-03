/**
 * Access token — **en mémoire uniquement** (contrat §1.6, décision back 03/08).
 *
 * Rien n'est persisté côté JS : le refresh token vit dans un cookie `httpOnly`
 * que le JavaScript ne voit pas. L'access token (Bearer, 1 h) reste ici, en
 * variable de module, et disparaît au rechargement — la session est alors
 * reprise par un `refresh` silencieux (le cookie, lui, persiste).
 */

let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

export function clearAccessToken(): void {
  accessToken = null
}
