import { useSyncExternalStore, useMemo } from 'react'
import {
  AGENTS, APPOINTMENTS, CURRENT_AGENT_ID, LEADS, PROJECTS, USERS,
} from '../data/seed'

const uid = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`

/* ------------------------------------------------------------------ */
/*  Toast bridge                                                       */
/*  The store lives outside React, so it can't call useToast() itself. */
/*  CrmShell registers the real toast dispatcher here on mount.        */
/* ------------------------------------------------------------------ */
let notify = () => {}
export function setToast(fn) {
  notify = typeof fn === 'function' ? fn : () => {}
}

/* ------------------------------------------------------------------ */
/*  Store state (single source of truth, replaces the old Context)      */
/* ------------------------------------------------------------------ */
function initialState(role = 'admin') {
  return {
    role,
    leads: LEADS,
    projects: PROJECTS,
    appointments: APPOINTMENTS,
    search: '',
    modal: { name: null, payload: null },
  }
}

let state = initialState()
const listeners = new Set()

function setState(patch) {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Returns the cached state object; only its identity changes when state updates. */
function getSnapshot() {
  return state
}

/** Re-initializes the store (fresh seed data + given role) and notifies subscribers. */
export function resetCrmStore(role = 'admin') {
  state = initialState(role)
  listeners.forEach((listener) => listener())
}

/* ------------------------------------------------------------------ */
/*  Actions                                                            */
/* ------------------------------------------------------------------ */
export function setSearch(search) {
  setState({ search })
}



export function openModal(name, payload = null) {
  setState({ modal: { name, payload } })
}

export function closeModal() {
  setState({ modal: { name: null, payload: null } })
}

export function addProject(form) {
  const units = parseInt(form.units, 10) || 50
  const project = {
    id: uid('proj'),
    name: form.name,
    location: form.location,
    type: form.type,
    status: 'Pre-Launch',
    tone: 'warning',
    priceRange: form.price,
    totalUnits: units,
    availableUnits: units,
    bookedUnits: 0,
    completion: form.completion,
    assignedAgents: ['agent-1', 'agent-2'],
    cover: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    description: form.description,
    unitTypes: ['2 BHK Luxury', '3 BHK Skyline Suite', '4 BHK Penthouse Collection'],
  }
  setState({ projects: [project, ...state.projects] })
  notify('New development added to inventory!', 'success')
}

export function completeAppointment(aptId) {
  setState({
    appointments: state.appointments.map((a) =>
      a.id === aptId ? { ...a, status: 'Completed' } : a,
    ),
  })
  notify('Appointment marked as Completed!', 'success')
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */
/** Drop-in replacement for the old useCrm(): same shape, backed by the external store. */
export function useCrmStore() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  // Recompute only when the snapshot identity changes, so downstream
  // useMemo/useEffect deps (e.g. visibleAppointments) stay referentially stable.
  return useMemo(() => {
    const isAgent = s.role === 'agent'
    const user = isAgent ? USERS.agent : USERS.admin
    const visibleLeads = isAgent
      ? s.leads.filter((l) => l.assignedAgentId === CURRENT_AGENT_ID)
      : s.leads
    const visibleAppointments = isAgent
      ? s.appointments.filter((a) => a.agentId === CURRENT_AGENT_ID)
      : s.appointments

    return {
      role: s.role, isAgent, user,
      leads: s.leads, visibleLeads,
      projects: s.projects,
      appointments: s.appointments, visibleAppointments,
      agents: AGENTS,
      search: s.search, setSearch,
      modal: s.modal, openModal, closeModal,
      addProject, completeAppointment,
    }
  }, [s])
}
