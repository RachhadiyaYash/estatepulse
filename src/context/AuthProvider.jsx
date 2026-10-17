import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../data/seed'

const KEY = 'ep_session'

function readSession() {
  try {
    const raw = localStorage.getItem(KEY) || sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)

  /** Fake async login against the demo accounts. Resolves { ok, error } */
  const login = useCallback(async ({ email, password, role, remember }) => {
    await new Promise((r) => setTimeout(r, 900))
    const user = DEMO_ACCOUNTS[email.trim().toLowerCase()]
    if (!user || password !== DEMO_PASSWORD || user.role !== role) {
      const error =
        user && user.role !== role
          ? `This account is registered as ${user.role === 'admin' ? 'an Administrator' : 'an Agent'}. Switch the role above.`
          : 'Incorrect email or password. Try the demo credentials below.'
      return { ok: false, error }
    }
    const next = { email: email.trim().toLowerCase(), name: user.name, role: user.role, at: Date.now() }
    try {
      ;(remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(next))
    } catch {
      /* storage blocked */
    }
    setSession(next)
    return { ok: true, user: next }
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(KEY)
      sessionStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({ session, isAuthenticated: !!session, login, logout }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
