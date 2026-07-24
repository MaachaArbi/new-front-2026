/**
 * Types du registre de raccourcis clavier (ADR-F20.5).
 *
 * Principe cardinal : un raccourci se base sur la **position physique** de la
 * touche (`event.code`, ex. `KeyR`), **jamais** sur le caractère produit
 * (`event.key`). Sinon il casse dès qu'un utilisateur passe en disposition
 * arabe — une large part des utilisateurs cibles. `event.code` est stable quelle
 * que soit la disposition.
 */

/**
 * Un « accord » : une touche (par position) + des modificateurs. Un raccourci
 * est une séquence de 1 (`Ctrl+K`) ou 2 accords (Gmail : `g` puis `r`).
 */
export interface KeyChord {
  /**
   * `event.code` — position physique (ex. `KeyG`, `KeyK`, `Slash`). C'est le
   * mode par défaut et la règle (ADR-F20.5).
   */
  code?: string
  /**
   * `event.key` — caractère produit. **Exception documentée**, réservée aux
   * affordances définies par leur glyphe (ex. « ? » pour l'aide), jamais pour
   * une action. La casse/disposition y est volontairement ignorée.
   */
  key?: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
}

export interface ShortcutDefinition {
  /** Identifiant unique (dé-duplication, désenregistrement). */
  id: string
  /** Séquence de 1 ou 2 accords. */
  sequence: KeyChord[]
  /** Clé i18n de la description (découvrabilité `?`). */
  descriptionKey: string
  /** Représentation lisible pour le composant `Kbd` (ex. `['G','R']`, `['Ctrl','K']`). */
  displayKeys: string[]
  /** Portée : `global` (défaut) ou un identifiant de contexte (liste, modale…). */
  scope?: string
  /**
   * Condition d'activation. Si elle renvoie `false`, le raccourci est **inerte**
   * — il ne déclenche rien et ne produit **aucune** erreur (ADR-F20.5). C'est
   * l'accroche pour les permissions (S8), déclarée ici, non câblée.
   */
  when?: () => boolean
  /** Action déclenchée. */
  handler: () => void
  /**
   * Autorise le déclenchement même quand le focus est dans un champ de saisie.
   * Défaut `false` : un raccourci ne perturbe pas la frappe de texte.
   */
  allowInInput?: boolean
}

/** Portée globale par défaut. */
export const GLOBAL_SCOPE = 'global'
