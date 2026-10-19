import { useUiStore } from "../store/useUiStore";
import AddLeadModal from "../modules/leads/AddLeadModal";
import AddProjectModal from "../modules/projects/AddProjectModal";
import BookAppointmentModal from "../modules/appointments/BookAppointmentModal";
import LeadDetailModal from "../modules/leads/LeadDetailModal";

const MODALS = {
  addLead: AddLeadModal,
  addProject: AddProjectModal,
  bookAppointment: BookAppointmentModal,
  leadDetail: LeadDetailModal,
};

/** Renders whichever modal is currently open (see useUiStore) */
export default function ModalHost() {
  const { modal, closeModal } = useUiStore();
  const Active = MODALS[modal.name];
  if (!Active) return null;

  // AddLeadModal uses isOpen/onClose props
  if (modal.name === "addLead") {
    return (
      <Active
        isOpen={true}
        onClose={closeModal}
        key={`${modal.name}-${modal.payload?.leadId ?? ""}`}
      />
    );
  }

  // LeadDetailModal uses leadId/onClose props
  if (modal.name === "leadDetail") {
    return (
      <Active
        leadId={modal.payload?.leadId}
        onClose={closeModal}
        key={`leadDetail-${modal.payload?.leadId ?? ""}`}
      />
    );
  }

  // BookAppointmentModal uses initialLeadId/onClose props
  if (modal.name === "bookAppointment") {
    return (
      <Active
        initialLeadId={modal.payload?.leadId}
        onClose={closeModal}
        key={`bookAppointment-${modal.payload?.leadId ?? ""}`}
      />
    );
  }

  // key forces form state to reset every time a modal is (re)opened
  return <Active key={`${modal.name}-${modal.payload?.leadId ?? ""}`} />;
}
