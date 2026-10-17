import { STAGES } from '../../data/seed'

const TONES = {
  primary: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  orange: 'bg-brand-soft text-brand-text',
  neutral: 'bg-surface-high text-on-surface-variant',
}

const DOT = {
  new: 'bg-accent',
  contacted: 'bg-stage-contacted',
  site_visit: 'bg-warning',
  negotiation: 'bg-brand',
  won: 'bg-success',
  lost: 'bg-error',
}

const SCORE = {
  HOT: 'bg-error-soft text-error',
  WARM: 'bg-warning-soft text-warning',
  COLD: 'bg-surface-high text-on-surface-variant',
}

export function Badge({ tone = 'primary', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-[0.22rem] text-[0.7rem] font-bold whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function StageDot({ stage, className = '' }) {
  return <span className={`inline-block size-[9px] rounded-full ${DOT[stage]} ${className}`} />
}

export function StageBadge({ stage }) {
  const s = STAGES.find((x) => x.key === stage)
  if (!s) return null
  return (
    <Badge tone={s.badge}>
      <StageDot stage={stage} /> {s.label}
    </Badge>
  )
}

export function ScoreBadge({ score }) {
  return (
    <span
      className={`rounded-full px-2 py-[0.15rem] text-[0.62rem] font-extrabold tracking-[0.06em] whitespace-nowrap uppercase ${SCORE[score]}`}
    >
      {score}
    </span>
  )
}
