/**
 * Erreurs de l'API, typées d'après le contrat (§1.2/§1.3).
 *
 * Deux formes de corps d'erreur existent :
 * - **métier** : `{ error: { code, message, context, violations? } }` — `code`
 *   stable non traduit, `message` affichable, `context` sans identifiant interne.
 * - **auth** (401) : `{ code: 401, message: "Invalid credentials." }` — pas de
 *   code métier ; une seule conduite : renvoyer à la connexion.
 *
 * `X-Request-Id` (§1.5) est porté par l'erreur : à afficher dans tout message
 * d'erreur montré à l'utilisateur (ADR-F14), c'est le lien avec le journal serveur.
 */

export interface ValidationViolation {
  readonly field: string
  readonly message: string
}

/** Erreur normalisée levée par le client API. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly context: Readonly<Record<string, unknown>> = {},
    readonly violations: readonly ValidationViolation[] = [],
    readonly requestId: string | null = null
  ) {
    super(message)
    this.name = 'ApiError'
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }
  get isForbidden(): boolean {
    return this.status === 403
  }
  get isNotFound(): boolean {
    return this.status === 404
  }
  get isConflict(): boolean {
    return this.status === 409
  }
  get isValidation(): boolean {
    return this.status === 422 || this.code === 'validation_failed'
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : null
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}

function parseViolations(value: unknown): ValidationViolation[] {
  if (!Array.isArray(value)) return []
  const result: ValidationViolation[] = []
  for (const raw of value) {
    const rec = asRecord(raw)
    if (rec && typeof rec.field === 'string') {
      result.push({ field: rec.field, message: asString(rec.message, '') })
    }
  }
  return result
}

/**
 * Construit une `ApiError` à partir du statut, du corps décodé (forme métier ou
 * auth) et de l'en-tête de corrélation.
 */
export function toApiError(
  status: number,
  body: unknown,
  requestId: string | null
): ApiError {
  const root = asRecord(body)
  if (root) {
    const envelope = asRecord(root.error)
    if (envelope) {
      return new ApiError(
        status,
        asString(envelope.code, 'unknown'),
        asString(envelope.message, ''),
        asRecord(envelope.context) ?? {},
        parseViolations(envelope.violations),
        requestId
      )
    }
    if ('code' in root || 'message' in root) {
      return new ApiError(
        status,
        asString(root.code, String(status)),
        asString(root.message, ''),
        {},
        [],
        requestId
      )
    }
  }
  return new ApiError(status, 'unknown', '', {}, [], requestId)
}
