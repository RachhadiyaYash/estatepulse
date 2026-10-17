import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import { useUserStore } from '../../store/useUserStore'
import { supabase } from '../../supabase/supabase'
import { signIn, signOut, restoreSession } from '../../supabase/auth'

/**
 * Thin context bridge over the Zustand user store. The Supabase session is
 * persisted by the Supabase client, so on refresh `restoreSession()` re-seeds
 * the in-memory store. This provider also listens for auth changes so the
 * store's token stays in sync when Supabase refreshes it.
 */
export default function AuthProvider({ children }) {
  const session = useUserStore((s) => s.session)
  const profile = useUserStore((s) => s.profile)
  const role = useUserStore((s) => s.role)
  const name = useUserStore((s) => s.name)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    // Restore the session (if any) on first load.
    ;(async () => {
      try {
        await restoreSession()
      } catch {
        /* no session — stay logged out */
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    // Keep the store in sync with Supabase. Only update the store here —
    // don't call other Supabase methods inside this callback (can deadlock).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, authSession) => {
      if (event === 'SIGNED_OUT') {
        useUserStore.getState().clearAuth()
      } else if (event === 'TOKEN_REFRESHED' && authSession) {
        const current = useUserStore.getState().session
        if (current) {
          useUserStore.setState({
            token: authSession.access_token,
            session: {
              ...current,
              access_token: authSession.access_token,
              refresh_token: authSession.refresh_token,
              expires_at: authSession.expires_at,
            },
          })
        }
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  /** Signs in via Supabase, loads the profile, and populates the store. */
  const login = useCallback(async ({ email, password }) => signIn(email, password), [])

  /** Signs out (closes the Supabase session) and clears the store. */
  const logout = useCallback(async () => { await signOut() }, [])

  const value = useMemo(
    () => ({
      session,
      profile,
      role,
      name,
      isAuthenticated: !!session,
      loading,
      login,
      logout,
    }),
    [session, profile, role, name, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}