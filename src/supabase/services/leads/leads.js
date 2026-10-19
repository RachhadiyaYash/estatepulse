import { supabase } from "../../supabase.js";
import { formatLakhRange } from "../../../components/utils/format.js";

/* ------------------------------------------------------------------ */
/*  Queries                                                            */
/* ------------------------------------------------------------------ */

/** Fetch all leads (newest first). Kept for backward compatibility. */
export async function getLeads() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch leads with server-side filtering (no pagination — full result set).
 *
 * @param {Object} params
 * @param {string} [params.search] - free-text searched against name, phone, email, project
 * @param {string} [params.stage] - pipeline stage key (new | contacted | site_visit | ...)
 * @param {string} [params.score] - intent score (HOT | WARM | COLD)
 * @param {string} [params.agentId] - assigned agent id (or display name)
 * @param {string} [params.agentName] - assigned agent display name (preferred)
 * @param {AbortSignal} [params.signal] - optional abort signal for cancellation
 * @returns {Promise<{ data: any[], count: number }>}
 */
export async function getLeadsFiltered({
  search,
  stage,
  score,
  agentId,
  agentName,
  signal,
} = {}) {
  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Allow query cancellation (e.g. fast filter typing)
  if (signal) query = query.abortSignal(signal);

  // Server-side filters — `ilike` without wildcards behaves as a
  // case-insensitive equality check, so "marcus vance" still matches
  // "Marcus Vance" and "new" still matches "New Lead" if the DB ever
  // stores labels instead of keys.
  if (stage) query = query.ilike("stage", String(stage).trim());
  if (score)
    query = query.ilike("intent_source", String(score).trim().toUpperCase());
  // `agent` column stores the display name (see serializeLead) — accept id or name
  const agentFilter = agentName ?? agentId;
  if (agentFilter) query = query.ilike("agent", String(agentFilter).trim());

  // Server-side search across the client-facing columns.
  // Escape PostgREST `or` special chars (comma, parens, %) to avoid 400s.
  if (search && String(search).trim()) {
    const q = String(search)
      .trim()
      .slice(0, 100)
      .replace(/[%(),]/g, "")
      .replace(/\s+/g, " ");
    if (q) {
      query = query.or(
        `client_name.ilike.%${q}%,client_mobile.ilike.%${q}%,client_email.ilike.%${q}%,target_project.ilike.%${q}%`,
      );
    }
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: data ?? [],
    count: count ?? (data ?? []).length,
  };
}

/** @deprecated Use getLeadsFiltered instead (pagination removed). */
export const getLeadsPaginated = getLeadsFiltered;

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
        "leads.stage not visible to the API yet (stale schema cache). Reload the schema cache in Supabase (Settings > API) and retry.",
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

/** Portal-wide display: budget range in lakhs (e.g. "₹120 L - ₹400 L"). */
function formatBudget(min, max) {
  return formatLakhRange(min, max);
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
    const mult =
      range[3]?.toLowerCase() === "cr"
        ? 1_00_00_000
        : range[3]?.toLowerCase() === "l"
          ? 1_00_000
          : 1;
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
 * `form` holds the AddLeadModal fields (name, phone, email, budgetMin,
 * budgetMax, projectId, agentId, score, source); `meta` carries resolved
 * project/agent display names.
 */
export function serializeLead(form, meta = {}) {
  const budgetMin = parseBudgetInput(form.budgetMin);
  const budgetMax = parseBudgetInput(form.budgetMax);
  return {
    client_name: form.name?.trim() ?? "",
    client_mobile: form.phone?.trim() || null,
    client_email: form.email?.trim() || null,
    target_project: meta.projectName || form.projectId || null,
    budget_min: budgetMin,
    budget_max: budgetMax ?? budgetMin,
    intent_source: form.score || "WARM",
    lead_source: form.source || null,
    agent: meta.agentName || form.agentId || null,
    stage: "new",
  };
}
