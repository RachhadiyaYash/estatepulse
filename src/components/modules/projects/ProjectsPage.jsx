import { useState } from 'react'
import { Card, CardHeader } from '../../ui/Card'
import { Badge } from '../../ui/Badge'

import { Button, CardAction } from '../../ui/Button'
import { FilterSelect } from '../../ui/Form'
import { useCrmStore } from '../../../store/crmStore'
import { useToast } from '../../../store/useToast'
import { useProperties } from '../../../supabase/services/properties/useProperties'

function Stat({ label, value, valueClass = 'text-on-surface' }) {
  return (
    <div>
      <div className="kicker text-[0.58rem] text-on-surface-muted">{label}</div>
      <div className={`num text-[1.05rem] font-medium ${valueClass}`}>{value}</div>
    </div>
  )
}

export default function ProjectsPage() {
  const { openModal } = useCrmStore()
  const { toast } = useToast()
  const projects = useProperties()
  const [status, setStatus] = useState('')
  const list = projects.filter((p) => !status || p.status === status)

  return (
    <Card>
      <CardHeader
        title="Real Estate Developments & Inventory"
        subtitle="Manage project specifications, available unit inventory, and marketing collateral"
      >
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Ready to Move">Ready to Move</option>
            <option value="Under Construction">Under Construction</option>
            <option value="Pre-Launch">Pre-Launch</option>
          </FilterSelect>
          <Button className="h-8.5" onClick={() => openModal('addProject')}>
            <i className="fas fa-plus" /> Add New Development
          </Button>
        </div>
      </CardHeader>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5 p-6">
        {list.length === 0 && <div className="col-span-full p-8 text-center text-on-surface-muted">No developments match this status.</div>}
        {list.map((p) => (
          <div key={p.id} className="flex flex-col overflow-hidden rounded-lg border border-outline-subtle bg-surface-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div
              className="relative flex h-42.5 flex-col justify-between bg-cover bg-center p-3"
              style={{ backgroundImage: `linear-gradient(180deg, rgba(15,15,16,0.05), rgba(15,15,16,0.55)), url('${p.cover}')` }}
            >
              <Badge tone={p.tone} className="self-start">{p.status}</Badge>
              <span className="num self-start rounded-full bg-black/60 px-3 py-1 text-[0.78rem] font-medium text-white backdrop-blur-sm">{p.priceRange}</span>
            </div>
            <div className="flex flex-1 flex-col p-[1.1rem]">
              <h3 className="text-[1rem] font-extrabold tracking-[-0.03em] text-on-surface">{p.name}</h3>
              <div className="mt-0.5 mb-2 text-[0.76rem] text-on-surface-muted"><i className="fas fa-map-marker-alt" /> {p.location}</div>
              <p className="mb-4 text-[0.78rem] leading-[1.4] text-on-surface-variant">{p.description}</p>

              <div className="mb-4 grid grid-cols-3 gap-2 rounded-md bg-surface-dim p-3">
                <Stat label="Total Units" value={p.totalUnits} />
                <Stat label="Available" value={p.availableUnits} valueClass="text-success" />
                <Stat label="Booked" value={p.bookedUnits} valueClass="text-accent" />
              </div>

              <div className="mb-2 text-[0.74rem] text-on-surface-muted">
                <strong>Configurations:</strong> {p.unitTypes.join(' • ')}
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-outline-subtle pt-3">
                <span className="text-[0.75rem] text-on-surface-muted"><i className="fas fa-calendar-check" /> Possession: {p.completion}</span>
                <CardAction className="px-2.5" onClick={() => toast(`${p.name}: ${p.availableUnits} units available · ${p.priceRange}. Brochure & floor plans ready.`, 'info')}>
                  View Inventory <i className="fas fa-arrow-right" />
                </CardAction>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
