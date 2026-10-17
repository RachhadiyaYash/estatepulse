import { Badge } from '../ui/Badge'
import { Button, CardAction } from '../ui/Button'
import { useCrm } from '../../hooks/useCrm'

export default function AppointmentItem({ apt, compact = false }) {
  const { completeAppointment } = useCrm()
  const done = apt.status === 'Completed'

  return (
    <div
      className={`flex flex-wrap items-center gap-4 rounded-md border border-outline-subtle bg-surface-card p-4 transition duration-200 hover:border-outline ${
        done ? 'opacity-75' : ''
      }`}
    >
      <div className="flex min-w-[88px] flex-col items-center rounded-md bg-surface-dim px-3 py-2 text-center">
        <span className="num text-[0.82rem] font-semibold text-accent">{apt.time}</span>
        <span className="text-[0.66rem] font-semibold text-on-surface-muted">
          {compact ? apt.displayDate.split(',')[0] : apt.displayDate}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h4 className="text-[0.88rem] font-bold text-on-surface">{apt.title}</h4>
          {!compact && (
            <>
              <Badge tone={done ? 'success' : 'primary'}>{apt.status}</Badge>
              {apt.pickupRequired && (
                <Badge tone="warning"><i className="fas fa-car" /> VIP Chauffeur Pickup</Badge>
              )}
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.74rem] text-on-surface-muted">
          <span><i className="fas fa-user" /> {compact ? '' : <strong>Client: </strong>}{apt.clientName}{!compact && ` (${apt.clientPhone})`}</span>
          <span><i className="fas fa-building" /> {compact ? '' : <strong>Property: </strong>}{apt.projectName}</span>
          <span><i className="fas fa-user-tie" /> {compact ? '' : <strong>Agent: </strong>}{apt.agentName}</span>
          {!compact && <span><i className="fas fa-tag" /> {apt.type}</span>}
        </div>
        {!compact && apt.pickupLocation && (
          <div className="mt-1.5 text-[0.72rem] text-brand-text">
            <i className="fas fa-map-pin" /> Pickup address: {apt.pickupLocation}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!done ? (
          compact ? (
            <CardAction className="px-2" title="Mark Completed" onClick={() => completeAppointment(apt.id)}>
              <i className="fas fa-check" /> Done
            </CardAction>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => completeAppointment(apt.id)}>
              <i className="fas fa-check" /> Mark Complete
            </Button>
          )
        ) : compact ? (
          <Badge tone="success"><i className="fas fa-check-circle" /> Done</Badge>
        ) : (
          <span className="text-[0.78rem] font-semibold text-success"><i className="fas fa-check-double" /> Finished</span>
        )}
      </div>
    </div>
  )
}
