import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Persist the session (localStorage by default) so a page refresh
    // can restore it. To keep the login for the current tab only, add:
    //   storage: window.sessionStorage,
    persistSession: true,
    // Renews the access token before it expires while the app is open.
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});