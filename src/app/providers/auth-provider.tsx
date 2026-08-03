'use client'

import * as React from 'react'
import {
  login as sessionLogin,
  logout as sessionLogout,
  restoreSession,
} from '@/shared/auth/session'
import { fetchMe, type Me } from '@/shared/auth/me'

/**
 * Provider d'authentification. Il possède le cycle de session :
 * - au montage, **reprise silencieuse** (`restoreSession` → cookie httpOnly) puis
 *   `/me` ; sinon → non connecté ;
 * - `login`/`logout` exposés à l'UI.
 *
 * `/me` est chargé ici (pas via TanStack Query) : c'est l'amorçage de session,
 * pas de la donnée métier.
 */

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  status: AuthStatus
  me: Me | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<AuthStatus>('loading')
  const [me, setMe] = React.useState<Me | null>(null)

  const loadIdentity = React.useCallback(async () => {
    const identity = await fetchMe()
    setMe(identity)
    setStatus('authenticated')
  }, [])

  React.useEffect(() => {
    let cancelled = false
    void (async () => {
      const alive = await restoreSession()
      if (cancelled) return
      if (!alive) {
        setStatus('unauthenticated')
        return
      }
      try {
        await loadIdentity()
      } catch {
        if (!cancelled) setStatus('unauthenticated')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadIdentity])

  const login = React.useCallback(
    async (email: string, password: string) => {
      await sessionLogin(email, password)
      await loadIdentity()
    },
    [loadIdentity]
  )

  const logout = React.useCallback(async () => {
    await sessionLogout()
    setMe(null)
    setStatus('unauthenticated')
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({ status, me, login, logout }),
    [status, me, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  }
  return context
}
