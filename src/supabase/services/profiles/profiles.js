import { supabase } from "../../supabase.js";

/* ------------------------------------------------------------------ */
/*  Queries                                                            */
/* ------------------------------------------------------------------ */

/** Fetch all portal users (newest last-modified first, then by name). */
export async function getProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, contact_number, role")
    .order("first_name", { ascending: true })
    .order("last_name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(deserializeProfile).filter(Boolean);
}

/* ------------------------------------------------------------------ */
/*  Normalizers                                                        */
/* ------------------------------------------------------------------ */

/** DB row -> UI user used across the app's agent/broker pickers. */
export function deserializeProfile(row) {
  if (!row) return null;
  const firstName = row.first_name ?? "";
  const lastName = row.last_name ?? "";
  const name =
    `${firstName} ${lastName}`.trim() ||
    (row.email ? row.email.split("@")[0] : "") ||
    "User";
  return {
    id: row.id,
    email: row.email ?? "",
    firstName,
    lastName,
    name,
    contactNumber: row.contact_number ?? "",
    role: row.role ?? "user",
  };
}
