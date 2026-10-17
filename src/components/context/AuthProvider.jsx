import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import { useUserStore } from '../../store/useUserStore'
import { signIn, signOut, restoreSession } from '../../supabase/auth'

/**
 * Thin context bridge over the Zustand user store. The token/user/profile
 * live in `useUserStore` (in-memory, not localStorage); this provider runs
 * the session-restore effect and exposes the familiar `useAuth()` shape.
 */
export default function AuthProvider({ children }) {
  const session = useUserStore((s) => s.session)
  const profile = useUserStore((s) => s.profile)
  const role = useUserStore((s) => s.role)
  const name = useUserStore((s) => s.name)
  const [loading, setLoading] = useState(true)

  // Restore the session (if any) on first load.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await restoreSession()
      } catch {
        /* no session — stay logged out */
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
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
