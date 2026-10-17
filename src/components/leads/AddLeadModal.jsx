import { useState } from "react";
import { Modal, ModalBody } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Field, FormRow, Input, Select } from "../ui/Form";
import { useToast } from "../../hooks/useToast";
import { addLead, serializeLead } from "../../supabase/services/leads/leads";
import { PROJECTS, AGENTS } from "../../data/seed";

const AddLeadModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    budget: "",
    projectId: PROJECTS[0]?.id ?? "",
    agentId: AGENTS[0].id,
    score: "WARM",
    source: "Google Ads",
  });
  const [submitting, setSubmitting] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const project = PROJECTS.find((p) => p.id === form.projectId);
      const agent = AGENTS.find((a) => a.id === form.agentId);
      const row = serializeLead(form, {
        projectName: project ? project.name : "General Inquiry",
        agentName: agent ? agent.name : null,
      });
      await addLead(row);
      onClose();
    } catch (err) {
      toast(err.message || "Could not create lead. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Add Inbound Prospective Lead"
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Create &amp; Assign Lead
          </Button>
        </>
      }
    >
      <ModalBody>
        <Field label="Client Full Name *">
          <Input
            required
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Jonathan Vance"
          />
        </Field>
        <FormRow>
          <Field label="Phone Number *">
            <Input
              required
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="+1 (555) 000-0000"
            />
          </Field>
          <Field label="Email Address">
            <Input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="client@company.com"
            />
          </Field>
        </FormRow>
        <FormRow>
          <Field label="Target Development / Project">
            <Select required value={form.projectId} onChange={set("projectId")}>
              {PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.location})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Budget Range">
            <Input
              value={form.budget}
              onChange={set("budget")}
              placeholder="e.g. $1.5M - $2.5M"
            />
          </Field>
        </FormRow>
        <FormRow>
          <Field label="Intent Score">
            <Select value={form.score} onChange={set("score")}>
              <option value="HOT">
                Hot Lead (Ready to purchase &lt; 30 days)
              </option>
              <option value="WARM">Warm Lead (Exploring options)</option>
              <option value="COLD">Cold Lead (Long-term research)</option>
            </Select>
          </Field>
          <Field label="Lead Source">
            <Select value={form.source} onChange={set("source")}>
              <option value="Google Ads">Google Ads Campaign</option>
              <option value="Meta Ads">Meta / Instagram Ads</option>
              <option value="Direct Referral">Direct HNI Referral</option>
              <option value="Website Inbound">Website Form</option>
              <option value="Walk-in">Showroom Walk-in</option>
            </Select>
          </Field>
        </FormRow>
        <Field label="Assigned Broker / Agent">
          <Select value={form.agentId} onChange={set("agentId")}>
            {AGENTS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
      </ModalBody>
    </Modal>
  );
};
export default AddLeadModal;
