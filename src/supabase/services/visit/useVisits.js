import { useSyncExternalStore } from "react";
import { getVisits } from "./visits.js";
import { mapVisitRowToAppointment } from "./visits.js";

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
      const rows = await getVisits();
      cache = (rows ?? []).map(mapVisitRowToAppointment);
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

/** Refresh the live cache (call after a create/update). */
export async function refreshVisits() {
  loading = null;
  return fetchAll();
}

/** React hook: live list of visits (fetches on first mount). */
export function useVisits() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  if (!loaded && !loading) {
    fetchAll().catch(() => {
      /* renders its own empty fallback */
    });
  }
  return list;
}
