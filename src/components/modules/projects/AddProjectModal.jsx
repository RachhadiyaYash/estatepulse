import { useState } from "react";
import { Modal, ModalBody } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { Field, FormRow, Input, Select, Textarea } from "../../ui/Form";
import { useUiStore } from "../../store/useUiStore";
import { useToast } from "../../store/useToast";
import {
  addProperty,
  uploadPropertyImage,
} from "../../../supabase/services/properties/properties";
import { refreshProperties } from "../../../supabase/services/properties/useProperties";

const STATUS_OPTIONS = [
  { value: "prelaunch", label: "Pre-Launch" },
  { value: "under_development", label: "Under Construction" },
  { value: "ready_to_move", label: "Ready to Move" },
];

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export default function AddProjectModal() {
  const { closeModal } = useUiStore();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [status, setStatus] = useState("prelaunch");
  const [totalUnits, setTotalUnits] = useState("");
  const [availableUnits, setAvailableUnits] = useState("");
  const [handoverMonth, setHandoverMonth] = useState("");
  const [configText, setConfigText] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [saving, setSaving] = useState(false);

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    setImageError("");
    if (!file) {
      setImage(null);
      setPreview("");
      return;
    }
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setImageError("Only JPEG or PNG images are allowed.");
      setImage(null);
      setPreview("");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image must be 2 MB or smaller.");
      setImage(null);
      setPreview("");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!image) {
      setImageError("A cover image (JPEG/PNG, max 2 MB) is required.");
      return;
    }
    const lo = Number(priceMin);
    const hi = Number(priceMax);
    if (!Number.isFinite(lo) || lo < 0) {
      toast("Enter a valid minimum price.", "error");
      return;
    }
    if (!Number.isFinite(hi) || hi < lo) {
      toast("Maximum price must be >= minimum price.", "error");
      return;
    }
    const total = parseInt(totalUnits, 10);
    const avail = parseInt(availableUnits, 10);
    if (!Number.isInteger(total) || total < 0) {
      toast("Enter a valid total unit count.", "error");
      return;
    }
    if (!Number.isInteger(avail) || avail < 0 || avail > total) {
      toast("Available units must be between 0 and total units.", "error");
      return;
    }
    setSaving(true);
    try {
      const imagePath = await uploadPropertyImage(image);
      const configurations = configText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      await addProperty({
        name: name.trim(),
        address: address.trim(),
        price_min: lo,
        price_max: hi,
        status,
        total_units: total,
        available_units: avail,
        handover_date: handoverMonth ? `${handoverMonth}-01` : null,
        overview_description: description.trim() || null,
        image_path: imagePath,
        configurations,
      });
      await refreshProperties();
      toast("New development added to inventory!", "success");
      closeModal();
    } catch (err) {
      toast(err.message || "Could not save development.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Register New Real Estate Development"
      onClose={closeModal}
      onSubmit={submit}
      footer={
        <>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save Development
          </Button>
        </>
      }
    >
      <ModalBody>
        <Field label="Development Name *">
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lumina Heights"
          />
        </Field>
        <Field label="Location / Address *">
          <Input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Marina Boulevard"
          />
        </Field>
        <FormRow>
          <Field label="Minimum Price (Rs) *">
            <Input
              required
              type="number"
              min="0"
              step="0.01"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="e.g. 12000000"
            />
          </Field>
          <Field label="Maximum Price (Rs) *">
            <Input
              required
              type="number"
              min="0"
              step="0.01"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="e.g. 40000000"
            />
          </Field>
        </FormRow>
        <FormRow>
          <Field label="Project Status *">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Target Handover (Month)">
            <Input
              type="month"
              value={handoverMonth}
              onChange={(e) => setHandoverMonth(e.target.value)}
            />
          </Field>
        </FormRow>
        <FormRow>
          <Field label="Total Units *">
            <Input
              required
              type="number"
              min="0"
              value={totalUnits}
              onChange={(e) => setTotalUnits(e.target.value)}
              placeholder="80"
            />
          </Field>
          <Field label="Available Units *">
            <Input
              required
              type="number"
              min="0"
              value={availableUnits}
              onChange={(e) => setAvailableUnits(e.target.value)}
              placeholder="80"
            />
          </Field>
        </FormRow>
        <Field label="Cover Image (JPEG/PNG, max 2 MB) *">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={pickImage}
          />
          {imageError && (
            <div className="mt-1 text-[0.75rem] font-semibold text-error">
              {imageError}
            </div>
          )}
          {preview && (
            <img
              src={preview}
              alt="Cover preview"
              className="mt-2 h-32 w-full rounded-md border border-outline-subtle object-cover"
            />
          )}
        </Field>
        <Field label="Unit Configurations (one per line)">
          <Textarea
            rows={3}
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
            placeholder="2 BHK (1,450 sq.ft)"
          />
        </Field>
        <Field label="Project Overview Description">
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe highlights, amenities, and USPs..."
          />
        </Field>
      </ModalBody>
    </Modal>
  );
}
