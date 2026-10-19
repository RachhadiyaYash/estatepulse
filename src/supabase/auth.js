import { supabase } from "./supabase.js";
import { useUserStore } from "../components/store/useUserStore.js";

/* ------------------------------------------------------------------ */
/*  Normalizers                                                        */
/* ------------------------------------------------------------------ */

/** Supabase profile.role ('admin' | 'user') -> app role ('admin' | 'agent'). */
function toAppRole(role) {
  return role === "admin" ? "admin" : "agent";
}

function normalizeProfile(row) {
  if (!row) return null;
  const firstName = row.first_name ?? "";
  const lastName = row.last_name ?? "";
  const name =
    `${firstName} ${lastName}`.trim() ||
    (row.email ? row.email.split("@")[0] : "") ||
    "User";
  return {
    id: row.id,
    email: row.email,
    firstName,
    lastName,
    name,
    contactNumber: row.contact_number ?? "",
    role: toAppRole(row.role),
  };
}

/** Builds the app-level session (with token + user + profile + role) for the store. */
function toSession(authSession, profile) {
  if (!authSession || !profile) return null;
  return {
    user: { id: profile.id, email: profile.email },
    role: profile.role, // 'admin' | 'agent'
    name: profile.name,
    email: profile.email,
    profile,
    access_token: authSession.access_token,
    refresh_token: authSession.refresh_token,
    expires_at: authSession.expires_at,
  };
}

function friendlyAuthError(error) {
  const msg = error?.message ?? "";
  if (/invalid login credentials/i.test(msg))
    return "Incorrect email or password.";
  if (/email not confirmed/i.test(msg))
    return "Please confirm your email before signing in.";
  if (/rate limit|too many/i.test(msg))
    return "Too many attempts. Please wait a moment and try again.";
  if (/fetch|network/i.test(msg))
    return "Network error. Check your connection and try again.";
  return msg || "Sign-in failed. Please try again.";
}

/* ------------------------------------------------------------------ */
/*  Profile + "get me"                                                 */
/* ------------------------------------------------------------------ */

/** Reads the signed-in user's own profile row (RLS allows `auth.uid() = id`). */
async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, contact_number, role")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return normalizeProfile(data);
}

/**
 * "Get me" API — resolves the current auth user + their profile row and
 * stores the token + data in the Zustand user store (not localStorage).
 * Throws if there is no active session.
 */
export async function getMe() {
  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();
  if (!authSession) throw new Error("Not logged in");

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Not logged in");

  const profile = await fetchProfile(user.id);
  const session = toSession(authSession, profile);
  useUserStore.getState().setAuth({ session, user, profile });
  return { user, profile, session };
}

/* ------------------------------------------------------------------ */
/*  Session lifecycle                                                  */
/* ------------------------------------------------------------------ */

/**
 * Signs in with email/password, loads the profile, and stores everything
 * in the user store. Resolves { ok: true, user, session } or { ok: false, error }.
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) return { ok: false, error: friendlyAuthError(error) };

  try {
    const profile = await fetchProfile(data.user.id);
    const session = toSession(data.session, profile);
    useUserStore.getState().setAuth({ session, user: data.user, profile });
    return { ok: true, user: profile, session };
  } catch (e) {
    return {
      ok: false,
      error: `Signed in, but failed to load your profile: ${e.message}`,
    };
  }
}

/** Signs out (closes the Supabase session) and clears the user store. */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } finally {
    useUserStore.getState().clearAuth();
  }
  return true;
}

/** Restores the session on app mount (no-op when nothing is stored). */
export async function restoreSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      useUserStore.getState().clearAuth();
      return null;
    }
    return await getMe();
  } catch {
    useUserStore.getState().clearAuth();
    return null;
  }
}

/** Sends a password-reset email via Supabase Auth. */
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: window.location.origin,
  });
  if (error) throw new Error(friendlyAuthError(error));
  return true;
}
