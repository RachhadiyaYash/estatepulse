import { useContext } from "react";
import { ToastContext } from "../context/ToastProvider";

/** const { toast } = useToast();  toast('Saved!', 'success') — types: info | success | warning | error | primary */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
