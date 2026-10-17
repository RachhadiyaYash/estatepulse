import { supabase } from "../../supabase.js";

/* ------------------------------------------------------------------ */
/*  Queries                                                            */
/* ------------------------------------------------------------------ */

/** Fetch all leads (newest first). */
export async function getLeads() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Fetch one lead by id. */
export async function getLeadById(id) {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/* ------------------------------------------------------------------ */
/*  Mutations                                                          */
/* ------------------------------------------------------------------ */

/** Insert a new lead row (already-serialized payload) and return it. */
export async function addLead(lead) {
  const { data, error } = await supabase
    .from("leads")
    .insert([lead])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a lead's pipeline stage. The `updated_at` DB default keeps the
 * timestamp fresh. Prefer this over a generic update for stage changes so
 * the modal can also write a matching `lead_activity` row.
 *
 * NOTE: right after `ALTER TABLE leads ADD COLUMN stage`, Supabase's
 * PostgREST schema cache can lag and throw:
 *   "Could not find the 'stage' column of 'leads' in the schema cache"
 * even though the column exists (verify via information_schema). If that
 * happens, reload the schema cache in Dashboard > Project Settings > API
 * (or re-run `NOTIFY pgrst, 'reload schema';`) and retry. The wrapper below
 * re-throws with that hint attached.
 */
export async function updateLeadStage(leadId, newStage) {
  const { data, error } = await supabase
    .from("leads")
    .update({ stage: newStage })
    .eq("id", leadId)
    .select()
    .single();

  if (error) {
    if (isStageSchemaCacheError(error)) {
      throw new Error(
        "leads.stage not visible to the API yet (stale schema cache). Reload the schema cache in Supabase (Settings > API) and retry."
      );
    }
    throw error;
  }
  return data;
}

/** True when PostgREST hasn't picked up the new `stage` column yet. */
export function isStageSchemaCacheError(error) {
  const msg = error?.message || "";
  return /stage.*schema cache|schema cache.*stage/i.test(msg);
}

/** Generic lead patch (non-stage fields). */
export async function updateLead(id, updates) {
  const { data, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Delete a lead (its activity rows cascade). */
export async function deleteLead(id) {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
  return true;
}

/* ------------------------------------------------------------------ */
/*  Shape mapping: DB row <-> UI model                                 */
/*                                                                     */
/*  DB columns come from your `public.leads` table (see secrets):      */
/*  id, client_name, client_mobile, client_email, target_project,      */
/*  budget_min, budget_max, intent_source (HOT|WARM|COLD),              */
/*  lead_source, agent, stage, created_at, updated_at.                 */
/*                                                                     */
/*  The UI model keeps the old field names (name, phone, email,        */
/*  projectName, budget, score, stage, source, assignedAgentName, ...)  */
/*  so LeadsPage / LeadsTable / LeadCard / Dashboard keep working.     */
/* ------------------------------------------------------------------ */

function formatBudget(min, max) {
  const fmt = (n) => {
    if (n == null || n === "") return null;
    const num = Number(n);
    if (Number.isNaN(num)) return null;
    if (num >= 1_00_00_000) return `₹${(num / 1_00_00_000).toFixed(num % 1_00_00_000 === 0 ? 0 : 1)}Cr`;
    if (num >= 1_00_000) return `₹${(num / 1_00_000).toFixed(num % 1_00_000 === 0 ? 0 : 1)}L`;
    return `₹${num.toLocaleString("en-IN")}`;
  };
  const lo = fmt(min);
  const hi = fmt(max);
  if (lo && hi) return `${lo} - ${hi}`;
  return lo ?? hi ?? "—";
}

function parseBudgetInput(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number") return value;
  const cleaned = String(value).replace(/[₹,\s]/g, "");
  const lakh = cleaned.match(/^([\d.]+)L$/i);
  if (lakh) return Number(lakh[1]) * 1_00_000;
  const cr = cleaned.match(/^([\d.]+)Cr$/i);
  if (cr) return Number(cr[1]) * 1_00_00_000;
  const range = cleaned.match(/^([\d.]+)[-–]([\d.]+)(L|Cr)?$/i);
  if (range) {
    const mult = range[3]?.toLowerCase() === "cr" ? 1_00_00_000 : range[3]?.toLowerCase() === "l" ? 1_00_000 : 1;
    return Number(range[1]) * mult;
  }
  const num = Number(cleaned);
  return Number.isNaN(num) ? null : num;
}

/** DB row -> UI lead used across the app. */
export function deserializeLead(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.client_name ?? "",
    phone: row.client_mobile ?? "",
    email: row.client_email ?? "",
    projectId: row.target_project ?? "",
    projectName: row.target_project ?? "General Inquiry",
    budget: formatBudget(row.budget_min, row.budget_max),
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    score: row.intent_source ?? "WARM",
    stage: row.stage ?? "new",
    source: row.lead_source ?? "",
    assignedAgentId: row.agent ?? "",
    assignedAgentName: row.agent ?? "",
    company: "",
    lastContacted: row.updated_at
      ? new Date(row.updated_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "",
    timeline: [],
  };
}

/**
 * UI form -> DB insert payload.
 * `form` holds the AddLeadModal fields (name, phone, email, budget,
 * projectId, agentId, score, source); `meta` carries resolved
 * project/agent display names.
 */
export function serializeLead(form, meta = {}) {
  const budgetValue = parseBudgetInput(form.budget);
  return {
    client_name: form.name?.trim() ?? "",
    client_mobile: form.phone?.trim() || null,
    client_email: form.email?.trim() || null,
    target_project: meta.projectName || form.projectId || null,
    budget_min: budgetValue,
    budget_max: budgetValue,
    intent_source: form.score || "WARM",
    lead_source: form.source || null,
    agent: meta.agentName || form.agentId || null,
    stage: "new",
  };
}
