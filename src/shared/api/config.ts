/**
 * Configuration de l'accès à l'API (ADR-F09).
 *
 * L'URL de base inclut `/api/v1`. En dev, elle pointe sur le tunnel SSH
 * (`localhost:8080`) — voir `docs/cadrage/2026-08-03-v1-auth-party-lecture.md`.
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1'

/** Routes d'authentification : cookie `Path=/api/v1/auth` → `credentials:'include'`. */
export const AUTH_PATHS = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
} as const
