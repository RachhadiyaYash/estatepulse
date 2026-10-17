import { useMemo, useState, useEffect } from 'react'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { FilterSelect } from '../components/ui/Form'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { StageDot } from '../components/ui/Badge'
import LeadCard from '../components/leads/LeadCard'
import LeadsTable from '../components/leads/LeadsTable'
import { STAGES } from '../data/seed'
import { useCrm } from '../hooks/useCrm'
import { getLeads, deserializeLead } from '../supabase/services/leads/leads'

export default function LeadsPage() {
  const { agents, search, openModal } = useCrm()
  const [leads, setLeads] = useState([])
  const [view, setView] = useState('kanban')
  const [stage, setStage] = useState('')
  const [score, setScore] = useState('')
  const [agent, setAgent] = useState('')

  useEffect(() => {
    const loadLeads = async () => {
      try {
        const rows = await getLeads()
        setLeads((rows ?? []).map(deserializeLead))
      } catch (err) {
        console.error('Failed to load leads:', err)
        setLeads([])
      }
    }
    loadLeads()
  }, [])

  const q = search.trim().toLowerCase()

  const filtered = useMemo(
    () =>
      leads.filter(
        (l) =>
          (!stage || l.stage === stage) &&
          (!score || l.score === score) &&
          (!agent || l.assignedAgentId === agent) &&
          (!q ||
            l.name.toLowerCase().includes(q) ||
            l.projectName.toLowerCase().includes(q) ||
            l.phone.includes(q) ||
            l.email.toLowerCase().includes(q)),
      ),
    [leads, stage, score, agent, q],
  )

  // a global search always shows results as a table
  const activeView = q ? 'table' : view

  return (
    <Card>
      <CardHeader
        title="Leads Pipeline & Relationship Manager"
        subtitle="Track prospective buyers through qualification, site tours, and negotiations"
      >
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="">All Stages</option>
            {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </FilterSelect>
          <FilterSelect value={score} onChange={(e) => setScore(e.target.value)}>
            <option value="">All Scores</option>
            <option value="HOT">Hot Lead</option>
            <option value="WARM">Warm Lead</option>
            <option value="COLD">Cold Lead</option>
          </FilterSelect>
          <FilterSelect value={agent} onChange={(e) => setAgent(e.target.value)}>
            <option value="">All Agents</option>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </FilterSelect>
          <SegmentedControl
            value={activeView}
            onChange={setView}
            options={[
              { value: 'kanban', label: 'Kanban', icon: 'fa-table-columns' },
              { value: 'table', label: 'Table', icon: 'fa-list' },
            ]}
          />
          <Button className="h-[34px]" onClick={() => openModal('addLead')}>
            <i className="fas fa-plus" /> Add Lead
          </Button>
        </div>
      </CardHeader>

      {activeView === 'kanban' ? (
        <div className="grid auto-cols-[minmax(260px,1fr)] grid-flow-col gap-4 overflow-x-auto p-4">
          {STAGES.map((s) => {
            const items = filtered.filter((l) => l.stage === s.key)
            return (
              <div key={s.key} className="flex min-h-[320px] flex-col rounded-lg border border-outline-subtle bg-surface-dim">
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2 text-[0.8rem] font-extrabold text-on-surface">
                    <StageDot stage={s.key} /> <span>{s.column}</span>
                  </div>
                  <span className="num rounded-full border border-outline-subtle bg-surface-card px-2 py-[0.1rem] text-[0.7rem] text-on-surface-variant">
                    {items.length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-[0.7rem] overflow-y-auto px-3 pb-3">
                  {items.length === 0 && (
                    <div className="py-6 text-center text-[0.75rem] text-on-surface-faint">No leads in stage</div>
                  )}
                  {items.map((l) => <LeadCard key={l.id} lead={l} />)}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <LeadsTable leads={filtered} />
      )}
    </Card>
  )
}
