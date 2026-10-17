import { create } from 'zustand'

/**
 * In-memory user/session store (Zustand). Nothing is persisted to localStorage:
 * the token, user and profile live only for this tab session and are cleared
 * on logout. The in-memory Supabase session (persistSession: false) re-seeds
 * this store on refresh via the AuthProvider restore effect.
 */
export const useUserStore = create((set) => ({
  session: null,
  user: null,
  profile: null,
  role: null,
  name: null,
  token: null,

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
