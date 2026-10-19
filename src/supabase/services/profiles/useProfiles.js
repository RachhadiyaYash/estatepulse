import { useEffect, useState } from "react";
import { getProfiles } from "./profiles.js";

/**
 * Live portal-users cache shared by AddLeadModal, LeadsPage (agent filter)
 * and any other broker/agent picker. Fetches the `profiles` table once per
 * mount cycle and shares the result, so every dropdown lists the actual
 * portal users (first_name + last_name) instead of seed data.
 */
export function useProfiles() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await getProfiles();
        if (mounted) setUsers(rows);
      } catch {
        if (mounted) setUsers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { users, loading };
}
