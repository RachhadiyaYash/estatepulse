import { useMemo, useState } from 'react'
import { Card, CardHeader } from '../components/ui/Card'
import { Button, CardAction } from '../components/ui/Button'
import AppointmentItem from '../components/appointments/AppointmentItem'
import { useCrm } from '../hooks/useCrm'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const pad = (n) => String(n).padStart(2, '0')
const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`

function buildGrid(year, month) {
  const first = new Date(year, month, 1).getDay()
  const total = new Date(year, month + 1, 0).getDate()
  const prevTotal = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = first - 1; i >= 0; i--) cells.push({ day: prevTotal - i, other: true })
  for (let d = 1; d <= total; d++) cells.push({ day: d, date: iso(year, month, d) })
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - first - total + 1, other: true })
  return cells
}

function MiniCalendar({ appointments, selected, onSelect }) {
  const now = new Date()
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate())
  const eventDays = useMemo(() => new Set(appointments.map((a) => a.date)), [appointments])
  const cells = useMemo(() => buildGrid(cursor.y, cursor.m), [cursor])

  const shift = (delta) =>
    setCursor(({ y, m }) => {
      const d = new Date(y, m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })

  const label = new Date(cursor.y, cursor.m, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="rounded-lg border border-outline-subtle bg-surface-dim p-5 self-start">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[0.95rem] font-bold text-on-surface">{label}</h3>
        <div className="flex gap-1">
          <CardAction aria-label="Previous month" onClick={() => shift(-1)}><i className="fas fa-chevron-left" /></CardAction>
          <CardAction aria-label="Next month" onClick={() => shift(1)}><i className="fas fa-chevron-right" /></CardAction>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DAYS.map((d) => (
          <div key={d} className="py-1 text-[0.68rem] font-bold text-on-surface-muted">{d}</div>
        ))}
        {cells.map((c, i) => {
          if (c.other) {
            return <div key={i} className="num py-2 text-[0.78rem] opacity-30">{c.day}</div>
          }
          const isSel = selected === c.date
          const hasEvent = eventDays.has(c.date)
          const isToday = c.date === todayIso
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(isSel ? null : c.date)}
              className={`num relative rounded-sm py-2 text-[0.78rem] transition duration-200 ${
                isSel
                  ? 'bg-accent font-bold text-on-accent'
                  : isToday
                    ? 'border border-accent text-accent'
                    : 'text-on-surface hover:bg-surface-card'
              }`}
            >
              {c.day}
              {hasEvent && (
                <span className={`absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full ${isSel ? 'bg-on-accent' : 'bg-brand'}`} />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-6 border-t border-outline-subtle pt-4">
        <div className="mb-2 text-[0.78rem] font-semibold text-on-surface-muted">QUICK STATS</div>
        <div className="mb-1 flex justify-between text-[0.8rem]">
          <span>Visits This Week:</span><strong className="text-accent">8 Tours</strong>
        </div>
        <div className="flex justify-between text-[0.8rem]">
          <span>Show-up Rate:</span><strong className="text-success">94.2%</strong>
        </div>
      </div>
    </div>
  )
}

export default function AppointmentsPage() {
  const { visibleAppointments, openModal } = useCrm()
  const [selected, setSelected] = useState(null)
  const list = selected ? visibleAppointments.filter((a) => a.date === selected) : visibleAppointments

  return (
    <Card>
      <CardHeader
        title="Site Visits & Client Consultations"
        subtitle="Schedule escorted luxury property tours, chauffeur pickups, and meeting agendas"
      >
        <Button className="h-[34px]" onClick={() => openModal('bookAppointment')}>
          <i className="fas fa-calendar-plus" /> Schedule New Tour
        </Button>
      </CardHeader>

      <div className="grid gap-6 p-6 lg:grid-cols-[320px_1fr]">
        <MiniCalendar appointments={visibleAppointments} selected={selected} onSelect={setSelected} />
        <div className="flex flex-col gap-3">
          {list.length === 0 && (
            <div className="p-8 text-center text-on-surface-muted">
              {selected ? 'No site visits on this day.' : 'No site visits recorded.'}
            </div>
          )}
          {list.map((apt) => <AppointmentItem key={apt.id} apt={apt} />)}
        </div>
      </div>
    </Card>
  )
}
