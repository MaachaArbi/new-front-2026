/**
 * Registre de raccourcis clavier (ADR-F20.5) — point d'entrée unique.
 *
 * Raccourcis basés sur la **position physique** (`event.code`), séquences à deux
 * touches, portées, découvrabilité `?`, accroche permissions (`when`, inerte).
 */

export type { KeyChord, ShortcutDefinition } from './types'
export { GLOBAL_SCOPE } from './types'
export {
  ShortcutProvider,
  useShortcut,
  useShortcutScope,
  useActiveShortcuts,
} from './shortcut-provider'
export { ShortcutHelp } from './shortcut-help'
export {
  eventMatchesChord,
  resolveKey,
  chordFromEvent,
  isEditableTarget,
  type KeyEventLike,
  type ResolveResult,
} from './match'
