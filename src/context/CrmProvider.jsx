import { useCallback, useEffect, useMemo, useState } from 'react'
import { CrmContext } from './CrmContext'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import {
  AGENTS, APPOINTMENTS, CURRENT_AGENT_ID, PROJECTS, STAGE_NAMES, USERS,
} from '../data/seed'
import {
  getLeads as fetchLeads,
  addLead as createLead,
  deserializeLead,
  serializeLead,
} from '../supabase/services/leads/leads'

const uid = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`

export default function CrmProvider({ children }) {
  const { toast } = useToast()
  const { session } = useAuth()

  const [role, setRole] = useState(session?.role === 'agent' ? 'agent' : 'admin')
  const [leads, setLeads] = useState([])
  const [projects, setProjects] = useState(PROJECTS)
  const [appointments, setAppointments] = useState(APPOINTMENTS)
  const [search, setSearch] = useState('')

  // modal state lives here because modals open from the header, sidebar and several pages
  const [modal, setModal] = useState({ name: null, payload: null })
  const openModal = useCallback((name, payload = null) => setModal({ name, payload }), [])
  const closeModal = useCallback(() => setModal({ name: null, payload: null }), [])

  const isAgent = role === 'agent'
  const user = isAgent ? USERS.agent : USERS.admin

  const visibleLeads = useMemo(
    () => (isAgent ? leads.filter((l) => l.assignedAgentId === CURRENT_AGENT_ID) : leads),
    [isAgent, leads],
  )
  const visibleAppointments = useMemo(
    () => (isAgent ? appointments.filter((a) => a.agentId === CURRENT_AGENT_ID) : appointments),
    [isAgent, appointments],
  )

  // Load leads from the public.leads Supabase table on mount
  useEffect(() => {
    const loadLeads = async () => {
      try {
        const rows = await fetchLeads()
        setLeads((rows ?? []).map(deserializeLead))
      } catch (err) {
        toast(`Failed to load leads from Supabase: ${err.message}`, 'error')
        setLeads([])
      }
    }
    loadLeads()
  }, [toast])

  const toggleRole = useCallback(() => {
    const next = role === 'admin' ? 'agent' : 'admin'
    setRole(next)
    toast(`Switched view to ${next.toUpperCase()} mode.`, 'primary')
  }, [role, toast])

  const addLead = useCallback(
    async (form) => {
      const project = projects.find((p) => p.id === form.projectId)
      const agent = AGENTS.find((a) => a.id === form.agentId)
      const row = serializeLead(form, {
        projectName: project ? project.name : 'General Inquiry',
        agentName: agent ? agent.name : null,
      })
      const created = await createLead(row)
      const lead = deserializeLead(created)
      setLeads((all) => [lead, ...all])
      toast(`Lead for ${form.name} created and assigned!`, 'success')
      return lead
    },
    [projects, toast],
  )

  const addProject = useCallback(
    (form) => {
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
        unitTypes: ['2 BHK Luxury', '3 BHK Sky Penthouse'],
      }
      setProjects((p) => [project, ...p])
      toast(`Project "${form.name}" added to inventory portfolio!`, 'success')
    },
    [toast],
  )

  const addAppointment = useCallback(
    (form) => {
      const lead = leads.find((l) => l.id === form.leadId)
      const project = projects.find((p) => p.id === form.projectId)
      const day = form.date ? form.date.split('-')[2] : null
      const apt = {
        id: uid('apt'),
        title: `${project ? project.name : 'Property'} ${form.type}`,
        leadId: lead ? lead.id : 'lead-custom',
        clientName: lead ? lead.name : 'Direct Client',
        clientPhone: lead ? lead.phone : '+1 (555) 000-0000',
        projectId: project ? project.id : 'proj-1',
        projectName: project ? project.name : 'Selected Property',
        agentId: isAgent ? 'agent-1' : 'agent-2',
        agentName: isAgent ? USERS.agent.name : 'Elena Rostova',
        date: form.date || '2026-10-06',
        displayDate: day ? `Oct ${Number(day)}` : 'Upcoming',
        time: form.time || '02:00 PM',
        type: form.type,
        status: 'Scheduled',
        pickupRequired: form.pickup,
        pickupLocation: form.pickup ? 'Client Home/Office' : null,
      }
      setAppointments((a) => [apt, ...a])
      if (lead) {
        setLeads((all) =>
          all.map((l) =>
            l.id === lead.id
              ? {
                  ...l,
                  stage: 'site_visit',
                  timeline: [
                    {
                      type: 'Site Visit Booked',
                      timestamp: 'Just now',
                      agent: user.name,
                      note: `Booked ${form.type} on ${form.date} at ${form.time}.${form.notes ? ` Notes: ${form.notes}` : ''}`,
                    },
                    ...l.timeline,
                  ],
                }
              : l,
          ),
        )
      }
      toast('Site visit appointment scheduled successfully!', 'success')
    },
    [isAgent, leads, projects, toast, user.name],
  )

  const updateLeadStage = useCallback(
    (leadId, newStage) => {
      setLeads((all) =>
        all.map((l) => {
          if (l.id !== leadId || l.stage === newStage) return l
          return {
            ...l,
            stage: newStage,
            timeline: [
              {
                type: 'Stage Changed',
                timestamp: 'Just now',
                agent: user.name,
                note: `Pipeline stage moved from ${STAGE_NAMES[l.stage]} to ${STAGE_NAMES[newStage]}.`,
              },
              ...l.timeline,
            ],
          }
        }),
      )
      toast(`Lead moved to ${STAGE_NAMES[newStage]}`, 'info')
    },
    [toast, user.name],
  )

  const addFollowup = useCallback(
    (leadId, { type, note, stage }) => {
      setLeads((all) =>
        all.map((l) =>
          l.id === leadId
            ? {
                ...l,
                stage: stage || l.stage,
                lastContacted: 'Just now',
                timeline: [{ type, timestamp: 'Just now', agent: user.name, note }, ...l.timeline],
              }
            : l,
        ),
      )
      toast('Follow-up activity logged successfully!', 'success')
    },
    [toast, user.name],
  )

  const completeAppointment = useCallback(
    (aptId) => {
      setAppointments((all) => all.map((a) => (a.id === aptId ? { ...a, status: 'Completed' } : a)))
      toast('Appointment marked as Completed!', 'success')
    },
    [toast],
  )

  const value = useMemo(
    () => ({
      role, isAgent, user, toggleRole,
      leads, visibleLeads, projects, appointments, visibleAppointments, agents: AGENTS,
      search, setSearch,
      modal, openModal, closeModal,
      addLead, addProject, addAppointment, updateLeadStage, addFollowup, completeAppointment,
    }),
    [
      role, isAgent, user, toggleRole, leads, visibleLeads, projects, appointments,
      visibleAppointments, search, modal, openModal, closeModal,
      addLead, addProject, addAppointment, updateLeadStage, addFollowup, completeAppointment,
    ],
  )

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>
}
