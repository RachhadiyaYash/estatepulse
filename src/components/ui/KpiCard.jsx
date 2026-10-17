const TONES = {
  blue: 'bg-accent-soft text-accent',
  orange: 'bg-brand-soft text-brand-text',
  green: 'bg-success-soft text-success',
  slate: 'bg-surface-dim text-on-surface-variant',
}

export default function KpiCard({ title, icon, tone = 'blue', value, valueClass = 'text-on-surface', badgeIcon, badge, footer }) {
  return (
    <div className="flex flex-col rounded-lg border border-outline-subtle bg-surface-card px-5 py-[1.15rem] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-outline hover:shadow-md">
      <div className="mb-[0.9rem] flex items-center justify-between">
        <span className="kicker text-[0.62rem] text-on-surface-muted">{title}</span>
        <div className={`flex size-[34px] items-center justify-center rounded-[10px] text-[0.9rem] ${TONES[tone]}`}>
          <i className={`fas ${icon}`} />
        </div>
      </div>
      <div className={`num mb-[0.6rem] text-[1.9rem] leading-[1.1] font-medium tracking-[-0.03em] ${valueClass}`}>{value}</div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.74rem] text-on-surface-muted">
        <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-[0.15rem] font-bold text-success">
          <i className={`fas ${badgeIcon}`} /> {badge}
        </span>
        <span>{footer}</span>
      </div>
    </div>
  )
}
