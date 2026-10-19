import { supabase } from "../../supabase.js";

/** ------------------------------------------------------------------ */
/*  Queries                                                            */
/* ------------------------------------------------------------------ */

/** Fetch all visits, newest first by date then time. */
export async function getVisits() {
  const { data, error } = await supabase
    .from("visits_with_lead")
    .select("*")
    .order("visit_date", { ascending: true })
    .order("visit_time", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Fetch visits for a specific date (calendar / list). */
export async function getVisitsByDate(date) {
  const { data, error } = await supabase
    .from("visits_with_lead")
    .select("*")
    .eq("visit_date", date)
    .order("visit_time", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Fetch visits for a lead (e.g. "Prospective Lead" detail view). */
export async function getVisitsByLeadId(leadId) {
  const { data, error } = await supabase
    .from("visits_with_lead")
    .select("*")
    .eq("lead_id", leadId)
    .order("visit_date", { ascending: true })
    .order("visit_time", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** ------------------------------------------------------------------ */
/*  Normalizers                                                        */
/* ------------------------------------------------------------------ */

/**
 * Map a raw Supabase row from `public.visits` (optionally via the
 * `visits_with_lead` join view) into the appointment shape consumed by
 * the appointments page / AppointmentItem.
 *
 * DB columns            -> appointment fields
 * ---------------------------------------------------------------
 * lead_id               -> leadId
 * client_name (view)    -> leadName
 * client_mobile (view)  -> leadPhone
 * property_name         -> siteName / location
 * visit_date            -> visitDate / date
 * visit_time            -> time
 * visit_type            -> type
 * vip_chauffeur_pickup  -> pickupRequired
 * vip_chauffeur_pickup_address -> pickupLocation
 * client_interests_instructions -> notes
 * agent                 -> agentName
 * visit_completed       -> status
 */
export function mapVisitRowToAppointment(row) {
  if (!row) return null;
  return {
    id: row.id,
    leadId: row.lead_id,
    leadName: row.client_name ?? "",
    leadPhone: row.client_mobile ?? "",
    clientName: row.client_name ?? "",
    clientPhone: row.client_mobile ?? "",
    siteName: row.property_name ?? row.target_project ?? "",
    projectName: row.target_project ?? row.property_name ?? "",
    location: row.property_name ?? "",
    visitDate: row.visit_date ?? null,
    date: row.visit_date ?? "",
    displayDate: formatDisplayDate(row.visit_date ?? ""),
    time: row.visit_time ?? "",
    type: row.visit_type ?? "",
    status: row.visit_completed ? "Completed" : "Scheduled",
    pickupRequired: Boolean(row.vip_chauffeur_pickup),
    pickupLocation: row.vip_chauffeur_pickup_address ?? "",
    notes: row.client_interests_instructions ?? "",
    agentName: row.agent ?? "",
  };
}

/** Parse a `YYYY-MM-DD` date-only string as local midnight. */
const parseDateOnly = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  if (!m) return new Date(iso);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

const formatDisplayDate = (iso) => {
  if (!iso) return "";
  // Date-only strings otherwise parse as UTC midnight, which shifts the day
  // in some timezones and surfaces a phantom time ("5:30 AM" in IST).
  const d = parseDateOnly(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const options = { month: "short", day: "numeric" };
  if (d.toDateString() === today.toDateString()) {
    return "Today, " + d.toLocaleDateString("en-US", options);
  }
  if (d.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow, " + d.toLocaleDateString("en-US", options);
  }
  return d.toLocaleDateString("en-US", { weekday: "long", ...options });
};

/* ------------------------------------------------------------------ */
/*  Mutations                                                          */ 
/* ------------------------------------------------------------------ */

/**
 * Insert a new visit into `public.visits`.
 * Payload keys match the DB columns directly (see BookAppointmentModal).
 */
export async function createVisit(payload) {
  const { data, error } = await supabase
    .from("visits")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Update an existing visit row. */
export async function updateVisit(visitId, patch) {
  const { data, error } = await supabase
    .from("visits")
    .update(patch)
    .eq("id", visitId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Mark a visit as completed in the database.
 */
export async function completeVisit(visitId) {
  const { error } = await supabase
    .from("visits")
    .update({ visit_completed: true })
    .eq("id", visitId);

  if (error) throw error;
}
