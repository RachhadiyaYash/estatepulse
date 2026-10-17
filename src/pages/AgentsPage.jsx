import { Navigate } from 'react-router-dom'
import { Card, CardHeader } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { useCrm } from '../hooks/useCrm'

const HEADS = ['Agent Name', 'Active Leads', 'Closed Deals', 'Sales Volume', 'Quarterly Quota', 'Attainment']
const TD = 'border-b border-outline-subtle px-5 py-[0.95rem]'

export default function AgentsPage() {
  const { agents, isAgent } = useCrm()
  // the roster is an admin-only screen (nav link is hidden for agents too)
  if (isAgent) return <Navigate to="/" replace />

  return (
    <Card>
      <CardHeader
        title="Real Estate Broker Team & Target Performance"
        subtitle="Monitor individual agent deal velocity, pipeline quota, and assigned lead rosters"
      />
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
            {agents.map((a) => (
              <tr key={a.id} className="transition duration-200 hover:bg-surface-card-hover [&:last-child>td]:border-b-0">
                <td className={TD}>
                  <div className="flex items-center gap-[0.6rem]">
                    <Avatar className={a.avatarClass}>{a.avatar}</Avatar>
                    <div>
                      <div className="font-semibold">{a.name}</div>
                      <div className="text-[0.72rem] text-on-surface-muted">{a.title}</div>
                    </div>
                  </div>
                </td>
                <td className={TD}>{a.activeLeads} Active</td>
                <td className={TD}>{a.dealsClosed} Deals</td>
                <td className={`${TD} font-bold text-accent`}>{a.salesVolume}</td>
                <td className={TD}>{a.target}</td>
                <td className={TD}><Badge tone={a.tone}>{a.label}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
