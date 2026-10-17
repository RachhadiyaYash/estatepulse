
import { supabase } from "../../supabase.js";

export async function getLeads() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addLead(lead) {
  const { data, error } = await supabase
    .from("leads")
    .insert([lead])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLeadById(id) {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

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

export async function deleteLead(id) {
  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/*  Table <-> UI shape mapping                                        */
/* ------------------------------------------------------------------ */

export function parseBudget(budget) {
  if (!budget) return { min: null, max: null }
  const match = String(budget).match(/\$?([\d.]+)\s*[-–]\s*\$?([\d.]+)\s*M?/)
  if (match) {
    const min = Number(match[1]) * 1e6
    const max = Number(match[2]) * 1e6
    return { min, max }
  }
  const single = String(budget).match(/\$?([\d.]+)\s*M?/)
  if (single) {
    const val = Number(single[1]) * 1e6
    return { min: val, max: val }
  }
  return { min: null, max: null }
}

export function formatBudget(min, max) {
  const m = (n) => (n == null ? null : `$${(n / 1e6).toFixed(1)}M`)
  const lo = m(min)
  const hi = m(max)
  if (!lo && !hi) return '$1.0M - $2.0M'
  if (!hi) return `${lo}+`
  if (lo === hi) return lo
  return `${lo} - ${hi}`
}

export function deserializeLead(row) {
  return {
    id: String(row.id),
    name: row.client_name ?? '',
    company: '',
    phone: row.client_mobile ?? '',
    email: row.client_email ?? '',
    projectId: '',
    projectName: row.target_project ?? 'General Inquiry',
    budget: formatBudget(row.budget_min, row.budget_max),
    score: row.intent_source === 'HOT' || row.intent_source === 'WARM' || row.intent_source === 'COLD'
      ? row.intent_source
      : 'WARM',
    stage: 'new',
    source: row.lead_source ?? 'Direct Web',
    assignedAgentId: row.agent ?? '',
    assignedAgentName: row.agent ?? 'Marcus Vance',
    lastContacted: 'Just now',
    timeline: [],
    createdAt: row.created_at ?? new Date().toISOString(),
  }
}

export function serializeLead(form, { projectName, agentName } = {}) {
  const { min, max } = parseBudget(form.budget)
  return {
    client_name: form.name,
    client_mobile: form.phone,
    client_email: form.email || null,
    target_project: projectName || 'General Inquiry',
    budget_min: min,
    budget_max: max,
    intent_source: form.score || 'WARM',
    lead_source: form.source || 'Direct Web',
    agent: agentName || null,
  }
}
