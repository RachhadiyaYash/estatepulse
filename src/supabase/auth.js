import { supabase } from './supabase.js'

/* ------------------------------------------------------------------ */
/*  Normalizers                                                        */
/* ------------------------------------------------------------------ */

/** Supabase profile.role ('admin' | 'user') -> app role ('admin' | 'agent'). */
function toAppRole(role) {
  return role === 'admin' ? 'admin' : 'agent'
}

function normalizeProfile(row) {
  if (!row) return null
  const firstName = row.first_name ?? ''
  const lastName = row.last_name ?? ''
  const name =
    `${firstName} ${lastName}`.trim() ||
    (row.email ? row.email.split('@')[0] : '') ||
    'User'
  return {
    id: row.id,
    email: row.email,
    firstName,
    lastName,
    name,
    contactNumber: row.contact_number ?? '',
    role: toAppRole(row.role),
  }
}

/** Builds the app-level session object consumed by AuthProvider / CrmShell / AdminRoute. */
function toSession(authSession, profile) {
  if (!authSession || !profile) return null
  return {
    user: { id: profile.id, email: profile.email },
    role: profile.role, // 'admin' | 'agent'
    name: profile.name,
    email: profile.email,
    profile,
  }
}

function friendlyAuthError(error) {
  const msg = error?.message ?? ''
  if (/invalid login credentials/i.test(msg)) return 'Incorrect email or password.'
  if (/email not confirmed/i.test(msg)) return 'Please confirm your email before signing in.'
  if (/rate limit|too many/i.test(msg)) return 'Too many attempts. Please wait a moment and try again.'
  if (/fetch|network/i.test(msg)) return 'Network error. Check your connection and try again.'
  return msg || 'Sign-in failed. Please try again.'
}

/* ------------------------------------------------------------------ */
/*  Profile                                                            */
/* ------------------------------------------------------------------ */

/** Reads the signed-in user's own profile row (RLS allows `auth.uid() = id`). */
export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, contact_number, role')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return normalizeProfile(data)
}

/* ------------------------------------------------------------------ */
/*  Session lifecycle                                                  */
/* ------------------------------------------------------------------ */

/** Restores any persisted session + profile (used on app mount). */
export async function getSessionProfile() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { session: null, profile: null }
  const profile = await fetchProfile(session.user.id)
  return { session: toSession(session, profile), profile }
}

/**
 * Signs in with email/password, then loads the profile row.
 * Resolves { ok: true, user, session } or { ok: false, error }.
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
  if (error) return { ok: false, error: friendlyAuthError(error) }

  let profile
  try {
    profile = await fetchProfile(data.user.id)
  } catch (e) {
    return { ok: false, error: `Signed in, but failed to load your profile: ${e.message}` }
  }
  if (!profile) {
    return {
      ok: false,
      error: 'No profile exists for this account. Please ask an administrator to add one.',
    }
  }
  return { ok: true, user: profile, session: toSession(data.session, profile) }
}

/** Signs out and clears the Supabase session. */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  return true
}

/** Sends a password-reset email via Supabase Auth. */
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: window.location.origin,
  })
  if (error) throw new Error(friendlyAuthError(error))
  return true
}
