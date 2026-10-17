import { create } from 'zustand'

/**
 * In-memory user/session store (Zustand). Deliberately NOT persisted to
 * localStorage — the token, user and profile live only for this tab session
 * and are cleared on logout. (No `persist` middleware on purpose.)
 */
export const useUserStore = create((set) => ({
  session: null, // normalized: { user, role, name, email, profile, access_token, refresh_token, expires_at }
  user: null, // raw Supabase auth user
  profile: null, // normalized profile row
  role: null, // 'admin' | 'agent'
  name: null, // display name (first + last)
  token: null, // access_token (convenience)

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  setAuth: ({ session, user, profile }) =>
    set({
      session,
      user,
      profile,
      role: profile?.role ?? null,
      name: profile?.name ?? null,
      token: session?.access_token ?? null,
    }),

  clearAuth: () =>
    set({
      session: null,
      user: null,
      profile: null,
      role: null,
      name: null,
      token: null,
    }),
}))
