import { useSyncExternalStore } from "react";
import { supabase } from "../../supabase.js";
import { deserializeProperty } from "./properties.js";

/**
 * Live properties cache shared by ProjectsPage, AddLeadModal and
 * BookAppointmentModal. Any insert via addPropertyFlow() refreshes every
 * subscriber, so the "Target Development / Project" dropdowns pick up a new
 * development immediately without a reload.
 */

let cache = [];
let loaded = false;
let loading = null;
const listeners = new Set();

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return cache;
}

async function fetchAll() {
  if (!loading) {
    loading = (async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      cache = (data ?? []).map(deserializeProperty);
      loaded = true;
      notify();
      return cache;
    })();
    try {
      await loading;
    } finally {
      loading = null;
    }
  }
  return loading;
}

/** Refresh the cache (call after insert). Returns the fresh list. */
export async function refreshProperties() {
  loading = null;
  return fetchAll();
}

/** React hook: live deserialized property list (triggers a fetch on mount). */
export function useProperties() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  if (!loaded && !loading) {
    fetchAll().catch(() => {
      /* consumers render their own fallback */
    });
  }
  return list;
}
