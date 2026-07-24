/**
 * Provider central des raccourcis clavier (ADR-F20.5).
 *
 * Un **unique** écouteur `keydown` sur `window` — jamais de gestionnaire de
 * touches posé à la main dans un composant isolé. Les composants s'enregistrent
 * via `useShortcut` (raccourci) et `useShortcutScope` (portée active).
 *
 * Le matching passe par le cœur pur `resolveKey` (`match.ts`), qui compare par
 * `event.code`. Les séquences à deux touches (`g` puis `r`) expirent après un
 * délai. Un raccourci inéligible (portée inactive, `when` faux, focus dans un
 * champ) est **inerte**.
 */

import * as React from 'react'
import { isEditableTarget, resolveKey, type KeyEventLike } from './match'
import { GLOBAL_SCOPE, type KeyChord, type ShortcutDefinition } from './types'

/** Délai d'expiration d'une séquence amorcée (ms). */
const SEQUENCE_TIMEOUT_MS = 1200

interface ShortcutContextValue {
  register: (shortcut: ShortcutDefinition) => () => void
  activateScope: (scope: string) => () => void
  /** Raccourcis actuellement éligibles (portée active + `when`), pour l'aide `?`. */
  activeShortcuts: () => ShortcutDefinition[]
}

const ShortcutContext = React.createContext<ShortcutContextValue | null>(null)

export function ShortcutProvider({ children }: { children: React.ReactNode }) {
  // Registres mutables via refs : pas de re-render à chaque (dés)enregistrement.
  const shortcutsRef = React.useRef<Map<string, ShortcutDefinition>>(new Map())
  const scopeCountsRef = React.useRef<Map<string, number>>(new Map())
  const pendingRef = React.useRef<KeyChord | null>(null)
  const pendingTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  // Bump d'état pour rafraîchir l'aide `?` quand les raccourcis/portées changent.
  const [, forceVersion] = React.useReducer((v: number) => v + 1, 0)

  const isScopeActive = React.useCallback((scope: string): boolean => {
    if (scope === GLOBAL_SCOPE) return true
    return (scopeCountsRef.current.get(scope) ?? 0) > 0
  }, [])

  const register = React.useCallback(
    (shortcut: ShortcutDefinition) => {
      shortcutsRef.current.set(shortcut.id, shortcut)
      forceVersion()
      return () => {
        shortcutsRef.current.delete(shortcut.id)
        forceVersion()
      }
    },
    [forceVersion]
  )

  const activateScope = React.useCallback(
    (scope: string) => {
      const counts = scopeCountsRef.current
      counts.set(scope, (counts.get(scope) ?? 0) + 1)
      forceVersion()
      return () => {
        const next = (counts.get(scope) ?? 1) - 1
        if (next <= 0) counts.delete(scope)
        else counts.set(scope, next)
        forceVersion()
      }
    },
    [forceVersion]
  )

  const clearPending = React.useCallback(() => {
    pendingRef.current = null
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current)
      pendingTimerRef.current = null
    }
  }, [])

  const activeShortcuts = React.useCallback((): ShortcutDefinition[] => {
    return [...shortcutsRef.current.values()].filter(
      (s) =>
        isScopeActive(s.scope ?? GLOBAL_SCOPE) && (s.when ? s.when() : true)
    )
  }, [isScopeActive])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const inField = isEditableTarget(event.target)
      const eventLike: KeyEventLike = {
        code: event.code,
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
      }

      const isEligible = (s: ShortcutDefinition): boolean => {
        if (!isScopeActive(s.scope ?? GLOBAL_SCOPE)) return false
        if (inField && !s.allowInInput) return false
        if (s.when && !s.when()) return false // inerte, jamais d'erreur
        return true
      }

      const { fired, pending } = resolveKey(
        eventLike,
        [...shortcutsRef.current.values()],
        pendingRef.current,
        isEligible
      )

      if (fired) {
        clearPending()
        event.preventDefault()
        fired.handler()
        return
      }

      if (pending) {
        pendingRef.current = pending
        if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current)
        pendingTimerRef.current = setTimeout(clearPending, SEQUENCE_TIMEOUT_MS)
        return
      }

      clearPending()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isScopeActive, clearPending])

  const value = React.useMemo<ShortcutContextValue>(
    () => ({ register, activateScope, activeShortcuts }),
    [register, activateScope, activeShortcuts]
  )

  return (
    <ShortcutContext.Provider value={value}>
      {children}
    </ShortcutContext.Provider>
  )
}

function useShortcutContext(): ShortcutContextValue {
  const ctx = React.useContext(ShortcutContext)
  if (!ctx) {
    throw new Error('useShortcut* doit être utilisé dans <ShortcutProvider>')
  }
  return ctx
}

/**
 * Enregistre un raccourci le temps de vie du composant. La définition est lue
 * via une ref interne : le handler peut changer sans réenregistrer, et les
 * dépendances du useEffect restent stables (id/scope).
 */
export function useShortcut(shortcut: ShortcutDefinition): void {
  const { register } = useShortcutContext()
  const ref = React.useRef(shortcut)
  ref.current = shortcut

  React.useEffect(() => {
    // Enregistre une façade stable qui délègue à la dernière définition.
    return register({
      id: ref.current.id,
      sequence: ref.current.sequence,
      descriptionKey: ref.current.descriptionKey,
      displayKeys: ref.current.displayKeys,
      scope: ref.current.scope,
      allowInInput: ref.current.allowInInput,
      when: () => (ref.current.when ? ref.current.when() : true),
      handler: () => ref.current.handler(),
    })
    // Réenregistre seulement si l'identité/positions changent (le handler et
    // `when` restent à jour via la ref, sans réenregistrer).
  }, [
    register,
    shortcut.id,
    shortcut.scope,
    shortcut.allowInInput,
    JSON.stringify(shortcut.sequence),
  ])
}

/** Marque une portée active tant que le composant est monté. */
export function useShortcutScope(scope: string): void {
  const { activateScope } = useShortcutContext()
  React.useEffect(() => activateScope(scope), [activateScope, scope])
}

/** Accès à la liste des raccourcis actifs (aide `?`). */
export function useActiveShortcuts(): () => ShortcutDefinition[] {
  return useShortcutContext().activeShortcuts
}
