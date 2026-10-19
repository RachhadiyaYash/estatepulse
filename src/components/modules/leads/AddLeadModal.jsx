import { useState } from "react";
import { Modal, ModalBody } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { Field, FormRow, Input, Select } from "../../ui/Form";
import { useToast } from "../../store/useToast";
import { addLead, serializeLead } from "../../../supabase/services/leads/leads";
import { recordLeadActivity } from "../../../supabase/services/leads/leadActivity";
import { useProperties } from "../../../supabase/services/properties/useProperties";
import { useProfiles } from "../../../supabase/services/profiles/useProfiles";

const AddLeadModal = ({ isOpen, onClose, onCreated }) => {
  const { toast } = useToast();
  const properties = useProperties();
  const { users, loading: usersLoading } = useProfiles();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    budgetMin: "",
    budgetMax: "",
    projectId: "",
    agentId: "",
    score: "WARM",
    source: "Google Ads",
  });
  const [submitting, setSubmitting] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Default the agent selection to the first portal user once the list loads.
  const defaultAgentId = users[0]?.id ?? "";

  const submit = async (e) => {
    e.preventDefault();
    const budgetMin = Number(form.budgetMin);
    const budgetMax = Number(form.budgetMax);
    if (!Number.isFinite(budgetMin) || budgetMin <= 0) {
      toast("Enter a valid minimum price.", "error");
      return;
    }
    if (!Number.isFinite(budgetMax) || budgetMax < budgetMin) {
      toast("Maximum price must be >= minimum price.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const resolvedProjectId = form.projectId || properties[0]?.id || "";
      const project = properties.find(
        (p) => String(p.id) === String(resolvedProjectId),
      );
      const agentId = form.agentId || defaultAgentId;
      const agent = users.find((u) => String(u.id) === String(agentId));
      const row = serializeLead(
        { ...form, projectId: resolvedProjectId },
        {
          projectName: project ? project.name : "General Inquiry",
          agentName: agent ? agent.name : null,
        },
      );
      const created = await addLead(row);
      try {
        await recordLeadActivity({
          leadId: created.id,
          activityType: "Lead Created",
          stage: "new",
          note: `Lead created from ${form.source}. Assigned to ${agent ? agent.name : "unassigned"}.`,
        });
      } catch (activityErr) {
        console.error("Failed to record lead creation activity:", activityErr);
      }
      onClose();
      toast("Lead created & assigned.", "success");
      onCreated?.(created);
    } catch (err) {
      toast(err.message || "Could not create lead. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
        </Field>{" "}
        <Field label="Target Development / Project">
          <Select required value={form.projectId} onChange={set("projectId")}>
            <option value="" disabled>
              {properties.length === 0
                ? "No developments yet — add one first"
                : "Select a development"}
            </option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.location})
              </option>
            ))}
          </Select>
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
          <Field label="Minimum Price (Rs) *">
            <Input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.budgetMin}
              onChange={set("budgetMin")}
              placeholder="e.g. 12000000"
            />
          </Field>
          <Field label="Maximum Price (Rs) *">
            <Input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.budgetMax}
              onChange={set("budgetMax")}
              placeholder="e.g. 40000000"
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
          <Select
            value={form.agentId || defaultAgentId}
            onChange={set("agentId")}
          >
            <option value="" disabled>
              {usersLoading
                ? "Loading portal users…"
                : users.length === 0
                  ? "No portal users found"
                  : "Select a portal user"}
            </option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
                {u.email ? ` (${u.email})` : ""}
              </option>
            ))}
          </Select>
        </Field>
      </ModalBody>
    </Modal>
  );
};
export default AddLeadModal;
