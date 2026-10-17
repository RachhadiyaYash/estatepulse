import { useEffect, useState } from "react";
import { Modal, ModalBody } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { Field, FormRow, Input, Select, Textarea } from "../../ui/Form";
import { useToast } from "../../../store/useToast";
import { getLeads, deserializeLead } from "../../../supabase/services/leads/leads";
import { useProperties } from "../../../supabase/services/properties/useProperties";
import { todayISO } from "../../../utils/format";

export const BookAppointmentModal = ({ initialLeadId, onClose }) => {
  const { toast } = useToast();
  const properties = useProperties();
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await getLeads();
        if (mounted) setLeads(rows.map(deserializeLead));
      } catch {
        if (mounted) setLeads([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const initialLead = initialLeadId ?? leads[0]?.id ?? "";
  const initialProject = ""; // resolved from the live list once loaded

  const [form, setForm] = useState({
    leadId: initialLead,
    projectId: initialProject,
    date: todayISO(),
    time: "10:00 AM",
    type: "VIP Show Villa Tour",
    pickup: false,
    notes: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const lead = leads.find((l) => l.id === form.leadId);
    const resolvedProjectId = form.projectId || properties[0]?.id || "";
    const project = properties.find((p) => String(p.id) === String(resolvedProjectId));
    toast(
      `Appointment confirmed for ${lead?.name ?? "client"} at ${project?.name ?? "selected project"} on ${form.date} at ${form.time}.`,
      "success",
    );
    onClose();
  };

  if (isLoading) {
    return (
      <Modal title="Schedule Property Site Visit / Tour" onClose={onClose}>
        <ModalBody>
          <div className="p-6 text-center text-on-surface-muted">
            Loading leads...
          </div>
        </ModalBody>
      </Modal>
    );
  }

  return (
    <Modal
      title="Schedule Property Site Visit / Tour"
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Confirm Appointment</Button>
        </>
      }
    >
      <ModalBody>
        <Field label="Select Prospective Lead">
          <Select required value={form.leadId} onChange={set("leadId")}>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} - {l.projectName} ({l.phone})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Development / Location">
          <Select required value={form.projectId} onChange={set("projectId")}>
            <option value="" disabled>
              {properties.length === 0 ? "No developments yet — add one first" : "Select a development"}
            </option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.location})
              </option>
            ))}
          </Select>
        </Field>
        <FormRow>
          <Field label="Tour Date">
            <Input
              required
              type="date"
              value={form.date}
              onChange={set("date")}
            />
          </Field>
          <Field label="Time Slot">
            <Select value={form.time} onChange={set("time")}>
              <option value="10:00 AM">10:00 AM (Morning Slot)</option>
              <option value="11:30 AM">11:30 AM</option>
              <option value="02:00 PM">02:00 PM (Afternoon)</option>
              <option value="03:30 PM">03:30 PM</option>
              <option value="05:00 PM">05:00 PM (Sunset Tour)</option>
            </Select>
          </Field>
        </FormRow>
        <Field label="Tour Type">
          <Select value={form.type} onChange={set("type")}>
            <option value="VIP Show Villa Tour">VIP Show Villa Tour</option>
            <option value="Site Construction Walkthrough">
              Site Construction Walkthrough
            </option>
            <option value="In-Office Contract Meeting">
              In-Office Contract Meeting
            </option>
            <option value="Virtual Video Consultation">
              Virtual Video Consultation
            </option>
          </Select>
        </Field>
        <Field>
          <label className="flex cursor-pointer items-center gap-2 text-[0.85rem]">
            <input
              type="checkbox"
              className="size-4 accent-accent"
              checked={form.pickup}
              onChange={(e) =>
                setForm((f) => ({ ...f, pickup: e.target.checked }))
              }
            />
            <span>Request VIP Chauffeur Pickup for Client</span>
          </label>
        </Field>
        <Field label="Specific Client Interests & Instructions">
          <Textarea
            rows={2}
            value={form.notes}
            onChange={set("notes")}
            placeholder="e.g. Focus on high-floor 3BHK penthouse with sea views, prepare coffee & financial breakdown."
          />
        </Field>
      </ModalBody>
    </Modal>
  );
};
export default BookAppointmentModal;
