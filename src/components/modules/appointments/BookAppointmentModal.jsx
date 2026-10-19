import { useEffect, useMemo, useState } from "react";
import { Modal, ModalBody } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { Field, FormRow, Input, Select, Textarea } from "../../ui/Form";
import { useToast } from "../../store/useToast";
import { getLeads } from "../../../supabase/services/leads/leads";
import { useProperties } from "../../../supabase/services/properties/useProperties";
import { getProfiles } from "../../../supabase/services/profiles/profiles";
import { createVisit } from "../../../supabase/services/visit/visits";
import { refreshVisits } from "../../../supabase/services/visit/useVisits";
import { todayISO } from "../../utils/format.js";

/** ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Convert a raw Supabase leads row into the UI lead model. */
function toUiLead(row) {
  return {
    id: row?.id ?? "",
    name: row?.client_name ?? "",
    phone: row?.client_mobile ?? "",
    email: row?.client_email ?? "",
    siteName: row?.target_project ?? "",
    targetProject: row?.target_project ?? "",
  };
}

/** Convert a raw Supabase leads row into the UI lead model. */
// eslint-disable-next-line react-refresh/only-export-components
export function normalizeLead(row) {
  return toUiLead(row);
}

/** -------------------------------------------------------------------------- */
/*  BookAppointmentModal                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Schedule a site visit / tour.
 *
 * Flow:
 *  1. Pick a Prospective Lead → shows Client name, Site name, Mobile.
 *  2. Pick Development / Location (site name + location) from the property
 *     table, filtered to the lead's target project.
 *  3. Tour Date / Time / Type.
 *  4. VIP Chauffeur Pickup → if Yes, show address + Google Maps picker.
 *  5. Notes.
 *  6. Assign Agent (all portal users from the profiles table).
 */
