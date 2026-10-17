import { useCrm } from '../../hooks/useCrm'
import AddLeadModal from '../leads/AddLeadModal'
import AddProjectModal from './AddProjectModal'
import BookAppointmentModal from './BookAppointmentModal'
import LeadDetailModal from '../leads/LeadDetailModal'

const MODALS = {
  addLead: AddLeadModal,
  addProject: AddProjectModal,
  bookAppointment: BookAppointmentModal,
  leadDetail: LeadDetailModal,
}

/** Renders whichever modal is currently open (see openModal in useCrm) */
export default function ModalHost() {
  const { modal, closeModal } = useCrm()
  const Active = MODALS[modal.name]
  if (!Active) return null

  // AddLeadModal now uses isOpen/onClose props instead of useCrm
  if (modal.name === 'addLead') {
    return (
      <Active
        isOpen={true}
        onClose={closeModal}
        key={`${modal.name}-${modal.payload?.leadId ?? ''}`}
      />
    )
  }

  // LeadDetailModal uses leadId/onClose props instead of useCrm
  if (modal.name === 'leadDetail') {
    return (
      <Active
        leadId={modal.payload?.leadId}
        onClose={closeModal}
        key={`leadDetail-${modal.payload?.leadId ?? ''}`}
      />
    )
  }

  // key forces form state to reset every time a modal is (re)opened
  return <Active key={`${modal.name}-${modal.payload?.leadId ?? ''}`} />
}
