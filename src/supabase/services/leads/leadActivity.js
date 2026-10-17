import { supabase } from "../../supabase.js";

/**
 * Lead activity / timeline service.
 *
 * The `lead_activity` table stores one row per event: stage changes,
 * follow-up notes, lead creation, etc. Columns:
 *   id, lead_id, current_status, activity_type,
 *   activity_update_stage, activity_note, created_at, created_by
 * (`created_by` defaults to `auth.uid()` and `created_at` to `now()`).
 *
 * Rows are returned newest-first so the modal renders the latest first.
 */

/** Fetch every activity row for a lead (newest first). */
export async function getLeadActivity(leadId) {
  const { data, error } = await supabase
    .from("lead_activity")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Append one activity row for a lead.
 * `created_by`/`created_at` are filled by DB defaults — never send them
 * from the client (the RLS WITH CHECK requires created_by = auth.uid(),
 * which only the default satisfies).
 *
 * @param {object} p
 * @param {string|number} p.leadId
 * @param {string} p.activityType - e.g. 'Stage Changed' | 'Phone Call' | 'Lead Created'
 * @param {string} [p.stage] - pipeline stage at the time of the event (current_status)
 * @param {string|null} [p.updateStage] - new stage when this event moves the pipeline
 * @param {string} [p.note] - discussion notes / client response text
 */
export async function recordLeadActivity({ leadId, activityType, stage, updateStage, note }) {
  const { data, error } = await supabase
    .from("lead_activity")
    .insert({
      lead_id: leadId,
      current_status: stage || "new",
      activity_type: activityType,
      activity_update_stage: updateStage || null,
      activity_note: note || "",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Alias kept for convenience. */
export const addLeadActivity = recordLeadActivity;
