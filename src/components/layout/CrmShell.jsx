import { useEffect } from 'react'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../hooks/useAuth'
import { resetCrmStore, setToast } from '../../store/crmStore'
import AppLayout from './AppLayout'

/** CRM state only exists while signed in, so it resets cleanly on logout/login. */
export default function CrmShell() {
  const { toast } = useToast()
  const { session } = useAuth()
  const initialRole = session?.role === 'agent' ? 'agent' : 'admin'

  // Bridge the React toast dispatcher into the external store.
  useEffect(() => {
    setToast(toast)
  }, [toast])

  // Re-seed the store each time the CRM shell mounts (i.e. per login).
  useEffect(() => {
    resetCrmStore(initialRole)
  }, [initialRole])

  return <AppLayout />
}
