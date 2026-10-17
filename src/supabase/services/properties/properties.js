import { supabase } from "../../supabase.js";

/**
 * Properties service — backed by the `public.properties` table:
 *   id, name, address, price_min, price_max, status
 *   (ready_to_move | under_development | prelaunch),
 *   total_units, available_units, booked_units (generated),
 *   handover_date, overview_description, image_path, configurations (jsonb),
 *   created_at, updated_at.
 *
 * Cover images live in the `property-images` storage bucket (see
 * propertyImages.sql); only the storage path is stored in `image_path`.
 */

export async function getProperties() {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Insert a new property row and return it. */
export async function addProperty(payload) {
  const { data, error } = await supabase
    .from("properties")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Upload a cover image (jpeg/png, max 2 MB) to the `property-images` bucket
 * and return the storage path to persist in `properties.image_path`.
 */
export async function uploadPropertyImage(file) {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowed.includes(file?.type)) {
    throw new Error("Only JPEG or PNG images are allowed.");
  }
  const MAX_BYTES = 2 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 2 MB or smaller.");
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from("property-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw error;
  return path;
}

/** Public URL for a stored image path (bucket must be public — see SQL). */
export function getPropertyImageUrl(imagePath) {
  if (!imagePath) return "";
  const { data } = supabase.storage
    .from("property-images")
    .getPublicUrl(imagePath);
  return data?.publicUrl ?? "";
}

/**
 * DB row -> UI project. Keeps the old seed shape (id, name, location,
 * status, tone, priceRange, totalUnits, availableUnits, bookedUnits,
 * completion, cover, description, unitTypes) so ProjectsPage / AddLeadModal /
 * BookAppointmentModal keep working unchanged.
 */
export function deserializeProperty(row) {
  if (!row) return null;
  const statusMap = {
    ready_to_move: "Ready to Move",
    under_development: "Under Construction",
    prelaunch: "Pre-Launch",
  };
  const toneMap = {
    ready_to_move: "success",
    under_development: "primary",
    prelaunch: "warning",
  };
  const fmtINR = (n) => {
    if (n == null || n === "") return null;
    const num = Number(n);
    if (Number.isNaN(num)) return null;
    if (num >= 1_00_00_000)
      return `₹${(num / 1_00_00_000).toFixed(num % 1_00_00_000 === 0 ? 0 : 1)}Cr`;
    if (num >= 1_00_000)
      return `₹${(num / 1_00_000).toFixed(num % 1_00_000 === 0 ? 0 : 1)}L`;
    return `₹${num.toLocaleString("en-IN")}`;
  };
  const lo = fmtINR(row.price_min);
  const hi = fmtINR(row.price_max);
  const configs = Array.isArray(row.configurations)
    ? row.configurations.map((c) =>
        typeof c === "string" ? c : c?.label || c?.name || JSON.stringify(c)
      )
    : [];
  return {
    id: row.id,
    name: row.name ?? "",
    location: row.address ?? "",
    status: statusMap[row.status] ?? "Pre-Launch",
    statusKey: row.status ?? "prelaunch",
    tone: toneMap[row.status] ?? "warning",
    priceRange:
      lo && hi ? `${lo} - ${hi}` : lo ?? hi ?? "—",
    totalUnits: row.total_units ?? 0,
    availableUnits: row.available_units ?? 0,
    bookedUnits:
      row.booked_units ?? (row.total_units ?? 0) - (row.available_units ?? 0),
    completion: row.handover_date
      ? new Date(row.handover_date).toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "",
    cover: getPropertyImageUrl(row.image_path),
    description: row.overview_description ?? "",
    unitTypes: configs,
  };
}
