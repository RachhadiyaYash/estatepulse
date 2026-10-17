import { Card } from '../../ui/Card'
import { FUNNEL, LEAD_SOURCES } from '../../../data/seed'

// full class names so Tailwind can see them
const FUNNEL_STYLE = {
  accent: { border: 'border-l-accent', text: 'text-accent' },
  'stage-contacted': { border: 'border-l-stage-contacted', text: 'text-stage-contacted' },
  warning: { border: 'border-l-warning', text: 'text-warning' },
  success: { border: 'border-l-success', text: 'text-success' },
}

function Panel({ title, children }) {
  return (
    <div className="rounded-lg border border-outline-subtle bg-surface-dim p-5">
      <h3 className="mb-4 text-[0.95rem] font-bold text-on-surface">{title}</h3>
      {children}
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <Card className="p-6">
      <h2 className="mb-1 font-extrabold tracking-[-0.03em] text-on-surface">Sales Intelligence & Pipeline Analytics</h2>
      <p className="mb-6 text-[0.8rem] text-on-surface-muted">
        Real-time conversion velocity, source attribution, and revenue forecast.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Lead Acquisition by Source">
          {LEAD_SOURCES.map((s) => (
            <div key={s.label} className="mb-4 last:mb-0">
              <div className="mb-1.5 flex justify-between text-[0.8rem] text-on-surface-variant">
                <span>{s.label}</span>
                <strong className="text-on-surface">{s.value}</strong>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-high">
                <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Pipeline Conversion Funnel">
          <div className="flex flex-col gap-[0.6rem]">
            {FUNNEL.map((f) => (
              <div
                key={f.label}
                className={`flex items-center justify-between rounded-md border border-l-4 border-outline-subtle bg-surface-card px-4 py-3 text-[0.82rem] ${FUNNEL_STYLE[f.color].border}`}
              >
                <span className="text-on-surface-variant">{f.label}</span>
                <strong className={`num ${FUNNEL_STYLE[f.color].text}`}>{f.value}</strong>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </Card>
  )
}