export const BookAppointmentModal = ({ initialLeadId, onClose }) => {
  const { toast } = useToast();
  const properties = useProperties();

  const [leads, setLeads] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // ---- Load leads + portal users (agents) on mount ---------------------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const leadRows = await getLeads();
        if (mounted) setLeads(leadRows.map(normalizeLead).filter(Boolean));
        const profileRows = await getProfiles();
        if (mounted) setProfiles(profileRows);
      } catch {
        if (mounted) setLeads([]);
      } finally {
        if (mounted) {
          setProfilesLoading(false);
          setIsLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /** Default lead selection: the lead the modal was opened with, else first. */
  const initialLead = initialLeadId ?? leads[0]?.id ?? "";
  const [form, setForm] = useState({
    leadId: initialLead,
    date: todayISO(),
    time: "10:00 AM",
    type: "VIP Show Villa Tour",
    pickup: false,
    pickupAddress: "",
    notes: "",
    agentId: "",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // ---- Derived state ---------------------------------------------------- */
  const selectedLead =
    leads.find((l) => String(l.id) === String(form.leadId)) ?? null;

  // Filter properties to the lead's current target project, fall back to all.
  const propertiesList = useMemo(() => {
    if (!selectedLead?.targetProject) return properties;
    const matched = properties.filter(
      (p) => String(p.name) === String(selectedLead.targetProject),
    );
    return matched.length > 0 ? matched : properties;
  }, [properties, selectedLead]);

  // True only when the list above is actually narrowed to the lead's target.
  const isFilteredToLead =
    Boolean(selectedLead?.targetProject) && propertiesList !== properties;

  // Default the property to the lead's target project (if any).
  const [defaultProperty, setDefaultProperty] = useState(() => {
    if (selectedLead?.targetProject) {
      const match = properties.find(
        (p) => String(p.name) === String(selectedLead.targetProject),
      );
      if (match) return match.id;
    }
    return properties[0]?.id ?? "";
  });

  // When a lead is picked, pre-select its site name in the property dropdown.
  const handleLeadChange = (e) => {
    const leadId = e.target.value;
    setForm((f) => ({ ...f, leadId }));
    const lead = leads.find((l) => String(l.id) === String(leadId));
    if (lead?.targetProject) {
      const match = properties.find(
        (p) => String(p.name) === String(lead.targetProject),
      );
      setDefaultProperty(match?.id ?? "");
    } else {
      setDefaultProperty("");
    }
  };

  // ---- Submit ----------------------------------------------------------- */
  const submit = async (e) => {
    e.preventDefault();
    if (!form.leadId) {
      toast("Please select a Prospective Lead.", "error");
      return;
    }
    if (!defaultProperty) {
      toast("Please select a Development / Location.", "error");
      return;
    }
    if (!form.date) {
      toast("Please pick a Tour Date.", "error");
      return;
    }
    if (!form.time) {
      toast("Please pick a Time Slot.", "error");
      return;
    }
    if (!form.type) {
      toast("Please pick a Tour Type.", "error");
      return;
    }
    if (form.pickup && !form.pickupAddress.trim()) {
      toast("Enter a chauffeur pickup address (Google Maps).", "error");
      return;
    }
    if (!form.agentId) {
      toast("Please assign an Agent.", "error");
      return;
    }

    try {
      const property = properties.find(
        (p) => String(p.id) === String(defaultProperty),
      );
      const agent = profiles.find((u) => String(u.id) === String(form.agentId));
      const payload = {
        lead_id: Number(form.leadId),
        property_name: property?.name ?? "",
        visit_date: form.date,
        visit_time: form.time,
        visit_type: form.type,
        vip_chauffeur_pickup: form.pickup,
        vip_chauffeur_pickup_address: form.pickup
          ? form.pickupAddress.trim()
          : null,
        client_interests_instructions: form.notes,
        agent: agent?.name ?? "",
      };
      await createVisit(payload);
      await refreshVisits();
      toast("Site visit scheduled successfully!", "success");
      onClose();
    } catch (err) {
      toast(
        err.message || "Could not schedule the visit. Please try again.",
        "error",
      );
    }
  };

  // ---- Render ----------------------------------------------------------- */
  if (isLoading) {
    return (
      <Modal title="Schedule Property Site Visit / Tour" onClose={onClose}>
        <ModalBody>
          <div className="p-6 text-center text-on-surface-muted">
            Loading leads & portal users…
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
        {/* ---------- 1. Prospective Lead ---------- */}
        <Field label="Select Prospective Lead">
          <Select required value={form.leadId} onChange={handleLeadChange}>
            <option value="" disabled>
              {leads.length === 0
                ? "No leads yet"
                : "Select a prospective lead"}
            </option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} — {l.siteName || "No site"} — ({l.phone})
              </option>
            ))}
          </Select>
        </Field>

        {selectedLead && (
          <div className="ml-6 mb-6 pl-6 border-l-2 border-brand/30 space-y-2">
            <p className="text-sm font-semibold text-on-surface">
              <i className="fas fa-user mr-2 text-brand" />
              {selectedLead.name}
            </p>
            <p className="text-sm text-on-surface-muted">
              <i className="fas fa-building mr-2 text-brand" />
              Site: {selectedLead.siteName || "—"}
            </p>
            <p className="text-sm text-on-surface-muted">
              <i className="fas fa-phone mr-2 text-brand" />
              {selectedLead.phone}
            </p>
            {selectedLead.email && (
              <p className="text-sm text-on-surface-muted">
                <i className="fas fa-envelope mr-2 text-brand" />
                {selectedLead.email}
              </p>
            )}
          </div>
        )}

        {/* ---------- 2. Development / Location ---------- */}
        <Field label="Development / Location (Site Name + Location)">
          <Select
            value={defaultProperty}
            onChange={(e) => setDefaultProperty(e.target.value)}
            disabled={propertiesList.length === 0}
          >
            <option value="" disabled>
              {propertiesList.length === 0
                ? "No developments yet — add one first"
                : selectedLead
                  ? `Select site for ${selectedLead.name}`
                  : "Select a development"}
            </option>
            {propertiesList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.location})
              </option>
            ))}
          </Select>
          {propertiesList.length > 0 && (
            <p className="mt-1 text-[0.72rem] text-on-surface-muted">
              {propertiesList.length} development
              {propertiesList.length === 1 ? "" : "s"} shown
              {isFilteredToLead && selectedLead
                ? ` for this lead (filtered by ${selectedLead.name})`
                : ""}
            </p>
          )}
        </Field>

        {/* ---------- 3. Tour Date / Time / Type ---------- */}
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
              <option value="10:00 AM">10:00 AM (Morning)</option>
              <option value="11:30 AM">11:30 AM</option>
              <option value="02:00 PM">02:00 PM (Afternoon)</option>
              <option value="03:30 PM">03:30 PM</option>
              <option value="05:00 PM">05:00 PM (Sunset)</option>
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

        {/* ---------- 4. VIP Chauffeur Pickup ---------- */}
        <Field label="Request VIP Chauffeur Pickup for Client">
          <label className="flex cursor-pointer items-center gap-2 text-[0.85rem]">
            <input
              type="checkbox"
              className="size-4 accent-accent"
              checked={form.pickup}
              onChange={(e) =>
                setForm((f) => ({ ...f, pickup: e.target.checked }))
              }
            />
            <span>Request VIP Chauffeur Pickup</span>
          </label>
        </Field>

        {form.pickup && (
          <div className="mt-2 space-y-2 rounded-md border border-outline-subtle bg-surface-dim p-3">
            <Input
              value={form.pickupAddress}
              onChange={(e) =>
                setForm((f) => ({ ...f, pickupAddress: e.target.value }))
              }
              placeholder="Enter address (e.g. 123 Palm Coastline Dr, Palm Beach)"
              className="font-mono"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-1"
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  form.pickupAddress,
                )}`;
                window.open(url, "_blank", "noopener,noreferrer");
              }}
            >
              <i className="fas fa-map-marked-alt mr-1" /> Open Google Maps
            </Button>
            {form.pickupAddress && (
              <p className="text-[0.72rem] text-on-surface-muted">
                <i className="fas fa-link mr-1" /> Open the link above to select
                / verify the pickup address.
              </p>
            )}
          </div>
        )}

        {/* ---------- 5. Notes ---------- */}
        <Field label="Specific Client Interests & Instructions">
          <Textarea
            rows={2}
            value={form.notes}
            onChange={set("notes")}
            placeholder="e.g. Focus on high-floor 3BHK penthouse with sea views, prepare coffee & financial breakdown."
          />
        </Field>

        {/* ---------- 6. Assigned Agent ---------- */}
        <Field label="Assigned Agent">
          <Select
            value={form.agentId}
            onChange={set("agentId")}
            disabled={profilesLoading}
          >
            <option value="" disabled>
              {profilesLoading ? "Loading portal users…" : "Select an agent"}
            </option>
            {profiles.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </Select>
          {profiles.length === 0 && (
            <p className="mt-1 text-[0.72rem] text-on-surface-muted">
              No portal users found — add agent profiles in Profiles.
            </p>
          )}
        </Field>
      </ModalBody>
    </Modal>
  );
};

export default BookAppointmentModal;
