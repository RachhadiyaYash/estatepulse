import { create } from "zustand";

/**
 * Lightweight shared UI state (formerly part of crmStore): which modal is
 * currently open. Kept in a tiny zustand store so any page can open a modal
 * while <ModalHost /> renders it.
 */
export const useUiStore = create((set) => ({
  modal: { name: null, payload: null },
  openModal: (name, payload = null) => set({ modal: { name, payload } }),
  closeModal: () => set({ modal: { name: null, payload: null } }),
}));
