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
  const { modal } = useCrm()
  const Active = MODALS[modal.name]
  // key forces form state to reset every time a modal is (re)opened
  return Active ? <Active key={`${modal.name}-${modal.payload?.leadId ?? ''}`} /> : null
}
