import AppLayout from './AppLayout'

/** CRM data is fetched per-page from Supabase, so nothing needs re-seeding on login. */
export default function CrmShell() {
  return <AppLayout />
}

