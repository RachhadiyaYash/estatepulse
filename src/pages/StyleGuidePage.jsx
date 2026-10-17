import { useState } from 'react'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge, ScoreBadge, StageBadge } from '../components/ui/Badge'
import { Button, IconButton } from '../components/ui/Button'
import { Field, FormRow, Input, Select, Textarea } from '../components/ui/Form'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { Avatar } from '../components/ui/Avatar'
import ThemeSwitch from '../components/ui/ThemeSwitch'
import { useTheme } from '../components/theme/useTheme'
import { useToast } from '../hooks/useToast'
import { STAGES } from '../data/seed'

// Full class names so Tailwind can generate them
const GROUPS = [
  { title: 'Brand & accent', items: [
    ['brand', 'bg-brand'], ['brand-soft', 'bg-brand-soft'], ['brand-deep', 'bg-brand-deep'],
    ['accent', 'bg-accent'], ['accent-hover', 'bg-accent-hover'], ['accent-soft', 'bg-accent-soft'],
  ] },
  { title: 'Surfaces', items: [
    ['surface-base', 'bg-surface-base'], ['surface-card', 'bg-surface-card'], ['surface-dim', 'bg-surface-dim'],
    ['field-bg', 'bg-field-bg'], ['surface-container-high', 'bg-surface-high'], ['surface-container-highest', 'bg-surface-highest'],
  ] },
  { title: 'Text', items: [
    ['on-surface', 'bg-on-surface'], ['on-surface-variant', 'bg-on-surface-variant'],
    ['on-surface-muted', 'bg-on-surface-muted'], ['on-surface-faint', 'bg-on-surface-faint'],
  ] },
  { title: 'Status & lines', items: [
    ['success', 'bg-success'], ['warning', 'bg-warning'], ['error', 'bg-error'], ['info', 'bg-info'],
    ['stage-contacted', 'bg-stage-contacted'], ['outline', 'bg-outline'], ['outline-subtle', 'bg-outline-subtle'],
  ] },
]

function Swatch({ token, bg }) {
  return (
    <div className="overflow-hidden rounded-md border border-outline-subtle bg-surface-card">
      <div className={`h-14 ${bg}`} />
      <div className="p-2.5">
        <div className="text-[0.74rem] font-bold text-on-surface">{token}</div>
        <div className="num text-[0.68rem] text-on-surface-muted">{bg}</div>
      </div>
    </div>
  )
}

function Section({ title, subtitle, children }) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <div className="p-6">{children}</div>
    </Card>
  )
}

const Sub = ({ children }) => (
  <div className="kicker mt-6 mb-3 text-[0.62rem] text-on-surface-muted first:mt-0">{children}</div>
)

export default function StyleGuidePage() {
  const { mode, resolvedTheme, toggle } = useTheme()
  const { toast } = useToast()
  const [seg, setSeg] = useState('a')

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-outline-subtle bg-surface-card p-6 shadow-sm">
        <div>
          <span className="kicker text-[0.66rem] text-brand-text">Cobalt &amp; Amber</span>
          <h1 className="mt-1 text-[1.8rem] font-extrabold tracking-[-0.04em] text-on-surface">EstatePulse design system</h1>
          <p className="mt-1 text-[0.85rem] text-on-surface-muted">
            Manrope for UI · DM Mono for numbers · theme mode <b className="num">{mode}</b> (showing {resolvedTheme})
          </p>
        </div>
        <ThemeSwitch />
      </div>

      <Section title="Colour" subtitle="Semantic tokens defined in index.css. They flip automatically when the theme changes.">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <Sub>{g.title}</Sub>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
              {g.items.map(([token, bg]) => <Swatch key={token} token={token} bg={bg} />)}
            </div>
          </div>
        ))}
        <Sub>Pipeline stages</Sub>
        <div className="flex flex-wrap gap-3">{STAGES.map((s) => <StageBadge key={s.key} stage={s.key} />)}</div>
      </Section>

      <Section title="Tailwind dark: variant" subtitle="Plain Tailwind palette classes work with dark: because ThemeProvider toggles the dark class on <html>.">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-md bg-red-300 p-4 text-sm font-semibold text-slate-900 dark:bg-red-900 dark:text-red-100">
            bg-red-300 dark:bg-red-900
          </div>
          <div className="rounded-md bg-amber-100 p-4 text-sm font-semibold text-slate-900 dark:bg-slate-800 dark:text-amber-200">
            bg-amber-100 dark:bg-slate-800
          </div>
          <div className="rounded-md bg-surface-card p-4 text-sm font-semibold text-on-surface ring-1 ring-outline">
            bg-surface-card (token, auto-flips)
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={toggle}><i className="fas fa-circle-half-stroke" /> Toggle light / dark</Button>
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-2">
          <div className="text-[2.4rem] leading-tight font-extrabold tracking-[-0.045em]">Display — Manrope 800</div>
          <div className="text-[1.4rem] font-extrabold tracking-[-0.03em]">Heading — Every lead, one pulse</div>
          <div className="text-[0.95rem] text-on-surface-variant">Body — Track inquiries from first call to closing day.</div>
          <div className="text-[0.78rem] text-on-surface-muted">Small — Decision window under 7 days.</div>
          <div className="kicker text-[0.66rem] text-brand-text">Kicker label</div>
          <div className="num text-[1.9rem] font-medium tracking-[-0.03em]">$4,450,000 · DM Mono</div>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button loading>Loading</Button>
          <Button size="sm">Small</Button>
          <IconButton aria-label="Notifications"><i className="far fa-bell" /></IconButton>
        </div>
        <Sub>Segmented control</Sub>
        <SegmentedControl value={seg} onChange={setSeg} options={[
          { value: 'a', label: 'Kanban', icon: 'fa-table-columns' },
          { value: 'b', label: 'Table', icon: 'fa-list' },
        ]} />
      </Section>

      <Section title="Forms">
        <div className="max-w-xl">
          <FormRow>
            <Field label="Full name"><Input placeholder="Jonathan Vance" /></Field>
            <Field label="Stage"><Select>{STAGES.map((s) => <option key={s.key}>{s.label}</option>)}</Select></Field>
          </FormRow>
          <Field label="Notes"><Textarea rows={3} placeholder="Discussion notes…" /></Field>
          <label className="flex items-center gap-2 text-[0.85rem]">
            <input type="checkbox" defaultChecked className="size-4 accent-accent" /> Request VIP chauffeur pickup
          </label>
        </div>
      </Section>

      <Section title="Feedback & data display">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="primary">Primary</Badge><Badge tone="success">Success</Badge><Badge tone="warning">Warning</Badge>
          <Badge tone="orange">Orange</Badge><Badge tone="neutral">Neutral</Badge>
          <ScoreBadge score="HOT" /><ScoreBadge score="WARM" /><ScoreBadge score="COLD" />
        </div>
        <Sub>Toasts</Sub>
        <div className="flex flex-wrap gap-3">
          {['info', 'success', 'warning', 'error', 'primary'].map((t) => (
            <Button key={t} size="sm" variant="secondary" onClick={() => toast(`This is a ${t} toast.`, t)}>{t}</Button>
          ))}
        </div>
        <Sub>Avatars</Sub>
        <div className="flex items-center gap-3">
          <Avatar size="sm">AM</Avatar><Avatar>MV</Avatar>
          <Avatar className="bg-brand text-on-brand">DH</Avatar>
          <Avatar className="bg-brand-deep text-white">ER</Avatar>
          <Avatar className="bg-success text-on-accent">PS</Avatar>
        </div>
      </Section>
    </>
  )
}
