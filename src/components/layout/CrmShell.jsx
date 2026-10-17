import CrmProvider from '../../context/CrmProvider'
import AppLayout from './AppLayout'

/** CRM state only exists while signed in, so it resets cleanly on logout/login. */
export default function CrmShell() {
  return (
    <CrmProvider>
      <AppLayout />
    </CrmProvider>
  )
}
