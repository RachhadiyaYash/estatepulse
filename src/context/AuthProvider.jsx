import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import { getSessionProfile, signIn, signOut } from '../supabase/auth'

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore any persisted Supabase session + profile on first load.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { session: s } = await getSessionProfile()
        if (!cancelled) setSession(s)
      } catch {
        if (!cancelled) setSession(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  /** Signs in via Supabase and loads the profile. Resolves { ok, error, user }. */
  const login = useCallback(async ({ email, password }) => {
    const res = await signIn(email, password)
    if (res.ok) setSession(res.session)
    return res
  }, [])

  /** Signs out (closes the Supabase session) and clears local state. */
  const logout = useCallback(async () => {
    try {
      await signOut()
    } catch {
      /* ignore network errors on sign-out; still clear local state */
    }
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      profile: session?.profile ?? null,
      isAuthenticated: !!session,
      loading,
      login,
      logout,
    }),
    [session, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
