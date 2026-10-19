import { useState, useEffect } from "react";
import { Modal, ModalBody } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { ScoreBadge } from "../../ui/Badge";
import { Field, FormRow, Select, Textarea, FilterSelect } from "../../ui/Form";
import { STAGES } from "../../constants/pipeline";
import { useToast } from "../../store/useToast";
import {
  getLeadById,
  deserializeLead,
  updateLeadStage,
  isStageSchemaCacheError,
} from "../../../supabase/services/leads/leads";
import {
  getLeadActivity,
  recordLeadActivity,
} from "../../../supabase/services/leads/leadActivity";

const ACTIVITY_TYPES = [
  "Phone Call",
  "WhatsApp Conversation",
  "In-Person Meeting",
  "Site Walkthrough",
  "Offer / Price Negotiation",
];

function Stat({ caption, children }) {
  return (
    <div>
      <div className="text-[0.58rem] font-extrabold tracking-widest text-on-surface-muted uppercase">
        {caption}
      </div>
      {children}
    </div>
  );
}

const stageLabel = (key) => STAGES.find((s) => s.key === key)?.label ?? key;

function formatDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const LeadDetailModal = ({ leadId, onClose }) => {
  const { toast } = useToast();
  const [lead, setLead] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [followup, setFollowup] = useState({
    type: ACTIVITY_TYPES[0],
    stage: "",
    note: "",
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [row, acts] = await Promise.all([
          getLeadById(leadId),
          getLeadActivity(leadId),
        ]);
        if (!mounted) return;
        setLead(deserializeLead(row));
        setTimeline(acts ?? []);
      } catch (err) {
        if (mounted) toast(`Failed to load lead: ${err.message}`, "error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [leadId, toast]);

  const refresh = async () => {
    const [row, acts] = await Promise.all([
      getLeadById(leadId),
      getLeadActivity(leadId),
    ]);
    setLead(deserializeLead(row));
    setTimeline(acts ?? []);
  };

  const changeStage = async (newStage) => {
    if (!newStage || !lead || newStage === lead.stage || saving) return;
    const label = stageLabel(newStage);
    setSaving(true);
    try {
      // Record the timeline row FIRST so notes/history survive even if the
      // leads.stage write hits a stale PostgREST schema cache.
      await recordLeadActivity({
        leadId: lead.id,
        activityType: "Stage Changed",
        stage: newStage,
        updateStage: newStage,
        note: `Pipeline stage updated to ${label}.`,
      });
      try {
        await updateLeadStage(lead.id, newStage);
      } catch (stageErr) {
        await refresh();
        if (isStageSchemaCacheError(stageErr)) {
          toast(
            "Activity recorded. Stage update pending: reload the Supabase schema cache, then retry the stage change.",
            "warning",
          );
        } else {
          toast(
            `Activity recorded, but stage update failed: ${stageErr.message}`,
            "warning",
          );
        }
        return;
      }
      await refresh();
      toast(`Stage updated to ${label}.`, "success");
    } catch (err) {
      toast(`Failed to update stage: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;
  if (!lead) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!followup.note.trim()) {
      toast("Please enter follow-up activity notes.", "warning");
      return;
    }
    const newStage =
      followup.stage && followup.stage !== lead.stage ? followup.stage : null;
    setSaving(true);
    try {
      // Record the timeline row FIRST (same reason as changeStage above):
      // discussion notes must survive even if the leads.stage write fails.
      await recordLeadActivity({
        leadId: lead.id,
        activityType: followup.type,
        stage: newStage || lead.stage,
        updateStage: newStage,
        note: followup.note.trim(),
      });
      if (newStage) {
        try {
          await updateLeadStage(lead.id, newStage);
        } catch (stageErr) {
          setFollowup((f) => ({ ...f, stage: "", note: "" }));
          await refresh();
          if (isStageSchemaCacheError(stageErr)) {
            toast(
              "Activity recorded. Stage update pending: reload the Supabase schema cache, then retry the stage change.",
              "warning",
            );
          } else {
            toast(
              `Activity recorded, but stage update failed: ${stageErr.message}`,
              "warning",
            );
          }
          return;
        }
      }
      await refresh();
      toast("Follow-up activity recorded.", "success");
      setFollowup((f) => ({ ...f, stage: "", note: "" }));
    } catch (err) {
      toast(`Failed to record activity: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      size="lg"
      title={lead.name}
      subtitle={lead.company || "Individual Buyer"}
      onClose={onClose}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <ModalBody>
        <div className="mb-6 grid grid-cols-2 gap-3 rounded-md border border-outline-subtle bg-surface-dim p-4 lg:grid-cols-4">
          <Stat caption="Interest Project">
            <div className="font-bold text-accent">{lead.projectName}</div>
          </Stat>
          <Stat caption="Budget Bracket">
            <div className="font-bold text-on-surface">{lead.budget}</div>
          </Stat>
          <Stat caption="Assigned Broker">
            <div className="font-semibold text-on-surface">
              {lead.assignedAgentName}
            </div>
          </Stat>
          <Stat caption="Lead Intent Score">
            <ScoreBadge score={lead.score} />
          </Stat>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-outline-subtle pb-4">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[0.85rem]">
            <span>
              <i className="fas fa-phone text-on-surface-muted" /> {lead.phone}
            </span>
            <span>
              <i className="fas fa-envelope text-on-surface-muted" />{" "}
              {lead.email}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                toast(
                  `Initiating VOIP call to ${lead.name} (${lead.phone})...`,
                  "info",
                )
              }
            >
              <i className="fas fa-phone" /> Call
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="text-success"
              onClick={() =>
                toast(
                  `Opening WhatsApp chat thread for ${lead.name}...`,
                  "success",
                )
              }
            >
              <i className="fab fa-whatsapp" /> WhatsApp
            </Button>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-md bg-surface-dim px-4 py-3">
          <span className="text-[0.82rem] font-semibold">
            Current Pipeline Stage:
          </span>
          <FilterSelect
            className="w-55"
            value={lead.stage}
            onChange={(e) => changeStage(e.target.value)}
            disabled={saving}
          >
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.step}
              </option>
            ))}
          </FilterSelect>
        </div>

        <form
          onSubmit={submit}
          className="mb-6 rounded-md border border-outline-subtle bg-surface-dim p-4"
        >
          <h4 className="mb-3 text-[0.88rem] font-bold text-on-surface">
            Log Follow-up Activity / Note
          </h4>
          <FormRow>
            <Field label="Activity Type">
              <Select
                value={followup.type}
                onChange={(e) =>
                  setFollowup((f) => ({ ...f, type: e.target.value }))
                }
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="Update Stage (Optional)">
              <Select
                value={followup.stage}
                onChange={(e) =>
                  setFollowup((f) => ({ ...f, stage: e.target.value }))
                }
              >
                <option value="">Keep current stage</option>
                <option value="contacted">Move to Contacted</option>
                <option value="site_visit">Move to Site Visit Scheduled</option>
                <option value="negotiation">Move to Negotiation</option>
                <option value="won">Move to Deal Won</option>
              </Select>
            </Field>
          </FormRow>
          <Field label="Discussion Notes & Client Response">
            <Textarea
              rows={2}
              required
              value={followup.note}
              onChange={(e) =>
                setFollowup((f) => ({ ...f, note: e.target.value }))
              }
              placeholder="e.g. Client requested developer financing details and will confirm 3BHK visit next Friday."
            />
          </Field>
          <div className="flex justify-end">
            <Button size="sm" type="submit" loading={saving}>
              <i className="fas fa-plus-circle" /> Record Activity
            </Button>
          </div>
        </form>

        <h4 className="mb-2 text-[0.88rem] font-bold text-on-surface">
          Activity History &amp; Timeline
        </h4>
        <div className="relative mt-5 pl-7 before:absolute before:top-1 before:bottom-1 before:left-2 before:w-px before:bg-outline-subtle">
          {timeline.length === 0 && (
            <div className="text-on-surface-muted">
              No follow-up activity yet.
            </div>
          )}
          {timeline.map((item) => (
            <div key={item.id} className="relative mb-3">
              <span className="absolute top-3.5 -left-6.25 flex size-4.5 items-center justify-center rounded-full border border-outline-subtle bg-surface-card">
                <span className="size-1.5 rounded-full bg-accent" />
              </span>
              <div className="rounded-md border border-outline-subtle bg-surface-card p-3">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.68rem] font-bold text-accent">
                    {item.activity_type}
                  </span>
                  <span className="text-[0.7rem] text-on-surface-muted">
                    {formatDateTime(item.created_at)}
                  </span>
                </div>
                {item.activity_update_stage && (
                  <div className="mb-1 text-[0.72rem] font-semibold text-accent">
                    Stage → {stageLabel(item.activity_update_stage)}
                  </div>
                )}
                <p className="text-[0.8rem] text-on-surface-variant">
                  {item.activity_note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default LeadDetailModal;
