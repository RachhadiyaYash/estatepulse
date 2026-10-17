import { Avatar } from '../ui/Avatar'
import { Badge, ScoreBadge, StageBadge } from '../ui/Badge'
import LeadQuickActions from './LeadQuickActions'
import { initials } from '../../utils/format'
import { useCrm } from '../../hooks/useCrm'

const HEADS = ['Lead Contact', 'Target Property', 'Budget Range', 'Score', 'Pipeline Stage', 'Assigned Broker', 'Acquisition Channel', 'Quick Actions']
const TD = 'border-b border-outline-subtle px-5 py-[0.95rem]'

export default function LeadsTable({ leads }) {
  const { openModal } = useCrm()
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[0.84rem]">
        <thead>
          <tr>
            {HEADS.map((h) => (
              <th key={h} className="kicker border-b border-outline-subtle bg-surface-dim px-5 py-3 text-[0.6rem] whitespace-nowrap text-on-surface-muted">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 && (
            <tr><td colSpan={8} className="p-8 text-center text-on-surface-muted">No leads match your filter.</td></tr>
          )}
          {leads.map((lead) => (
            <tr key={lead.id} onClick={() => openModal('leadDetail', { leadId: lead.id })}
              className="cursor-pointer transition duration-200 hover:bg-surface-card-hover [&:last-child>td]:border-b-0">
              <td className={TD}>
                <div className="font-semibold text-on-surface">{lead.name}</div>
                <div className="text-[0.72rem] text-on-surface-muted">{lead.phone} • {lead.email}</div>
              </td>
              <td className={TD}><Badge>{lead.projectName}</Badge></td>
              <td className={`${TD} font-semibold text-accent`}>{lead.budget}</td>
              <td className={TD}><ScoreBadge score={lead.score} /></td>
              <td className={TD}><StageBadge stage={lead.stage} /></td>
              <td className={TD}>
                <div className="flex items-center gap-[0.4rem]">
                  <Avatar size="sm" className="bg-brand-deep text-white">{initials(lead.assignedAgentName)}</Avatar>
                  <span className="text-[0.8rem]">{lead.assignedAgentName}</span>
                </div>
              </td>
              <td className={`${TD} text-[0.78rem] text-on-surface-muted`}>{lead.source}</td>
              <td className={TD}><LeadQuickActions lead={lead} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
